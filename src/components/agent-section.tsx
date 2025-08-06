'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getPropertyOwner } from '@/lib/actions/get-agent';
import Link from 'next/link';

type Agent = {
  primeiro_nome?: string | null;
  ultimo_nome?: string | null;
  email: string;
  avatar?: string | null;
};

type AgentSectionProps = {
  ownerId: string;
};

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

export default function AgentSection({ ownerId }: AgentSectionProps) {
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    async function fetchAgent() {
      const data = await getPropertyOwner(ownerId);
      console.log('Agent data:', data);
      setAgent(data);
    }
    if (ownerId) {
      fetchAgent();
    }
  }, [ownerId]);

  if (!agent) return null;

  const fullName = `${agent.primeiro_nome ?? ''} ${agent.ultimo_nome ?? ''}`.trim() || 'Agente';
  const initials = getInitials(fullName);
  const color = randomColorFromName(fullName);

  return (
    <div className="bg-white border shadow-md rounded-2xl p-6 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-600 mb-3 flex items-center justify-center bg-gray-100">
        {agent.avatar ? (
          <Image
            src={agent.avatar}
            alt={fullName}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-white font-bold text-xl ${color}`}>
            {initials}
          </div>
        )}
      </div>

      <p className="text-lg font-semibold text-gray-900">
        <a href="/agente" className="hover:underline text-purple-700 cursor-pointer">
          {fullName}
        </a>
      </p>
      <p className="text-sm text-purple-700 font-medium">Agente de Imóveis</p>
      <p className="text-xs text-gray-500 mb-4">{agent.email}</p>

      <Link
         href={`/agente?email=${encodeURIComponent(agent.email)}`}
        className="w-full bg-purple-700 text-white py-2 px-3 rounded-lg font-semibold hover:bg-purple-800 transition block text-center"
      >
        Ver outras propriedades
      </Link>
    </div>
  );
}
