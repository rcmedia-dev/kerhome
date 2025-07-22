
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { CheckCircle2 } from 'lucide-react';
import { PropertyCard } from './property-card';
import { getProperties, getUserProperties } from '@/lib/actions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';



export function MinhasPropriedades() {
  const [properties, setProperties] = useState<TPropertyResponseSchema[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  if (!user) {
    alert('Você precisa estar logado para acessar suas propriedades.');
    return null;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserProperties(user?.id);
        console.log('Propriedades do usuário:', data);
        setProperties(data);
      } catch (error) {
        console.error('Erro ao buscar propriedades:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Carregando propriedades...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Minhas Propriedades</h2>

      {properties.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum imóvel cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}



export function Favoritas() {

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Imóveis Guardados</h2>
      <div className="text-center text-gray-500">Nenhum imóvel favorito.</div>
    </div>
  );
}


type Fatura = {
  id: string;
  servico: string;
  valor: number;
  status: 'pago' | 'pendente';
  criadoEm: string;
};

// Faturas de exemplo (mock)
const mockFaturas: Fatura[] = [
  {
    id: 'ft1',
    servico: 'Publicação de imóvel premium',
    valor: 25000,
    status: 'pago',
    criadoEm: '2025-07-01T12:00:00Z',
  },
  {
    id: 'ft2',
    servico: 'Renovação de anúncio',
    valor: 10000,
    status: 'pendente',
    criadoEm: '2025-07-10T12:00:00Z',
  },
];

export function Analytics() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Simula carregamento
    const timer = setTimeout(() => {
      setFaturas(mockFaturas);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 text-center text-gray-500">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Minhas Faturas</h2>

      {loading ? (
        <div>Carregando faturas...</div>
      ) : faturas.length === 0 ? (
        <div>Nenhuma fatura encontrada.</div>
      ) : (
        <table className="w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="border-b font-semibold">
              <th className="p-2">Serviço</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Status</th>
              <th className="p-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {faturas.map((fatura) => (
              <tr key={fatura.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{fatura.servico}</td>
                <td className="p-2">{fatura.valor.toLocaleString()} Kz</td>
                <td className="p-2 capitalize">
                  {fatura.status === 'pago' ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Pago
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-medium">Pendente</span>
                  )}
                </td>
                <td className="p-2">
                  {new Date(fatura.criadoEm).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

