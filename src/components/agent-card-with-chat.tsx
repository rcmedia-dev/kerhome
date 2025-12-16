'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AgentCardProps {
    ownerData: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        avatar_url?: string;
        role?: string;
    };
    propertyId: string;
    propertyTitle?: string;
    propertyImage?: string;
    userId?: string;
}

export default function AgentCardWithChat({ ownerData, propertyId, propertyTitle, propertyImage, userId }: AgentCardProps) {
    const router = useRouter();
    const { openChat, checkExistingConversation, createConversation, addMessage } = useChatStore();
    const [loading, setLoading] = useState(false);

    const handleStartChat = async () => {
        if (!userId) {
            toast.error('Você precisa estar logado para iniciar um chat.');
            router.push('/auth/login');
            return;
        }

        if (userId === ownerData.id) {
            toast.info("Você não pode iniciar um chat com você mesmo.");
            return;
        }

        setLoading(true);
        try {
            // 1. Check if conversation exists
            let conversationId = await checkExistingConversation(userId, ownerData.id);
            let isNew = false;

            // 2. If not, create one
            if (!conversationId) {
                const newConv = await createConversation(userId, ownerData.id);
                if (newConv) {
                    conversationId = newConv.id;
                    isNew = true;
                }
            }

            // 3. Open chat and send/show interest message
            if (conversationId) {
                openChat(conversationId);
                toast.success(`Chat iniciado com ${ownerData.name}`);

                // 4. Send interest message (if new or explicit action)
                // We send it every time the user explicitly clicks "Send Message" from the property page
                // to give context to the agent.
                const messageContent = `Olá ${ownerData.name}, estou interessado neste imóvel: ${propertyTitle}`;

                try {
                    const response = await fetch('/api/messages', {
                        method: 'POST',
                        body: JSON.stringify({
                            conversation_id: conversationId,
                            sender_id: userId,
                            content: messageContent,
                            attachment_url: propertyImage,
                            attachment_type: 'image'
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.message) {
                            addMessage(data.message);
                        }
                    }
                } catch (msgError) {
                    console.error("Failed to send interest message", msgError);
                }

            } else {
                toast.error('Erro ao iniciar conversa.');
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error('Erro ao conectar com o corretor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Agent Info */}
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-100 shadow-sm shrink-0 flex items-center justify-center bg-gray-100">
                    {ownerData.avatar_url ? (
                        <Image
                            src={ownerData.avatar_url}
                            alt={ownerData.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                                // Simple fallback if image fails to load, though Next/Image handles this differently.
                                // We can just rely on the conditional above, or use a state to switch to fallback.
                                // For simplicity, let's assume if URL exists it's valid, otherwise show initials.
                                // A true fallback for 404s needs checking loading state or onError handling in a wrapper.
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    // Manually insert initials via DOM/CSS or just let simple logic prevail? 
                                    // Better: Don't mess with DOM. 
                                    // Let's us use a helper function to get initials.
                                }
                            }}
                        />
                    ) : (
                        <span className="text-purple-600 font-bold text-xl">
                            {ownerData.name
                                .split(' ')
                                .map(n => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                        </span>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{ownerData.name}</h4>
                    <p className="text-sm text-purple-600 font-medium">{ownerData.role || 'Corretor De Imóveis'}</p>
                </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
                <button
                    onClick={handleStartChat}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    <MessageCircle size={20} className="group-hover:animate-pulse" />
                    {loading ? 'Iniciando...' : 'Enviar Mensagem ao Corretor'}
                </button>
            </div>

            <div className="text-center">
                <button
                    onClick={() => router.push(`/agente/${ownerData.id}`)}
                    className="text-sm text-gray-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-1 mx-auto group"
                >
                    Ver perfil completo
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
