import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Send, X, Smile, Paperclip, ArrowLeft, UserCircle } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat-store';
import { useUserStore } from '@/lib/store/user-store';

import { MessageBubble } from './message-bubble';
import { toast } from 'sonner';

interface ChatWindowProps {
    onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
    const {
        messages,
        activeConversationId,
        activeProfile,
        conversations,
        fetchMessages,
        addMessage,
        backToList,
        markAsRead,
        setTyping,
        typingUsers
    } = useChatStore();
    const { user } = useUserStore();
    const [inputValue, setInputValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Mark as read when opening or when new messages arrive while open
        if (activeConversationId && user?.id) {
            markAsRead(activeConversationId, user.id);
        }
    }, [messages, activeConversationId, user?.id, markAsRead]);

    // Fetch
    useEffect(() => {
        if (activeConversationId) {
            fetchMessages(activeConversationId);
        }
    }, [activeConversationId]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !activeConversationId) return;

        // Determine type
        const isImage = file.type.startsWith('image/');
        const type = isImage ? 'image' : 'document';

        const toastId = toast.loading('Enviando arquivo...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const { publicUrl } = await response.json();

            // Send message with attachment
            await sendMessage(file.name, publicUrl, type);

            toast.dismiss(toastId);
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Erro ao enviar arquivo', { id: toastId });
        }
    };

    const sendMessage = async (content: string, attachmentUrl?: string, attachmentType?: 'image' | 'document') => {
        if (!user || !activeConversationId) return;

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        addMessage({
            id: tempId,
            content: content,
            created_at: new Date().toISOString(),
            sender_id: user.id,
            conversation_id: activeConversationId,
            attachment_url: attachmentUrl,
            attachment_type: attachmentType,
            sender_type: isAgencyChat ? 'agency' : 'personal',
            sender_agency_id: (isAgencyChat ? currentConversation?.imobiliaria_id : undefined) ?? undefined,
            agency: (isAgencyChat ? currentConversation?.agency_details : undefined) ?? undefined
        });

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation_id: activeConversationId,
                    sender_id: user.id,
                    content,
                    attachment_url: attachmentUrl,
                    attachment_type: attachmentType,
                    sender_type: isAgencyChat ? 'agency' : 'personal',
                    sender_agency_id: (isAgencyChat ? currentConversation?.imobiliaria_id : undefined) ?? undefined
                })
            });

            if (response.ok) {
                const data = await response.json();
                addMessage(data.message);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Erro ao enviar mensagem');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const content = inputValue;
        setInputValue('');
        setShowEmojiPicker(false);

        await sendMessage(content);
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputValue((prev) => prev + emojiData.emoji);
    };

    const currentConversation = conversations.find(c => c.id === activeConversationId);
    const isAgencyChat = currentConversation?.target_type === 'agency';
    
    // Typing indicator logic
    const othersTyping = (typingUsers[activeConversationId || ''] || [])
        .filter(name => name !== `${user?.primeiro_nome} ${user?.ultimo_nome}`);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (activeConversationId && user) {
            setTyping(activeConversationId, `${user.primeiro_nome} ${user.ultimo_nome}`, e.target.value.length > 0);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white z-50">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 p-4 flex items-center justify-between text-white shrink-0 shadow-lg">
                <div className="flex items-center space-x-3">
                    <button onClick={backToList} className="p-1 hover:bg-white/10 rounded-full transition-colors mr-1">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
                            {isAgencyChat && currentConversation?.agency_details?.logo ? (
                                <img src={currentConversation.agency_details.logo} alt="Agency" className="w-full h-full object-cover" />
                            ) : activeProfile?.avatar_url ? (
                                <img src={activeProfile.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-purple-700 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">
                            {isAgencyChat && currentConversation?.agency_details?.nome 
                                ? currentConversation.agency_details.nome 
                                : activeProfile ? `${activeProfile.primeiro_nome} ${activeProfile.ultimo_nome}` : 'Conversa'}
                        </h3>
                        <span className="text-xs text-purple-200">
                            Online agora
                        </span>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#f0f2f5] space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                        <p>Nenhuma mensagem ainda.</p>
                        <p>Comece a conversa!</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMe={msg.sender_id === user?.id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0 relative">
                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                    <div className="absolute bottom-16 left-4 z-50 shadow-2xl rounded-2xl" ref={emojiPickerRef}>
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme={Theme.LIGHT}
                            lazyLoadEmojis={true}
                            width={300}
                            height={400}
                            searchDisabled={false}
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 transition-colors ${showEmojiPicker ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600'}`}
                >
                    <Smile size={24} />
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                    <Paperclip size={24} />
                </button>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={() => setShowEmojiPicker(false)}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm"
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-md flex items-center justify-center"
                >
                    <Send size={18} className={inputValue.trim() ? "ml-0.5" : ""} />
                </button>
            </form>
            
            {/* Typing Indicator Overlay */}
            {othersTyping.length > 0 && (
                <div className="absolute bottom-16 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100 shadow-sm flex items-center gap-2 animate-bounce">
                    <div className="flex gap-1">
                        <span className="w-1 h-1 bg-purple-600 rounded-full animate-pulse" />
                        <span className="w-1 h-1 bg-purple-600 rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-1 bg-purple-600 rounded-full animate-pulse delay-150" />
                    </div>
                    <span className="text-[10px] font-medium text-purple-600">
                        {othersTyping.length === 1 ? `${othersTyping[0]} está digitando...` : 'Várias pessoas escrevendo...'}
                    </span>
                </div>
            )}
        </div>
    );
}

