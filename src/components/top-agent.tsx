'use client'

import { getAllAgents } from '@/lib/actions/get-agent';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Agent = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  pacote_agente: string;
  propriedades: any[];
  avatar?: string; // opcional
};

export default function TopAgentsSection() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    async function fetchAgents() {
      const data = await getAllAgents();
      setAgents(data);
    }

    fetchAgents();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Corretores em Destaque</h2>
        <p className="text-gray-500 mb-10">Conheça os profissionais que mais se destacam em vendas.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <div
              key={agent.id}
              className="flex flex-col h-full bg-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 shadow-sm border-4 border-orange-500">
                <Image
                  src={agent.avatar ?? '/default-avatar.jpg'}
                  alt={agent.nome}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{agent.nome}</h3>
              <p className="text-sm text-gray-500">{agent.pacote_agente}</p>
              <p className="text-purple-700 font-medium mt-2">
                {agent.propriedades.length} propriedades listadas
              </p>
              <button className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer rounded-lg transition">
                Ver Perfil
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
