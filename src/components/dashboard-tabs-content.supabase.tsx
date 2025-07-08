import React, { useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { getSupabaseClient } from '@/lib/supabase';
import { PropertyCard } from './property-showcase';
import { Property } from '@/lib/types/property';

export function MinhasPropriedades() {
  const { user } = useAuth();
  const [imoveis, setImoveis] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchProperties = async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('id', { ascending: false });
      if (error || !data) {
        setImoveis([]);
      } else {
        // Mapeia os dados para garantir o tipo Property
        setImoveis(
          data.map((item: any) => ({
            id: item.id,
            image: item.image || '/house1.jpg',
            gallery: item.gallery || [],
            title: item.title || 'Sem título',
            description: item.description || '',
            location: item.location || item.cidade || item.provincia || item.pais || '',
            endereco: item.endereco || '',
            bairro: item.bairro || '',
            cidade: item.cidade || '',
            provincia: item.provincia || '',
            pais: item.pais || '',
            tipo: item.tipo || '',
            status: item.status || 'para comprar',
            rotulo: item.rotulo || '',
            price: item.price ? String(item.price) : '0',
            unidadePreco: item.unidadepreco || '',
            precoAntes: item.precoantes || '',
            precoDepois: item.precodepois || '',
            precoChamada: item.precochamada || '',
            caracteristicas: item.caracteristicas || [],
            size: item.size ? String(item.size) : '',
            areaTerreno: item.areaterreno ? String(item.areaterreno) : '',
            bedrooms: item.bedrooms || 0,
            bathrooms: item.bathrooms || 0,
            garagens: item.garagens || 0,
            garagemTamanho: item.garagemtamanho || '',
            anoConstrucao: item.anoconstrucao ? String(item.anoconstrucao) : '',
            propertyId: item.propertyid || '',
            detalhesAdicionais: item.detalhesadicionais || [],
            anexos: item.anexos || [],
            video: item.video || '',
            imagem360: item.imagem360 || '',
            planosChao: item.planoschao || false,
            notaPrivada: item.notaprivada || '',
          }))
        );
      }
      setLoading(false);
    };
    fetchProperties();
  }, [user]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Minhas Propriedades</h2>
      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : imoveis.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum imóvel cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {imoveis.map((imovel) => (
            <PropertyCard key={imovel.id} property={imovel} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Favoritas() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchFavoritos = async () => {
      const supabase = getSupabaseClient();
      // Supondo que existe uma tabela 'favorites' com user_id e property_id
      const { data: favs, error: favError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);
      if (favError || !favs || favs.length === 0) {
        setFavoritos([]);
        setLoading(false);
        return;
      }
      const propertyIds = favs.map((f: any) => f.property_id);
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);
      if (!properties) {
        setFavoritos([]);
      } else {
        setFavoritos(
          properties.map((item: any) => ({
            id: item.id,
            image: item.image || '/house1.jpg',
            gallery: item.gallery || [],
            title: item.title || 'Sem título',
            description: item.description || '',
            location: item.location || item.cidade || item.provincia || item.pais || '',
            endereco: item.endereco || '',
            bairro: item.bairro || '',
            cidade: item.cidade || '',
            provincia: item.provincia || '',
            pais: item.pais || '',
            tipo: item.tipo || '',
            status: item.status || 'para comprar',
            rotulo: item.rotulo || '',
            price: item.price ? String(item.price) : '0',
            unidadePreco: item.unidadepreco || '',
            precoAntes: item.precoantes || '',
            precoDepois: item.precodepois || '',
            precoChamada: item.precochamada || '',
            caracteristicas: item.caracteristicas || [],
            size: item.size ? String(item.size) : '',
            areaTerreno: item.areaterreno ? String(item.areaterreno) : '',
            bedrooms: item.bedrooms || 0,
            bathrooms: item.bathrooms || 0,
            garagens: item.garagens || 0,
            garagemTamanho: item.garagemtamanho || '',
            anoConstrucao: item.anoconstrucao ? String(item.anoconstrucao) : '',
            propertyId: item.propertyid || '',
            detalhesAdicionais: item.detalhesadicionais || [],
            anexos: item.anexos || [],
            video: item.video || '',
            imagem360: item.imagem360 || '',
            planosChao: item.planoschao || false,
            notaPrivada: item.notaprivada || '',
          }))
        );
      }
      setLoading(false);
    };
    fetchFavoritos();
  }, [user]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Imóveis Guardados</h2>
      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : favoritos.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum imóvel favorito.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favoritos.map((imovel) => (
            <PropertyCard key={imovel.id} property={imovel} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Analytics() {
  const { user } = useAuth();
  const [faturas, setFaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchFaturas = async () => {
      const supabase = getSupabaseClient();
      // Supondo que existe uma tabela 'faturas' com user_id
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });
      setFaturas(data || []);
      setLoading(false);
    };
    fetchFaturas();
  }, [user]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Faturas</h2>
      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : faturas.length === 0 ? (
        <div className="text-center text-gray-500">Nenhuma fatura encontrada.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 font-semibold">Plano</th>
                <th className="py-2 px-4 font-semibold">Valor</th>
                <th className="py-2 px-4 font-semibold">Data</th>
                <th className="py-2 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {faturas.map(fatura => (
                <tr key={fatura.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{fatura.plano}</td>
                  <td className="py-2 px-4">{fatura.valor}</td>
                  <td className="py-2 px-4">{fatura.data}</td>
                  <td className={`py-2 px-4 font-semibold ${fatura.status === 'Pago' ? 'text-green-600' : 'text-orange-600'}`}>{fatura.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
