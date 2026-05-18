'use client'

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import React from 'react';

// Subcomponentes
import { HeroSection } from '@/app/agente/components/hero-section';
import { MessageSystem } from '@/app/agente/components/message-system';
import { MainContent } from '@/app/agente/components/main-content';
import { Sidebar } from '@/app/agente/components/sidebar';
import { toast } from 'sonner';
import { createDirectConversation, sendMessage } from '@/lib/functions/message-action';
import { useUserStore } from '@/lib/store/user-store';
import { useTrackEvent } from '@/hooks/use-track-event';
import { useEffect } from 'react';

const supabase = createClient();

// Dados de estatísticas
const agentStats = {
  propertiesSold: 47,
  yearsExperience: 5,
  clientSatisfaction: 98,
  averageDaysOnMarket: 24
};

export default function AgentProfilePage(
  params: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = React.use(params.params);
  const [activeTab, setActiveTab] = useState('properties');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useUserStore();
  const { track } = useTrackEvent();


  // Query para perfil
  const agentProfile = useQuery({
    queryKey: ['agent-profile', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', agentId);
      if (error) throw error;
      return data;
    }
  });

  // Query para imóveis
  const agentProperties = useQuery({
    queryKey: ['agent-properties', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', agentId);
      if (error) throw error;
      return data;
    }
  });

  console.log(agentProfile.data);

  const profile = agentProfile.data?.[0] || null;

  // Track View
  useEffect(() => {
    if (profile?.id) {
      track({
        event_type: 'view_agent',
        entity_type: 'corretor',
        entity_id: profile.id,
        owner_id: profile.id
      });
    }
  }, [profile?.id, track]);

  const handleSendMessage = async () => {
    if (isSending) return;
    if (!message.trim() || !profile || !user?.id) {
      console.log({message, profile, userId: user?.id});
      toast.error("Não foi possível enviar a mensagem.");
      return;
    }

    setIsSending(true);

    try {
      // 1. Criar ou recuperar conversa direta entre o usuário atual e o agente
      const conversation = await createDirectConversation(user.id, profile?.id);

      if (!conversation?.id) throw new Error("Falha ao criar conversa.");

      // 2. Enviar mensagem
      const messageObj = await sendMessage(conversation.id, user.id, message.trim());

      if (messageObj) {
          try {
              const { realtimeClient } = await import('@/lib/supabase-realtime');
              const channel = realtimeClient.subscribe(`chat-${conversation.id}`);
              channel.trigger('new-message', messageObj);
          } catch (e) {
              console.error('Failed to broadcast message:', e);
          }
      }

      // 3. Feedback ao usuário
      toast.success(
        "Mensagem enviada com sucesso! O agente entrará em contacto consigo brevemente."
      );
      setMessage("");
      setShowMessageBox(false);
    } catch (error: unknown) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage = error instanceof Error 
        ? 'Erro ao enviar mensagem. Tente novamente.'
        : 'Erro desconhecido ao enviar mensagem';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

    const handleOpenMessageBox = () => {
      setShowMessageBox(true);
      setTimeout(() => {
        document.getElementById('message-input')?.focus();
      }, 400);
  };

  const handleCloseMessageBox = () => {
    setShowMessageBox(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-orange-50/30">
      {/* Header Hero */}
      <HeroSection 
        profile={profile}
        agentStats={agentStats}
      />

      {/* Sistema de Mensagens */}
      <MessageSystem
        showMessageBox={showMessageBox}
        message={message}
        setMessage={setMessage}
        isSending={isSending}
        profile={profile}
        onSendMessage={handleSendMessage}
        onCloseMessageBox={handleCloseMessageBox}
      />

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-6 py-8 -mt-8">
        <div className="flex flex-col lg:flex-row gap-8">    
          {/* Sidebar */}
          <Sidebar
            profile={profile}
            agentStats={agentStats}
            onOpenMessageBox={handleOpenMessageBox}
          />

          {/* Conteúdo Principal */}
          <MainContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profile={profile}
            agentProperties={agentProperties.data || []}
            agentStats={agentStats}
            onOpenMessageBox={handleOpenMessageBox}
          />
        </div>
      </div>
    </div>
  );
}