'use client';

import { VisitScheduler } from './visit-scheduler';
import { Calendar, MessageCircle } from 'lucide-react';
import { useChatStore } from '@/lib/store/chat-store';
import { useUserStore } from '@/lib/store/user-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function VisitSchedulerInline({ property, ownerDetails }: { property: any; ownerDetails: any }) {
  const { user } = useUserStore();
  const router = useRouter();
  const { openChat, checkExistingConversation, createConversation } = useChatStore();

  if (!ownerDetails || !user) return null;

  const displayName = property.imobiliarias?.nome || `${ownerDetails.primeiro_nome || ''} ${ownerDetails.ultimo_nome || ''}`.trim() || 'Corretor';

  const handleChat = async () => {
    if (!user) { router.push('/login'); return; }
    if (user.id === ownerDetails.id) { toast.info("Você não pode iniciar chat consigo mesmo."); return; }

    const targetType = property.imobiliarias ? 'agency' : 'agent';
    let conversationId = await checkExistingConversation(user.id, ownerDetails.id, targetType);
    if (!conversationId) {
      const newConv = await createConversation({
        myId: user.id,
        targetId: ownerDetails.id,
        targetType,
        imobiliariaId: ownerDetails.imobiliaria_id
      });
      if (newConv) conversationId = newConv.id;
    }
    if (conversationId) {
      openChat(conversationId, property.imobiliarias ? {
        id: ownerDetails.id,
        primeiro_nome: property.imobiliarias.nome,
        ultimo_nome: '',
        email: ownerDetails.email || null,
        avatar_url: property.imobiliarias.logo || null
      } : undefined);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Quer visitar este imóvel?</h3>
          <p className="text-sm text-gray-600">Agende uma visita ou fale diretamente com {displayName}.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <VisitScheduler
            property={{ id: property.id, title: property.title || '', image: property.image ?? undefined }}
            ownerData={{ id: ownerDetails.id, name: displayName, imobiliaria_id: ownerDetails.imobiliaria_id }}
            userId={user?.id}
          >
            <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95">
              <Calendar className="w-4 h-4" />
              Agendar Visita
            </button>
          </VisitScheduler>
          <button
            onClick={handleChat}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar Mensagem
          </button>
        </div>
      </div>
    </div>
  );
}
