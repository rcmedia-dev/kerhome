'use client'

import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { VerifiedIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Agent = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  pacote_agente: string;
  propriedades: any[];
  avatar?: string;
};

export default function TopAgentsSection() {
  const response = useQuery({
    queryKey: ['agents'],
    queryFn: async() => {
      const response = await supabase.from('profiles').select('*').eq('role', 'agent').limit(3)
      return response
    }
  })

  const agents = response.data;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Corretores em Destaque</h2>
        <p className="text-gray-500 mb-10">Conheça os profissionais que mais se destacam em vendas.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {agents?.data?.map((agent) => (
            <div
              key={agent.id}
              className="flex flex-col h-full bg-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 shadow-sm border-4 border-orange-500">
                <Image
                  src={agent.avatar_url ?? '/default-avatar.jpg'}
                  alt={agent.primeiro_nome}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{agent.primeiro_nome} {agent.ultimo_nome}</h3>
              <p className="flex gap-2 justify-center items-center text-purple-700 font-medium mt-2">
                <VerifiedIcon />
                Agente Verificado
              </p>
              <Link
                href={`/agente/${agent.id}`}
                className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer rounded-lg transition">
                Ver Perfil
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
