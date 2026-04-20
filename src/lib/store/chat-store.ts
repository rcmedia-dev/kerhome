import { create } from 'zustand';
import { pusherClient } from '@/lib/pusher-client';

export interface Profile {
    id: string;
    primeiro_nome: string | null;
    ultimo_nome: string | null;
    email: string | null;
    avatar_url: string | null;
}

export interface Message {
    id: string;
    content: string;
    created_at: string;
    conversation_id: string;
    sender_id: string;
    profiles?: Profile;
    attachment_url?: string;
    attachment_type?: 'image' | 'document';
    sender_type?: 'personal' | 'agency';
    sender_agency_id?: string;
    agency?: {
        nome: string;
        logo: string | null;
    };
}

export interface Conversation {
    id: string;
    updated_at: string;
    user1_id: string;
    user2_id: string;
    target_type: 'agent' | 'agency';
    imobiliaria_id?: string | null;
    status: 'open' | 'claimed' | 'closed';
    other_user?: Profile;
    agency_details?: {
        nome: string;
        logo: string | null;
    };
    last_message?: {
        content: string;
        created_at: string;
        sender_id: string;
    };
    unread_count?: number;
}

interface ChatState {
    isOpen: boolean;
    view: 'list' | 'chat' | 'search';
    activeConversationId: string | null;
    activeProfile: Profile | null; // The user we are talking to
    conversations: Conversation[];
    messages: Message[];
    typingUsers: Record<string, string[]>; // conversationId -> userNames[]
    isLoading: boolean;
    isInitialized: boolean;

    // Computed
    totalUnreadCount: number;

    // Actions
    initializeChat: (userId: string) => Promise<void>;

    toggleChat: () => void;
    setIsOpen: (isOpen: boolean) => void;
    setView: (view: 'list' | 'chat' | 'search') => void;
    openChat: (conversationId: string, profile?: Profile | null) => void;
    backToList: () => void;

    addMessage: (message: Message) => void;
    fetchMessages: (conversationId: string) => Promise<void>;

    fetchConversations: (userId: string) => Promise<void>;
    createConversation: (params: {
        myId: string;
        targetId: string;
        targetType?: 'agent' | 'agency';
        imobiliariaId?: string;
    }) => Promise<Conversation | null>;
    markAsRead: (conversationId: string, userId: string) => Promise<void>;

    subscribeToConversation: (conversationId: string) => void;
    unsubscribeFromConversation: (conversationId: string) => void;
    checkExistingConversation: (user1Id: string, user2Id: string, targetType?: 'agent' | 'agency') => Promise<string | null>;
    setTyping: (conversationId: string, userName: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    isOpen: false,
    view: 'list',
    activeConversationId: null,
    activeProfile: null,
    conversations: [],
    messages: [],
    typingUsers: {},
    isLoading: false,
    isInitialized: false,
    totalUnreadCount: 0,

    initializeChat: async (userId: string) => {
        // Prevent double init/subscription
        if (get().isInitialized) return;

        // Fetch conversations initially
        await get().fetchConversations(userId);

        set({ isInitialized: true });

        // Subscribe to ALL conversation channels for notifications while chat is closed or in list view
        // Note: Ideally we'd have a private-user-channel for new conversation alerts,
        // but here we can just iterate known conversations.
        // Real implementation would want a dynamic "user channel" to hear about NEW conversations too.
        const conversations = get().conversations;
        conversations.forEach(c => {
            const channel = pusherClient.subscribe(`chat-${c.id}`);
            channel.bind('new-message', (msg: Message) => {
                // If we are already in this chat, add message to list
                if (get().activeConversationId === c.id) {
                    get().addMessage(msg);
                } else {
                    // Otherwise just update conversation snippet and unread count
                    set(state => {
                        const updatedConvs = state.conversations.map(conv => {
                            if (conv.id === c.id) {
                                return {
                                    ...conv,
                                    last_message: {
                                        content: msg.content,
                                        created_at: msg.created_at,
                                        sender_id: msg.sender_id
                                    },
                                    unread_count: (conv.unread_count || 0) + (msg.sender_id !== userId ? 1 : 0), // Increment only if not me
                                    updated_at: msg.created_at // Bump to top
                                };
                            }
                            return conv;
                        }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

                        // Recalculate total
                        const total = updatedConvs.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);

                        return { conversations: updatedConvs, totalUnreadCount: total };
                    });
                }
            });
            channel.bind('typing', (data: { userName: string, isTyping: boolean }) => {
                set(state => {
                    const currentTyping = state.typingUsers[c.id] || [];
                    const newTyping = data.isTyping 
                        ? [...new Set([...currentTyping, data.userName])]
                        : currentTyping.filter(name => name !== data.userName);
                    
                    return {
                        typingUsers: {
                            ...state.typingUsers,
                            [c.id]: newTyping
                        }
                    };
                });
            });
        });
    },

    toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    setIsOpen: (isOpen: boolean) => set({ isOpen }),
    setView: (view) => set({ view }),

    openChat: (conversationId, profile = null) => {
        let targetProfile = profile;
        if (!targetProfile) {
            const conv = get().conversations.find(c => c.id === conversationId);
            if (conv?.other_user) targetProfile = conv.other_user;
        }

        // Reset unread count for this conversation
        set((state) => {
            const updatedConvs = state.conversations.map(c => {
                if (c.id === conversationId) return { ...c, unread_count: 0 };
                return c;
            });
            const total = updatedConvs.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);
            return {
                conversations: updatedConvs,
                totalUnreadCount: total,
                activeConversationId: conversationId,
                activeProfile: targetProfile,
                view: 'chat',
                messages: [],
                isOpen: true // Automatically open the chat window
            };
        });

        get().fetchMessages(conversationId);
        // Explicit subscribe is redundant if we subscribe globally, but harmless for focus logic
    },

    backToList: () => {
        set({ view: 'list', activeConversationId: null, activeProfile: null });
        // Re-fetch to ensure sync? Or trust local state. Local state is updated by pusher listener above.
    },

    markAsRead: async (conversationId: string, userId: string) => {
        // Optimistically update local state
        set(state => {
            const updatedConvs = state.conversations.map(c => {
                if (c.id === conversationId) return { ...c, unread_count: 0 };
                return c;
            });
            const total = updatedConvs.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);
            return { conversations: updatedConvs, totalUnreadCount: total };
        });

        // Call API
        try {
            await fetch('/api/conversations/read', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation_id: conversationId, user_id: userId })
            });
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    },

    addMessage: (message: Message) => set((state) => {
        // Prevent duplicates (Real vs Real)
        if (state.messages.some(m => m.id === message.id)) return state;

        // Prevent duplicates (Optimistic vs Real)
        // If we have a temp message that matches the content/sender of this new real message, remove the temp one.
        // This is a heuristic. Ideally we'd map tempId -> realId. 
        // But simply filtering out "temp-" messages that look identical or just assuming the newest real one replaces the pending one works for simple cases.
        // Better yet: ChatWindow handles the "success" by swapping. 
        // Here we just accept the real one.
        // But if we want to auto-remove the temp one:
        const isSelf = message.sender_id === (state.activeProfile ? '...' : message.sender_id); // we don't know "my id" easily here without storing it.
        // Let's iterate and remove any temp message if we receive a real message from SAME sender with SAME content created RECENTLY.
        // Actually, let's keep it simple: The ChatWindow triggers the replacement on API success.
        // BUT Pusher might arrive first.
        // If Pusher arrives, we add the Real message.
        // The Temp message is still there. We have 2 messages.
        // We need to filter out the Temp message if we find a matching Real message?
        // Let's filter out any message starting with 'temp-' that has the same content.

        const filteredMessages = state.messages.filter(m => {
            if (m.id.startsWith('temp-') && m.content === message.content && m.sender_id === message.sender_id) {
                return false; // Remove the temp version
            }
            return true;
        });

        return { messages: [...filteredMessages, message] };
    }),

    fetchMessages: async (conversationId) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`/api/messages?conversation_id=${conversationId}`);
            if (response.ok) {
                const data = await response.json();
                set({ messages: data.messages || [] });
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchConversations: async (userId) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`/api/conversations?user_id=${userId}`);
            if (response.ok) {
                const data = await response.json();
                const convs: Conversation[] = data.conversations || [];
                const total = convs.reduce((acc, curr) => acc + (curr.unread_count || 0), 0);
                set({ conversations: convs, totalUnreadCount: total });
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            set({ isLoading: false });
        }
    },


    createConversation: async ({ myId, targetId, targetType = 'agent', imobiliariaId }) => {
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: myId,
                    target_user_id: targetId,
                    target_type: targetType,
                    imobiliaria_id: imobiliariaId
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.created) {
                    await get().fetchConversations(myId);
                }
                return data.conversation;
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        }
        return null;
    },


    subscribeToConversation: (conversationId) => {
        // Legacy single subscription - handled by initializeChat now
    },

    unsubscribeFromConversation: (conversationId) => {
        // Legacy
    },

    checkExistingConversation: async (user1Id, user2Id, targetType = 'agent') => {
        // 1. Check local state first
        const localConv = get().conversations.find(c => {
            if (targetType === 'agency') {
                return (c.user1_id === user1Id || c.user2_id === user1Id) && c.target_type === 'agency';
            }
            return (
                ((c.user1_id === user1Id && c.user2_id === user2Id) ||
                (c.user1_id === user2Id && c.user2_id === user1Id)) &&
                c.target_type !== 'agency'
            );
        });
        if (localConv) return localConv.id;

        // 2. Fetch from API if not found (in case it wasn't loaded yet)
        try {
            // ... simple check via conversations list
            if (!get().isInitialized) {
                await get().fetchConversations(user1Id);
                const freshLocal = get().conversations.find(c => {
                    if (targetType === 'agency') {
                        return (c.user1_id === user1Id || c.user2_id === user1Id) && c.target_type === 'agency';
                    }
                    return (
                        ((c.user1_id === user1Id && c.user2_id === user2Id) ||
                        (c.user1_id === user2Id && c.user2_id === user1Id)) &&
                        c.target_type !== 'agency'
                    );
                });
                if (freshLocal) return freshLocal.id;
            }

            return null;
        } catch (error) {
            console.error("Error checking conversation", error);
            return null;
        }
    },

    setTyping: (conversationId, userName, isTyping) => {
        // Just trigger the event via API
        fetch('/api/messages/typing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation_id: conversationId, user_name: userName, is_typing: isTyping })
        }).catch(e => console.error("Failed to send typing status", e));
    }
}));

