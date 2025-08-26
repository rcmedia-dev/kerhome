
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useAuth } from './auth-context';
import { CheckCircle2, Eye } from 'lucide-react';
import { PropertyCard } from './property-card';
import { getImoveisFavoritos } from '@/lib/actions/get-favorited-imoveis';
import { TFavoritedPropertyResponseSchema } from '@/lib/types/user';
import { PropertyFavoritedCard } from './property-favorite-card';
import { toggleFavoritoProperty } from '@/lib/actions/toggle-favorite';
import { useRouter } from 'next/navigation';
import { Fatura, PropertyWithViews, TPropertyResponseSchema } from '@/lib/types/property';
import { getSupabaseUserProperties } from '@/lib/actions/get-properties';
import { getMostViewedProperties } from '@/lib/actions/supabase-actions/get-most-seen-propeties';
import { getFaturas } from '@/lib/actions/supabase-actions/user-bills-action';



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
        const data = await getSupabaseUserProperties(user?.id);
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
  const [imoveis, setImoveis] = useState<TFavoritedPropertyResponseSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setisFavorited] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchFavoritos() {
      if (!user?.id) return;

      setLoading(true);
      const data = await getImoveisFavoritos(user.id);
      console.log('Favoritos:', data);
      setImoveis(data ?? []);
      setLoading(false);
    }

    fetchFavoritos();
  }, [user?.id]);

  function handleRemoveFavorito(propertyId: string) {
    if (!user?.id) return;

    startTransition(() => {
      toggleFavoritoProperty(user.id, propertyId).then((res) => {
        if (res.success && res.isFavorited === false) {
          setImoveis((prev) => prev.filter((p) => p.id !== propertyId));
          setisFavorited(res.isFavorited);
          router.refresh(); // Revalida a rota do dashboard
        }
      });
    });
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Imóveis Guardados</h2>

      {loading ? (
        <div className="text-center text-gray-500">A carregar favoritos...</div>
      ) : imoveis.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum imóvel favorito.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {imoveis.map((property) => (
            <PropertyFavoritedCard
              key={property.propertyid}
              property={{
                ...property,
                price: property.price !== null ? String(property.price) : null, // ← conversão aqui
              }}
              user={user}
              onRemove={() => handleRemoveFavorito(property.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}



export function Faturas() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchFaturas = async () => {
      setLoading(true);
      try {
        const result = await getFaturas(user.id); // chama a action
        setFaturas(result);
      } catch (error) {
        console.error('Erro ao carregar faturas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaturas();
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
                  {new Date(fatura.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function PropriedadesMaisVisualizadas() {
  const [properties, setProperties] = useState<PropertyWithViews[]>([]);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<number | null>(null)
  const { user } = useAuth();

  useEffect(() => {
    async function fetchMostViewedProperties() {
      try {
        setLoading(true);
        // Busca as propriedades mais visualizadas
        const data = await getMostViewedProperties(user?.id);
        console.log('views totals:', data.length)
        setViews(data.length)
        // Ordena por número de visualizações (decrescente)
        const sortedProperties = data.sort((a, b) => (b.views || 0) - (a.views || 0));
        setProperties(sortedProperties);
      } catch (error) {
        console.error('Erro ao buscar propriedades mais visualizadas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMostViewedProperties();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Propriedades Mais Visualizadas</h2>
        <div className="text-center text-gray-500">Carregando propriedades...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Propriedades Mais Visualizadas</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Eye className="w-4 h-4" />
          <span>Ordenado por visualizações</span>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center text-gray-500">Nenhuma propriedade visualizada ainda.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{ views || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}