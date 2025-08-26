'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPropertyOwner } from '@/lib/actions/get-agent';
import { toast } from 'sonner';
import { Mail, MessageSquare, Phone, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from './auth-context';
import Pusher from 'pusher-js';
import { supabase } from '@/lib/supabase';

type Agent = {
  id: string;
  primeiro_nome?: string | null;
  ultimo_nome?: string | null;
  email: string;
  avatar?: string | null;
  telefone?: string | null;
};

type AgentCardWithChatProps = {
  ownerId: string;
  propertyId: string;
};

export type Message = { chat_id: string, sender_id: string, receiver_id: string, content: string, read: boolean }

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function randomColorFromName(name: string): string {
  const colors = ['bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500'];
  const index = name.length % colors.length;
  return colors[index];
}

export default function AgentCardWithChat({ ownerId, propertyId }: AgentCardWithChatProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState<'idle' | 'enviando' | 'sucesso' | 'erro'>('idle');
  const [showChat, setShowChat] = useState(false);
  
  const { user } = useAuth();
  const userIdLogado = user?.id;

  useEffect(() => {
    async function fetchAgent() {
      const data = await getPropertyOwner(propertyId);
      setAgent(data);
    }
    fetchAgent()

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER! })
    const channel = pusher.subscribe('chat-channel')
    channel.bind('new_message', (data: string) => {
      setMensagem(data)
    })

    return () => {
      pusher.unsubscribe('chat-channel')
    }
  }, [propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userIdLogado || !agent) return;

    setStatus('enviando');

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userIdLogado,
          content: mensagem,
          receiver_id: agent.id,
          sender_id: userIdLogado,
        })
      })

      setMensagem('');
      setStatus('sucesso');
      toast.success('Mensagem enviada com sucesso!');

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setStatus('erro');
      toast.error('Erro ao enviar a mensagem');
    }
  };

  if (!agent) return null;

  const fullName = `${agent.primeiro_nome ?? ''} ${agent.ultimo_nome ?? ''}`.trim() || 'Agente';
  const initials = getInitials(fullName);
  const color = randomColorFromName(fullName);

  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden transition-all duration-300">
      {/* Cabeçalho */}
      <div className="p-6 mx-auto pb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-600 bg-gray-100">
            {agent.avatar ? (
              <Image
                src={agent.avatar}
                alt={fullName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-white font-bold text-xl ${color}`}>
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
            <p className="text-sm text-purple-600 font-medium">Agente de Imóveis</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="px-6 pb-4 flex flex-col gap-3">
        <Link
          href={`/agente?email=${encodeURIComponent(agent.email)}`}
          className="w-full bg-purple-100 text-purple-700 py-2 px-4 rounded-lg font-semibold hover:bg-purple-200 transition flex items-center justify-center gap-2"
        >
          <Share2 size={16} />
          Ver outras propriedades
        </Link>
        <button
          onClick={async () => {
            if (!userIdLogado) {
              toast.error('Você precisa estar logado para enviar mensagens');
              return;
            }

            try {
              // 👉 incrementa a view (só se não for o dono do imóvel)
              const { data, error } = await supabase.rpc('register_property_view', {
                p_property_id: propertyId,
                p_user_id: user.id,
                p_owner_id: agent.id
              });

              console.log('datas for the function:', propertyId, user.id, agent.id)

              if (error) {
                console.error('Erro ao registrar visualização:', error);
              } else {
                console.log('Visualização registrada com sucesso. Total:', data);
              }

            } catch (error) {
              console.error('Erro inesperado:', error);
            }

            console.log('clicked');

            // abre/fecha o chat
            setShowChat(!showChat);
          }}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            showChat 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <MessageSquare size={16} />
          {showChat ? 'Fechar chat' : 'Conversar com o agente'}
        </button>
      </div>

      {/* Chat */}
      {showChat && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
         {/* Informações de contato do agente */}
          <div className="mb-4 p-4 bg-white rounded-lg border border-gray-300 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3 text-lg">Contato do Agente</h4>

            <div className="space-y-3">
              {agent?.email ? (
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center gap-2 text-base text-orange-500 font-medium hover:underline"
                >
                  <Mail className="text-orange-500" size={18} />
                  <span>{agent.email}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                  <Mail className="text-gray-400" size={16} />
                  <span>Email não disponível</span>
                </div>
              )}

              {agent?.telefone ? (
                <a
                  href={`tel:${agent.telefone}`}
                  className="flex items-center gap-2 text-base text-orange-500 font-medium hover:underline"
                >
                  <Phone className="text-orange-500" size={18} />
                  <span>{agent.telefone}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                  <Phone className="text-gray-400" size={16} />
                  <span>Telefone não disponível</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              placeholder={`Digite sua mensagem para ${agent.primeiro_nome}...`}
              required
              rows={3}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              disabled={!userIdLogado}
            />
            {!userIdLogado && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-700">
                Você precisa estar logado para enviar mensagens.
              </div>
            )}
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {userIdLogado ? 'Sua mensagem será enviada ao agente' : 'Faça login para enviar mensagens'}
              </p>
              <button
                type="submit"
                disabled={status === 'enviando' || !userIdLogado}
                className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === 'enviando' ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar Mensagem'
                )}
              </button>
            </div>
            {status === 'sucesso' && (
              <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-lg text-center">
                Mensagem enviada com sucesso!
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}