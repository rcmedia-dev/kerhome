'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { AgentProfile, getAgentByEmail, getAgentProperties } from '@/lib/actions/get-agent';
import { TPropertyResponseSchema } from '@/lib/types/property';

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean) // Remove strings vazias
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AgentePageComponent() {
  const [agente, setAgente] = useState<AgentProfile | null>(null);
  const [imoveis, setImoveis] = useState<TPropertyResponseSchema[]>([]);
  const [outrosAgentes, setOutrosAgentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    async function fetchData() {
      if (!email) return;
      
      try {
        setLoading(true);
        const dadosAgente = await getAgentByEmail(email);
        const properties = await getAgentProperties(dadosAgente.id);
        
        setAgente(dadosAgente);
        setImoveis(properties);
        // const destaques = await getAgentesDestaque();
        // setOutrosAgentes(destaques);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-700">{error}</p>
          <Link href="/" className="mt-4 inline-block text-purple-600 hover:underline">
            Voltar à página inicial
          </Link>
        </div>
      </div>
    );
  }

  if (!agente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Agente não encontrado</h2>
          <p className="text-gray-700">Nenhum agente encontrado com o email fornecido.</p>
          <Link href="/" className="mt-4 inline-block text-purple-600 hover:underline">
            Voltar à página inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 text-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Perfil do agente */}
        <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 mb-10">
          <div className="w-28 h-28 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-2xl border-4 border-purple-600 mb-4">
            {getInitials(`${agente.primeiro_nome} ${agente.ultimo_nome}`)}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {agente.primeiro_nome} {agente.ultimo_nome}
          </h1>
          
          <p className="text-purple-700 font-medium">Agente de Imóveis</p>
          
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <a href={`mailto:${agente.email}`} className="hover:underline">
              {agente.email}
            </a>
          </div>
          
          {agente.telefone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <a href={`tel:${agente.telefone}`} className="hover:underline">
                {agente.telefone}
              </a>
            </div>
          )}
          
          {agente.sobre_mim && (
            <p className="text-gray-600 text-center mt-4 max-w-2xl">
              {agente.sobre_mim}
            </p>
          )}
        </div>

        {/* Formulário de contato */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Entrar em contato com o agente</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Nome" 
              className="border px-3 py-2 rounded-md text-sm col-span-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              required 
            />
            <input 
              type="tel" 
              placeholder="Telefone" 
              className="border px-3 py-2 rounded-md text-sm col-span-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              required 
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="border px-3 py-2 rounded-md text-sm md:col-span-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              required 
            />
            <textarea 
              placeholder="Mensagem" 
              rows={4} 
              className="border px-3 py-2 rounded-md text-sm md:col-span-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              required 
            />
            <button 
              type="submit" 
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition md:col-span-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Enviar Mensagem
            </button>
          </form>
        </div>

        {/* Imóveis do agente */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Imóveis deste agente</h2>
          
          {imoveis.length === 0 ? (
            <div className="bg-white rounded-xl shadow border p-6 text-center">
              <p className="text-gray-500">Nenhum imóvel cadastrado por este agente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {imoveis.map((imovel) => {
                const isForRent = imovel.status === 'para alugar';
                const propertyRoute = isForRent 
                  ? `/alugar/${imovel.id}` 
                  : `/comprar/${imovel.id}`;

                return (
                  <Link 
                    href={propertyRoute} 
                    key={imovel.id} 
                    className="bg-white rounded-xl shadow border overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                  >
                    <div className="relative w-full h-40">
                      <Image 
                        src={imovel.gallery[0] || '/placeholder-property.jpg'} 
                        alt={imovel.title} 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-purple-700">
                          {imovel.title}
                        </h3>
                        <p className="text-sm text-gray-500">{imovel.endereco}</p>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="text-orange-500 font-bold">
                          {new Intl.NumberFormat('pt-AO', {
                            style: 'currency',
                            currency: 'AOA'
                          }).format(imovel.price ?? 0)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Outros agentes em destaque */}
        {outrosAgentes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Outros agentes em destaque</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {outrosAgentes.map((ag, idx) => (
                <Link 
                  href={`/agente?email=${ag.email}`} 
                  key={idx} 
                  className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  {ag.avatar ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 mb-2">
                      <Image 
                        src={ag.avatar} 
                        alt={ag.nome} 
                        width={64} 
                        height={64} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-sm border-2 border-orange-500 mb-2">
                      {getInitials(ag.nome)}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-800 text-center">{ag.nome}</p>
                  <p className="text-xs text-orange-500 font-bold mt-1 text-center">
                    {ag.vendas} {ag.vendas === 1 ? 'casa vendida' : 'casas vendidas'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}