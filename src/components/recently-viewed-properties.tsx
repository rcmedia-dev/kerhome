'use client';

import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { PropertyCard } from '@/components/property-card';
import Link from 'next/link';
import { ArrowRight, Clock, Trash2 } from 'lucide-react';

export function RecentlyViewedProperties({ allProperties }: { allProperties: any[] }) {
  const { recentIds, remove } = useRecentlyViewed();

  if (recentIds.length === 0) return null;

  const recentProperties = recentIds
    .map(id => allProperties.find((p: any) => p.id === id || p.slug === id))
    .filter(Boolean)
    .slice(0, 6);

  if (recentProperties.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Vistos Recentemente</h2>
        </div>
        <button
          onClick={() => recentIds.forEach(id => remove(id))}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Limpar
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 -mx-4 px-4 snap-x snap-mandatory">
        {recentProperties.map((property: any) => (
          <div key={property.id} className="min-w-[310px] sm:min-w-[340px] md:min-w-[360px] lg:min-w-[380px] w-[310px] sm:w-[340px] md:w-[360px] lg:w-[380px] snap-start shrink-0">
            <PropertyCard property={property} isClickable={true} />
          </div>
        ))}
      </div>
      {recentProperties.length >= 4 && (
        <div className="mt-4 text-center">
          <Link
            href="/propriedades"
            className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            Ver todos os imóveis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
