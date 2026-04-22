'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Phone, ArrowRight, Calendar } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VisitScheduler } from './visit-scheduler';

interface AgentCardProps {
    ownerData: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        avatar_url?: string;
        role?: string;
        imobiliaria_id?: string;
    };
    propertyId: string;
    propertyTitle?: string;
    propertyImage?: string;
    userId?: string;
    agencyData?: {
        id?: string;
        nome: string;
        logo: string | null;
        telefone?: string | null;
        whatsapp?: string | null;
    } | null;
}

export default function AgentCardWithChat({ ownerData, propertyId, propertyTitle, propertyImage, userId, agencyData }: AgentCardProps) {
    const router = useRouter();
    const { openChat, checkExistingConversation, createConversation, addMessage } = useChatStore();
    const [loading, setLoading] = useState(false);

    const displayName = agencyData ? agencyData.nome : ownerData.name;
    const displayAvatar = agencyData ? agencyData.logo : ownerData.avatar_url;
    const displayPhone = agencyData ? (agencyData.whatsapp || agencyData.telefone) : ownerData.phone;
    const displayRole = agencyData ? 'Imobiliária' : (ownerData.role || 'Corretor De Imóveis');

    const handleStartChat = async () => {
        if (!userId) {
            toast.error('Você precisa estar logado para iniciar um chat.');
            router.push('/login');
            return;
        }

        if (userId === ownerData.id) {
            toast.info("Você não pode iniciar um chat com você mesmo.");
            return;
        }

        setLoading(true);
        try {
            const targetType = agencyData ? 'agency' : 'agent';
            const imobiliariaId = ownerData.imobiliaria_id;

            // 1. Check if conversation exists
            let conversationId = await checkExistingConversation(userId, ownerData.id, targetType);
            let isNew = false;

            // 2. If not, create one
            if (!conversationId) {
                const newConv = await createConversation({
                    myId: userId,
                    targetId: ownerData.id,
                    targetType,
                    imobiliariaId
                });
                if (newConv) {
                    conversationId = newConv.id;
                    isNew = true;
                }
            }

            // 3. Open chat
            if (conversationId) {
                openChat(conversationId, agencyData ? {
                    id: ownerData.id,
                    primeiro_nome: agencyData.nome,
                    ultimo_nome: '',
                    email: ownerData.email || null,
                    avatar_url: agencyData.logo || null
                } : undefined);
                
                toast.success(`Chat iniciado com ${agencyData ? 'a Agência' : ownerData.name}`);

                // 4. Send interest message (Context)
                if (propertyId) {
                    const messageContent = `Olá, estou interessado nisto: ${propertyTitle || 'Imóvel'}`;

                    try {
                        await fetch('/api/messages', {
                            method: 'POST',
                            body: JSON.stringify({
                                conversation_id: conversationId,
                                sender_id: userId,
                                content: messageContent,
                                attachment_url: propertyImage,
                                attachment_type: 'image',
                                imobiliaria_id: imobiliariaId
                            })
                        });
                        // fetchMessages is called by openChat automatically
                    } catch (msgError) {
                        console.error("Failed to send interest message", msgError);
                    }
                }

            } else {
                toast.error('Erro ao iniciar conversa.');
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error('Erro ao conectar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Agent Info */}
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-100 shadow-sm shrink-0 flex items-center justify-center bg-gray-100">
                    {displayAvatar ? (
                        <Image
                            src={displayAvatar}
                            alt={displayName}
                            fill
                            className="object-cover"
                            unoptimized={true}
                        />
                    ) : (
                        <span className="text-purple-600 font-bold text-xl">
                            {displayName
                                .split(' ')
                                .map(n => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                        </span>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{displayName}</h4>
                    <p className="text-sm text-purple-600 font-medium">{displayRole}</p>
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
                    {loading ? 'Iniciando...' : (agencyData ? 'Chat com a Agência' : 'Enviar Mensagem ao Corretor')}
                </button>

                <VisitScheduler 
                    property={{
                        id: propertyId,
                        title: propertyTitle || '',
                        image: propertyImage
                    }}
                    ownerData={{
                        id: ownerData.id,
                        name: displayName,
                        imobiliaria_id: ownerData.imobiliaria_id
                    }}
                    userId={userId}
                />

                {displayPhone && (
                    <a
                        href={`https://wa.me/${displayPhone.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel: ${propertyTitle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5"
                    >
                        <Phone size={20} />
                        WhatsApp {(agencyData ? 'da Agência' : '')}
                    </a>
                )}
            </div>

            {!agencyData && (
                <div className="text-center">
                    <button
                        onClick={() => router.push(`/agente/${ownerData.id}`)}
                        className="text-sm text-gray-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-1 mx-auto group"
                    >
                        Ver perfil completo
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
}

