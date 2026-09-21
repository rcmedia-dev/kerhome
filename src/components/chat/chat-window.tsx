import React, { useEffect, useRef, useState } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Send, X, Smile, Paperclip, ArrowLeft, UserCircle, Info, MessageSquare, Loader2 } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat-store';
import { useUserStore } from '@/lib/store/user-store';

import { MessageBubble } from './message-bubble';
import { AiReplySuggestions } from '@/components/dashboard/ai-reply-suggestions';
import { toast } from 'sonner';

interface ChatWindowProps {
    onClose: () => void;
    onShowCRM?: () => void;
}

export function ChatWindow({ onClose, onShowCRM }: ChatWindowProps) {
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
        typingUsers,
        isDashboardMessages,
        isLoading
    } = useChatStore();
    const { user } = useUserStore();
    const [inputValue, setInputValue] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom safely within messages container
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    // Listen for insert-ai-reply custom events
    useEffect(() => {
        const handleInsertReply = (e: any) => {
            const text = e.detail;
            if (typeof text === 'string') {
                setInputValue(text);
                inputRef.current?.focus();
            }
        };
        window.addEventListener('insert-ai-reply', handleInsertReply as EventListener);
        return () => window.removeEventListener('insert-ai-reply', handleInsertReply as EventListener);
    }, []);

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
            toast.error('Erro ao enviar arquivo');
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
                
                // Broadcast via Supabase Realtime
                try {
                    const { realtimeClient } = await import('@/lib/supabase-realtime');
                    const channel = realtimeClient.subscribe(`chat-${activeConversationId}`);
                    channel.trigger('new-message', data.message);
                } catch (e) {
                    console.error('Failed to broadcast message:', e);
                }
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
        <div className="flex flex-col h-full max-h-full overflow-hidden bg-white min-h-0 w-full md:rounded-card md:border md:border-gray-100 shadow-xs">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />

            {/* Header with safe-area-top for mobile status bar */}
            <div className="safe-area-top bg-gradient-to-r from-purple-700 to-purple-600 p-2.5 sm:p-3 flex items-center justify-between text-white shrink-0 min-w-0 shadow-xs z-10">
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                    <button onClick={backToList} className="p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0 active:scale-95" aria-label="Voltar à lista">
                        <ArrowLeft size={19} />
                    </button>
                    <div className="relative shrink-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/30">
                            {isAgencyChat && currentConversation?.agency_details?.logo ? (
                                <img src={currentConversation.agency_details.logo} alt="Agency" className="w-full h-full object-cover" />
                            ) : activeProfile?.avatar_url ? (
                                <img src={activeProfile.avatar_url} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-purple-700 rounded-full"></span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm truncate leading-tight">
                            {isAgencyChat && currentConversation?.agency_details?.nome 
                                ? currentConversation.agency_details.nome 
                                : activeProfile ? `${activeProfile.primeiro_nome} ${activeProfile.ultimo_nome}` : 'Conversa'}
                        </h3>
                        <span className="text-[11px] text-purple-200 font-medium">
                            Online agora
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {onShowCRM && isDashboardMessages && (
                        <button 
                            onClick={onShowCRM} 
                            className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                            title="Ver Detalhes do Lead"
                            aria-label="Ver detalhes do lead"
                        >
                            <Info size={19} />
                        </button>
                    )}
                    {!isDashboardMessages && (
                        <button 
                            onClick={() => {
                                onClose();
                                window.location.href = `/dashboard?tab=messages&conv=${activeConversationId}`;
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                            title="Expandir para o Dashboard"
                            aria-label="Expandir para o dashboard"
                        >
                            <MessageSquare size={19} />
                        </button>
                    )}
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95" aria-label="Fechar">
                        <X size={19} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50/30 space-y-3 sm:space-y-4 custom-scrollbar min-h-0"
            >
                {isLoading && messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-3 text-purple-600">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span className="text-xs font-medium text-gray-400">A carregar mensagens...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                        <p className="font-medium">Nenhuma mensagem ainda.</p>
                        <p className="text-xs text-gray-400/80 mt-1">Comece a conversa!</p>
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

            {/* AI Reply Suggestions: Placed directly above the input form, shown only when messages exist and loaded */}
            {isDashboardMessages && !isLoading && messages.length > 0 && (
                <AiReplySuggestions
                    messages={messages.map(m => ({
                        role: m.sender_id === user?.id ? 'assistant' : 'user',
                        content: m.content
                    }))}
                    propertyContext={(currentConversation as any)?.property_details || undefined}
                    onSelectReply={(text) => {
                        setInputValue(text);
                        inputRef.current?.focus();
                    }}
                />
            )}

            {/* Input Area with safe-area at the bottom */}
            <form 
                onSubmit={handleSendMessage} 
                style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 10px), 18px)' }}
                className="px-3 pt-2.5 sm:px-4 sm:py-3 bg-white border-t border-gray-100 flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-10 shadow-xs"
            >
                {/* Emoji Picker Popover */}
                {showEmojiPicker && (
                    <div 
                        style={{ bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 64px), 72px)' }}
                        className="absolute left-2 sm:left-4 z-50 shadow-2xl rounded-2xl max-w-[calc(100vw-32px)]" 
                        ref={emojiPickerRef}
                    >
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme={Theme.LIGHT}
                            lazyLoadEmojis={true}
                            width={280}
                            height={360}
                            searchDisabled={false}
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-1.5 sm:p-2 transition-colors active:scale-95 ${showEmojiPicker ? 'text-purple-600' : 'text-gray-400 hover:text-purple-600'}`}
                    aria-label="Selecionar emoji"
                >
                    <Smile size={22} />
                </button>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-600 transition-colors active:scale-95"
                    aria-label="Anexar arquivo"
                >
                    <Paperclip size={22} />
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={() => setShowEmojiPicker(false)}
                    placeholder="Digite uma mensagem..."
                    className="flex-1 py-2 px-3.5 bg-gray-100/80 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white text-sm transition-all"
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-2.5 sm:p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-xs flex items-center justify-center shrink-0"
                    aria-label="Enviar mensagem"
                >
                    <Send size={16} className={inputValue.trim() ? "ml-0.5" : ""} />
                </button>
            </form>
            
            {/* Typing Indicator Overlay */}
            {othersTyping.length > 0 && (
                <div 
                    style={{ bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 64px), 72px)' }}
                    className="absolute left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100 shadow-sm flex items-center gap-2 animate-bounce z-20"
                >
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

