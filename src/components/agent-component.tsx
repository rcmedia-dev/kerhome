'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getAgenteData } from '@/lib/actions/get-agent-data';
import { getAgentesDestaque } from '@/lib/actions/get-agents-destaque';

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AgentePageComponent() {
  const [agente, setAgente] = useState<any>(null);
  const [outrosAgentes, setOutrosAgentes] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    async function fetchData() {
      if (!email) return;
      const dadosAgente = await getAgenteData(email);
      const destaques = await getAgentesDestaque();
      setAgente(dadosAgente);
      setOutrosAgentes(destaques);
    }
    fetchData();
  }, [email]);

  if (!agente) return <div className="text-center py-10">Carregando agente...</div>;

  return (
    <section className="min-h-screen bg-gray-50 text-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Perfil do agente */}
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 mb-10">
          {agente.avatar ? (
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-600 mb-4">
              <Image src={agente.avatar} alt={agente.nome} width={112} height={112} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-2xl border-4 border-purple-600 mb-4">
              {getInitials(agente.nome)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{agente.nome}</h1>
          <p className="text-purple-700 font-medium">{agente.titulo}</p>
          <p className="text-gray-500 text-sm mb-2">{agente.email}</p>
          <p className="text-gray-500 text-sm mb-2">{agente.telefone}</p>
          <p className="text-gray-600 text-center mt-2">{agente.descricao}</p>
        </div>

        {/* Formulário de contato */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Entrar em contato com o agente</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nome" className="border px-3 py-2 rounded-md text-sm col-span-1" required />
            <input type="tel" placeholder="Telefone" className="border px-3 py-2 rounded-md text-sm col-span-1" required />
            <input type="email" placeholder="Email" className="border px-3 py-2 rounded-md text-sm md:col-span-2" required />
            <textarea placeholder="Mensagem" rows={4} className="border px-3 py-2 rounded-md text-sm md:col-span-2" required />
            <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition md:col-span-2">Enviar Mensagem</button>
          </form>
        </div>

        {/* Imóveis do agente */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Imóveis deste agente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {agente.imoveis.map((imovel: any) => (
              <div key={imovel.id} className="bg-white rounded-xl shadow border overflow-hidden flex flex-col">
                <Image src={imovel.imagem} alt={imovel.titulo} width={400} height={250} className="object-cover w-full h-40" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{imovel.titulo}</h3>
                    <p className="text-sm text-gray-500">{imovel.local}</p>
                  </div>
                  <p className="text-orange-500 font-bold mt-2">{imovel.preco}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outros agentes em destaque */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Outros agentes em destaque</h2>
          <ul className="flex flex-col sm:flex-row gap-6">
            {outrosAgentes.map((ag, idx) => (
              <li key={idx} className="flex flex-col items-center flex-1">
                {ag.avatar ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 mb-2">
                    <Image src={ag.avatar} alt={ag.nome} width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-sm border-2 border-orange-500 mb-2">
                    {getInitials(ag.nome)}
                  </div>
                )}
                <p className="text-sm font-semibold text-gray-800">{ag.nome}</p>
                <p className="text-xs text-gray-500">{ag.email}</p>
                <p className="text-xs text-orange-500 font-bold mt-1">{ag.vendas} casas vendidas</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
