'use client';

import { useRef } from 'react';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { PropertyCard } from '@/components/property-card';
import { Clock, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export function RecentlyViewedProperties({ allProperties }: { allProperties: any[] }) {
  const { recentIds, remove } = useRecentlyViewed();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (recentIds.length === 0) return null;

  const recentProperties = recentIds
    .map(id => allProperties.find((p: any) => p.id === id || p.slug === id))
    .filter(Boolean)
    .slice(0, 6);

  if (recentProperties.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="mb-12 relative">
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
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recentProperties.map((property: any) => (
            <div key={property.id} className="min-w-[310px] sm:min-w-[340px] md:min-w-[360px] lg:min-w-[380px] w-[310px] sm:w-[340px] md:w-[360px] lg:w-[380px] snap-start shrink-0">
              <PropertyCard property={property} isClickable={true} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
