'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type ViewType = 'conversations' | 'chat' | 'contacts';

export interface Position {
  x: number;
  y: number;
}

export interface Profile {
  id: string;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  avatar_url: string | null;
  username: string | null;
  telefone: string | null;
  status?: string;
  last_seen_at?: string;
  empresa?: string | null;
  role?: string;
  display_name?: string;
}

export interface Message {
  id: string;
  content: string;
  created_at: string | Date;
  conversation_id: string;
  sender_id: string;
  read_by_receiver: boolean;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'error';
  retryCount: number;
  profiles?: Profile;
}

export interface Conversation {
  id: string;
  other_user?: Profile | null;
  updated_at: string | Date;
  unread_count: number;
}

export interface ChatStore {
  // UI State
  isOpen: boolean;
  position: Position;
  isMinimized: boolean;
  isDragging: boolean;
  dragOffset: Position;
  isMobile: boolean;
  currentView: ViewType;
  showConversationMenu: string | null;
  userId: string | null;

  // Chat State
  selectedConversation: Conversation | null;
  messageText: string;
  isRefreshing: boolean;
  isSending: boolean;

  // Search & Pagination
  searchTerm: string;
  contactsPage: number;
  contactsSearch: string;

  // Data (normalized)
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  contacts: Profile[];
  currentUser: Profile | null;

  // Loading States
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingContacts: boolean;

  // UI Actions
  setIsOpen: (isOpen: boolean) => void;
  setPosition: (position: Position) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  toggleMinimize: () => void;
  setIsDragging: (isDragging: boolean) => void;
  setDragOffset: (dragOffset: Position) => void;
  setIsMobile: (isMobile: boolean) => void;
  setCurrentView: (view: ViewType) => void;
  setShowConversationMenu: (conversationId: string | null) => void;
  setUserId: (userId: string | null) => void;

  // Chat Actions
  setSelectedConversation: (conversation: Conversation | null) => void;
  setMessageText: (text: string) => void;
  setIsSending: (isSending: boolean) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;

  // Search & Pagination
  setSearchTerm: (term: string) => void;
  setContactsPage: (page: number) => void;
  setContactsSearch: (search: string) => void;

  // Data Actions
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (
    conversationId: string,
    messageId: string,
    status: Message['status']
  ) => void;
  setContacts: (contacts: Profile[]) => void;
  setCurrentUser: (user: Profile | null) => void;

  // Loading Actions
  setIsLoadingConversations: (loading: boolean) => void;
  setIsLoadingMessages: (loading: boolean) => void;
  setIsLoadingContacts: (loading: boolean) => void;

  // Batch Operations
  reset: () => void;
}

const initialState = {
  isOpen: false,
  position: { x: 0, y: 0 },
  isMinimized: false,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  isMobile: false,
  currentView: 'conversations' as ViewType,
  showConversationMenu: null,
  userId: null,
  selectedConversation: null,
  messageText: '',
  isRefreshing: false,
  isSending: false,
  searchTerm: '',
  contactsPage: 1,
  contactsSearch: '',
  conversations: [],
  messages: {},
  contacts: [],
  currentUser: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isLoadingContacts: false,
};

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // UI Actions
        setIsOpen: (isOpen) => set({ isOpen }),
        setPosition: (position) => set({ position }),
        setIsMinimized: (isMinimized) => set({ isMinimized }),
        toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
        setIsDragging: (isDragging) => set({ isDragging }),
        setDragOffset: (dragOffset) => set({ dragOffset }),
        setIsMobile: (isMobile) => set({ isMobile }),
        setCurrentView: (view) => set({ currentView: view }),
        setShowConversationMenu: (conversationId) =>
          set({ showConversationMenu: conversationId }),
        setUserId: (userId) => set({ userId }),

        // Chat Actions
        setSelectedConversation: (conversation) =>
          set({ selectedConversation: conversation }),
        setMessageText: (text) => set({ messageText: text }),
        setIsSending: (isSending) => set({ isSending }),
        setIsRefreshing: (isRefreshing) => set({ isRefreshing }),

        // Search & Pagination
        setSearchTerm: (term) => set({ searchTerm: term }),
        setContactsPage: (page) => set({ contactsPage: page }),
        setContactsSearch: (search) => set({ contactsSearch: search }),

        // Data Actions
        setConversations: (conversations) => set({ conversations }),
        setMessages: (conversationId, messages) =>
          set((state) => ({
            messages: { ...state.messages, [conversationId]: messages },
          })),
        addMessage: (conversationId, message) =>
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: [
                ...(state.messages[conversationId] || []),
                message,
              ],
            },
          })),
        updateMessageStatus: (conversationId, messageId, status) =>
          set((state) => ({
            messages: {
              ...state.messages,
              [conversationId]: (state.messages[conversationId] || []).map(
                (msg) =>
                  msg.id === messageId ? { ...msg, status, retryCount: 0 } : msg
              ),
            },
          })),
        setContacts: (contacts) => set({ contacts }),
        setCurrentUser: (user) => set({ currentUser: user }),

        // Loading Actions
        setIsLoadingConversations: (loading) =>
          set({ isLoadingConversations: loading }),
        setIsLoadingMessages: (loading) =>
          set({ isLoadingMessages: loading }),
        setIsLoadingContacts: (loading) =>
          set({ isLoadingContacts: loading }),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          position: state.position,
          isMinimized: state.isMinimized,
          messageText: state.messageText,
          searchTerm: state.searchTerm,
          contactsSearch: state.contactsSearch,
        }),
      }
    )
  )
);
