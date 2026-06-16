'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, ArrowLeft, Home } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { createClient } from '@/lib/supabase/client';
import { TPropertyResponseSchema } from '@/lib/types/property';

export function PropertiesByLocation({ cidade, bairro }: { cidade: string; bairro?: string }) {
  const pathname = usePathname();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';
  const [properties, setProperties] = useState<TPropertyResponseSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from('properties')
        .select('*')
        .eq('aprovement_status', 'approved')
        .ilike('cidade', `%${cidade}%`)
        .order('created_at', { ascending: false });

      if (bairro) {
        query = query.ilike('bairro', `%${bairro}%`);
      }

      const { data } = await query;
      setProperties(data || []);
      setLoading(false);
    };
    fetchData();
  }, [cidade, bairro]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: 'Imóveis', href: '/propriedades' },
          { label: bairro ? cidade : cidade },
          ...(bairro ? [{ label: bairro }] : []),
        ]} currentUrl={`${siteUrl}${pathname}`} />

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-purple-100 rounded-xl">
            <MapPin className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Imóveis em {cidade}{bairro ? ` — ${bairro}` : ''}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'A carregar...' : `${properties.length} imóveis encontrados`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl h-80" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Nenhum imóvel encontrado</h2>
            <p className="text-gray-500 mb-6">Nenhum imóvel disponível em {cidade}{bairro ? `, ${bairro}` : ''}.</p>
            <Link href="/propriedades" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700">
              <ArrowLeft className="w-4 h-4" />
              Ver todos os imóveis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} isClickable />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
