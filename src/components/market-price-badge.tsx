'use client';

import { useState, useEffect } from 'react';
import { predictPrice } from '@/lib/predict-engine';
import { TrendingDown, TrendingUp, TrendingUpDown } from 'lucide-react';

export function MarketPriceBadge({ property }: { property: any }) {
  const [badge, setBadge] = useState<{ label: string; color: string; icon: React.ReactNode } | null>(null);

  useEffect(() => {
    const price = Number(property.price) || 0;
    if (!price) return;

    try {
      const predicted = predictPrice({
        localidade: property.bairro || property.cidade || '',
        area: property.size || property.area_terreno || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        tier: property.tier || '',
      });

      if (predicted <= 0) return;

      const diffPercent = ((price - predicted) / predicted) * 100;

      if (diffPercent < -5) {
        setBadge({ label: 'Abaixo do mercado', color: 'bg-green-500', icon: <TrendingDown className="w-3 h-3" /> });
      } else if (diffPercent > 10) {
        setBadge({ label: 'Acima do mercado', color: 'bg-red-500', icon: <TrendingUp className="w-3 h-3" /> });
      } else {
        setBadge({ label: 'Preço justo', color: 'bg-blue-500', icon: <TrendingUpDown className="w-3 h-3" /> });
      }
    } catch {}
  }, [property.price, property.bairro, property.cidade, property.size, property.area_terreno, property.bedrooms, property.bathrooms, property.tier]);

  if (!badge) return null;

  return (
    <div className={`${badge.color} text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm`}>
      {badge.icon}
      <span>{badge.label}</span>
    </div>
  );
}
