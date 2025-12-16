import React, { useEffect } from 'react';
import { useChatStore } from '@/lib/store/chat-store';
import { useUserStore } from '@/lib/store/user-store';
import { UserCircle, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ChatList() {
    const {
        conversations,
        fetchConversations,
        openChat,
        isLoading,
        setView,
        toggleChat
    } = useChatStore();
    const { user } = useUserStore();

    useEffect(() => {
        if (user?.id) {
            fetchConversations(user.id);
        }
    }, [user, fetchConversations]);

    const handleNewChat = () => {
        setView('search');
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-lg text-gray-800">Conversas</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleNewChat}
                        className="p-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                        title="Nova Conversa"
                    >
                        <Plus size={20} />
                    </button>
                    <button
                        onClick={toggleChat}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading && conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Carregando...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                        <MessageSquareOff size={48} className="mb-2 opacity-50" />
                        <p>Nenhuma conversa ainda.</p>
                        <button onClick={handleNewChat} className="mt-4 text-purple-600 font-medium hover:underline">
                            Iniciar uma nova
                        </button>
                    </div>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => openChat(conv.id, conv.other_user)}
                            className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors"
                        >
                            <div className="relative">
                                {conv.other_user?.avatar_url ? (
                                    <img
                                        src={conv.other_user.avatar_url}
                                        alt="Avatar"
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <UserCircle className="w-12 h-12 text-gray-300" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {conv.other_user?.primeiro_nome} {conv.other_user?.ultimo_nome}
                                    </h3>
                                    <div className="flex flex-col items-end gap-1">
                                        {conv.last_message && (
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {format(new Date(conv.last_message.created_at), 'HH:mm', { locale: ptBR })}
                                            </span>
                                        )}
                                        {conv.unread_count && conv.unread_count > 0 ? (
                                            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                                {conv.unread_count}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {/* Add 'sending' logic here if we track pending messages in store per conversation */}
                                    {conv.last_message ? conv.last_message.content : 'Inicie a conversa...'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function MessageSquareOff({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
    )
}
