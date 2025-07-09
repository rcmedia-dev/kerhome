'use client';


import { useEffect, useState } from 'react';
import { PropertyCard } from "@/components/property-showcase";
import { Property } from "@/lib/types/property";
import { useSearchParams } from 'next/navigation';
import Lottie from 'lottie-react';
import animationData from '@/../public/animation/not_found_animation.json';
import { searchProperties } from '@/lib/actions/search-properties';

export function PropriedadesPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.toLowerCase() || '';
  const statusParam = searchParams.get('status');
  const status = statusParam || undefined;
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const props = await searchProperties({ q, status });
      setProperties(props);
      setLoading(false);
    }
    load();
  }, [q, status]);

  if (!loading && properties.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-full max-w-xs mx-auto mb-8">
          <Lottie animationData={animationData} loop={true} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Nenhum imóvel encontrado</h2>
        <p className="text-gray-500 mb-6">Não encontramos imóveis para sua busca. Tente outros filtros ou palavras-chave.</p>
        <a href="/" className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-2 rounded-lg font-medium transition">Voltar para a Home</a>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Resultados da Pesquisa</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.title} property={p} />
          ))}
        </div>
      )}
    </section>
  );
}
