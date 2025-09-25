'use client'

import { VerifiedIcon, Mail, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface Agent {
  id: string;
  avatar_url?: string | null;
  created_at: string;
  email: string;
  empresa?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  last_seen_at?: string | null;
  licenca?: string | null;
  linkedin?: string | null;
  pacote_agente_id?: string | null;
  primeiro_nome: string;
  ultimo_nome: string;
  role: "agent" | "admin" | "user" | string;
  sobre_mim?: string | null;
  status: "active" | "inactive" | "pending" | string;
  telefone?: string | null;
  updated_at?: string;
  username?: string | null;
  website?: string | null;
  youtube?: string | null;
  properties?: any[];
}

type TopAgentsSectionProps = {
  agents: Agent[]
}

export default function TopAgentsSection({ agents }: TopAgentsSectionProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Elementos decorativos minimalistas */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header elegante */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 mb-4">
            <VerifiedIcon className="w-4 h-4 text-purple-700" />
            <span className="text-sm font-medium text-gray-700">Agentes Verificados</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nossos <span className="text-purple-700">Corretores</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Profissionais qualificados com amplo portfólio de imóveis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {agents.map((agent) => {
            const isHovered = hoveredAgent === agent.id;

            return (
              <div
                key={agent.id}
                className="group relative"
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                {/* Card moderno e clean */}
                <div className={`relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col overflow-hidden ${
                  isHovered ? 'shadow-lg border-purple-200' : ''
                }`}>
                  
                  {/* Header do card com background sutil */}
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-purple-50 to-purple-100 opacity-60"></div>
                  
                  {/* Avatar centralizado */}
                  <div className="relative z-10 mx-auto mb-4 -mt-4">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-purple-700 rounded-full transition-all duration-500 ${
                        isHovered ? 'scale-110 opacity-10' : 'scale-100 opacity-0'
                      }`}></div>
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <Image
                          src={agent.avatar_url ?? '/default-avatar.jpg'}
                          alt={`${agent.primeiro_nome} ${agent.ultimo_nome}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </div>
                    
                    {/* Badge de verificação */}
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border">
                      <VerifiedIcon className="w-4 h-4 text-purple-700" />
                    </div>
                  </div>

                  {/* Conteúdo principal */}
                  <div className="text-center flex-1 relative z-10 flex flex-col items-center justify-center">
                    {/* Nome */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {agent.primeiro_nome} {agent.ultimo_nome}
                    </h3>

                    {/* Email */}
                    {agent.email && (
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-6 p-2 bg-gray-50 rounded-lg w-full">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs truncate">{agent.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Botão de ver perfil */}
                  <div className="relative z-10">
                    <Link
                      href={`/agente/${agent.id}`}
                      className={`w-full py-2.5 px-4 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                        isHovered ? 'shadow-md transform hover:scale-105' : ''
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Ver Perfil Completo
                    </Link>
                  </div>

                  {/* Efeito de hover sutil */}
                  <div className={`absolute inset-0 bg-purple-700/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    isHovered ? 'opacity-100' : ''
                  }`}></div>
                </div>

                {/* Destaque no hover */}
                <div className={`absolute inset-0 border-2 border-purple-300 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none ${
                  isHovered ? 'opacity-100' : ''
                }`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}