'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

function AgentContactCard({ userIdLogado, adminId }: { userIdLogado?: string; adminId: string }) {
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState<'idle' | 'enviando' | 'sucesso' | 'erro'>('idle');
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userIdLogado) {
      toast.error('Você precisa estar logado para enviar mensagens');
      return;
    }

    setStatus('enviando');

    try {
      // Verificar se já existe conversa
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('id')
        .or(`and(sender_id.eq.${userIdLogado},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${userIdLogado})`)
        .limit(1);

      // Criar conversa se não existir
      if (!existingMessages || existingMessages.length === 0) {
        await supabase
          .from('messages')
          .insert([{
            content: `Nova conversa iniciada com o agente`,
            sender_id: userIdLogado,
            receiver_id: adminId,
            is_read: false
          }]);
      }

      // Enviar mensagem
      const { error } = await supabase
        .from('messages')
        .insert({
          content: mensagem,
          sender_id: userIdLogado,
          receiver_id: adminId,
          is_read: false,
        });

      if (error) throw error;

      setStatus('sucesso');
      toast.success('Mensagem enviada com sucesso!');
      setMensagem('');

      // Notificar atualização em tempo real
      const channel = supabase.channel('new_message');
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: { userId: userIdLogado, adminId },
          });
        }
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setStatus('erro');
      toast.error('Erro ao enviar a mensagem');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Card do Agente */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div>
          <h3 className="font-semibold text-lg">Agente Imobiliário</h3>
          <p className="text-gray-600 text-sm">Disponível para responder suas dúvidas</p>
        </div>
      </div>

      {/* Botão para mostrar/ocultar chat */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="w-full py-2 text-sm font-medium text-orange-600 border border-orange-600 
                 hover:bg-orange-50 rounded-lg transition"
      >
        {showChat ? 'Ocultar chat' : 'Conversar com o vendedor'}
      </button>

      {/* Formulário de chat (condicional) */}
      {showChat && (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              placeholder="Digite sua mensagem..."
              required
              rows={3}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm 
                       focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'enviando'}
            className="w-full py-2 text-sm font-semibold text-white bg-orange-500 
                     hover:bg-orange-600 rounded-lg transition disabled:opacity-70"
          >
            {status === 'enviando' ? 'Enviando...' : 'Enviar Mensagem'}
          </button>

          {status === 'sucesso' && (
            <p className="text-green-600 text-sm text-center">Mensagem enviada!</p>
          )}
        </form>
      )}
    </div>
  );
}

export default AgentContactCard;