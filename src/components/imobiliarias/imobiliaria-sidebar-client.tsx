'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';
import AgentCardWithChat from '@/components/agent-card-with-chat';
import { useUserStore } from '@/lib/store/user-store';

interface Agent {
  id: string;
  primeiro_nome?: string;
  ultimo_nome?: string;
  full_name?: string;
  avatar_url?: string;
  telefone?: string;
  email?: string;
}

interface ImobiliariaSidebarProps {
  imobiliaria: any;
  agentes: Agent[];
}

export function ImobiliariaSidebarClient({ imobiliaria, agentes }: ImobiliariaSidebarProps) {
  const { user } = useUserStore();

  // O utilizador dono da agência com quem vamos iniciar o chat
  const ownerDetails = {
    id: imobiliaria.owner_id || imobiliaria.id, // Fallback para ID da agência
    name: imobiliaria.nome,
    email: imobiliaria.email || '',
    phone: imobiliaria.telefone,
    avatar_url: imobiliaria.logo,
    role: 'Imobiliária',
    imobiliaria_id: imobiliaria.id
  };

  return (
    <div className="sticky top-24 w-full flex flex-col gap-6">

      {/* Contact Card via AgentCardWithChat */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm mb-2">
          Contactar Agência
        </h3>

        <AgentCardWithChat
          ownerData={ownerDetails}
          propertyId=""
          propertyTitle="Contato Profissional"
          propertyImage={imobiliaria.logo ?? undefined}
          userId={user?.id} // Adicionado o ID Logado aqui
          agencyData={{
            nome: imobiliaria.nome,
            logo: imobiliaria.logo,
            telefone: imobiliaria.telefone,
            whatsapp: imobiliaria.whatsapp // Se existir
          }}
        />
      </div>

      {/* Lista de Equipa Associada */}
      {agentes && agentes.length > 0 && (
        <div className="bg-white rounded-[2rem] pt-6 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-6 mb-4 flex items-center gap-3">
            <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-[#820AD1]" />
              Nossa Equipa
            </h3>
          </div>

          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-6 lg:pb-0 snap-x snap-mandatory scroll-smooth hide-scrollbar px-6 lg:px-6 mb-2">
            {agentes.map((agente) => (
              <Link
                href={`/agente/${agente.id}`}
                key={agente.id}
                className="flex items-center gap-4 bg-gray-50 hover:bg-purple-50 rounded-2xl p-3 border border-transparent hover:border-purple-100 transition-all snap-start min-w-[280px] lg:min-w-0 flex-shrink-0 lg:flex-shrink group"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  <Image
                    src={agente.avatar_url || '/placeholder-avatar.png'}
                    alt={agente.primeiro_nome ? `${agente.primeiro_nome} ${agente.ultimo_nome}` : (agente.full_name || 'Corretor')}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors">
                    {agente.primeiro_nome ? `${agente.primeiro_nome} ${agente.ultimo_nome}` : (agente.full_name || 'Corretor Associado')}
                  </h4>
                  <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest">
                    Consultor
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

