'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Calendar, X, MessageSquare } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { VisitScheduler } from './visit-scheduler';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { useUserStore } from '@/lib/store/user-store';

interface MobileContactFABProps {
  property: TPropertyResponseSchema;
  ownerDetails: any;
}

export function MobileContactFAB({ property, ownerDetails }: MobileContactFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();
  const { openChat, checkExistingConversation, createConversation } = useChatStore();
  const [loading, setLoading] = useState(false);

  if (!ownerDetails) return null;

  const displayName = property.imobiliarias ? property.imobiliarias.nome : `${ownerDetails.primeiro_nome || ''} ${ownerDetails.ultimo_nome || ''}`.trim() || 'Corretor';
  const displayPhone = property.imobiliarias ? (property.imobiliarias.whatsapp || property.imobiliarias.telefone) : ownerDetails.telefone;
  const imobiliariaId = ownerDetails.imobiliaria_id;

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para iniciar um chat.');
      router.push('/login');
      return;
    }

    if (user.id === ownerDetails.id) {
      toast.info("Você não pode iniciar um chat com você mesmo.");
      return;
    }

    setLoading(true);
    setIsOpen(false);
    try {
      const targetType = property.imobiliarias ? 'agency' : 'agent';
      let conversationId = await checkExistingConversation(user.id, ownerDetails.id, targetType);

      if (!conversationId) {
        const newConv = await createConversation({
          myId: user.id,
          targetId: ownerDetails.id,
          targetType,
          imobiliariaId
        });
        if (newConv) {
          conversationId = newConv.id;
        }
      }

      if (conversationId) {
        openChat(conversationId, property.imobiliarias ? {
          id: ownerDetails.id,
          primeiro_nome: property.imobiliarias.nome,
          ultimo_nome: '',
          email: ownerDetails.email || null,
          avatar_url: property.imobiliarias.logo || null
        } : undefined);
        toast.success(`Chat iniciado com ${displayName}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Erro ao conectar.');
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <Phone size={20} />,
      color: 'bg-green-500',
      description: 'Retorno Instantâneo',
      action: () => {
        if (displayPhone) {
          window.open(`https://wa.me/${displayPhone.replace(/\D/g, '')}?text=Olá, tenho interesse no imóvel: ${property.title}`, '_blank');
        }
        setIsOpen(false);
      }
    },
    {
      id: 'schedule',
      label: 'Agendar Visita',
      icon: <Calendar size={20} />,
      color: 'bg-orange-500',
      description: 'Reserve seu horário',
      isScheduler: true
    },
    {
      id: 'chat',
      label: 'Chat Interno',
      icon: <MessageCircle size={20} />,
      color: 'bg-purple-600',
      description: 'Fale agora mesmo',
      action: handleStartChat
    }
  ];

  return (
    <div className="md:hidden fixed bottom-24 right-4 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1]"
            />
            
            <div className="flex flex-col items-end gap-4 mb-5">
              {actions.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex flex-col items-end">
                     <span className="text-white text-sm font-bold bg-gray-900/80 px-3 py-1 rounded-lg backdrop-blur-sm shadow-xl">
                       {item.label}
                     </span>
                     <span className="text-[10px] text-white/80 font-medium mr-1">
                       {item.description}
                     </span>
                  </div>

                  {item.isScheduler ? (
                    <VisitScheduler 
                      property={{ id: property.id, title: property.title || '', image: property.image ?? undefined }}
                      ownerData={{ id: ownerDetails.id, name: displayName, imobiliaria_id: ownerDetails.imobiliaria_id }}
                      userId={user?.id}
                    >
                      <button className={`w-12 h-12 ${item.color} text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white`}>
                        {item.icon}
                      </button>
                    </VisitScheduler>
                  ) : (
                    <button 
                      onClick={item.action}
                      className={`w-12 h-12 ${item.color} text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white`}
                    >
                      {item.icon}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotate: isOpen ? 180 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-white transition-all duration-300 ${
          isOpen ? 'bg-gray-800' : 'bg-gradient-to-tr from-purple-600 to-orange-500'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
}
