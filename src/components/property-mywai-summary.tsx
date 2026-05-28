'use client'

import { useEffect, useState, useRef } from 'react';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { Sparkles, Star, Target, TrendingUp, Lightbulb, MapPin, Ruler } from 'lucide-react';

type SummaryData = {
  summary: string;
  highlights: string[];
  idealFor: string;
  priceContext: string;
};

export function PropertyMywaiSummary({ property }: { property: TPropertyResponseSchema }) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch('/api/mywai/property-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property }),
    })
      .then(res => res.json())
      .then(json => {
        if (!cancelled) {
          if (json.erro) {
            setError(true);
          } else {
            setData(json);
            requestAnimationFrame(() => {
              cardRef.current?.classList.remove('opacity-0', 'translate-y-4');
            });
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 animate-pulse">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="h-5 bg-gray-200 rounded w-36" />
            <div className="h-4 bg-gray-200 rounded-full w-10 ml-auto" />
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl bg-gray-50 p-4 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-gray-200 mx-auto" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const precoM2 = property.price && property.size
    ? `${Math.round(Number(property.price) / Number(property.size)).toLocaleString()} Kz/m²`
    : null;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-0 translate-y-4 transition-all duration-700 ease-out"
    >
      <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-orange-500 px-5 md:px-6 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_70%)]" />
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">Análise MYWAI</h3>
            <p className="text-white/70 text-[11px] leading-tight">Análise inteligente do imóvel</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-full ring-1 ring-white/20">
            <Lightbulb size={10} />
            IA
          </span>
        </div>
      </div>

      <div className="p-5 md:p-6 space-y-6">

        <div className="relative pl-4 border-l-4 border-purple-300">
          <p className="text-gray-700 leading-relaxed text-sm md:text-[15px]">
            {data.summary}
          </p>
          {precoM2 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                <Ruler size={12} />
                {precoM2}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
                <MapPin size={12} />
                {[property.bairro, property.cidade].filter(Boolean).join(', ') || property.provincia || 'Localização'}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {data.highlights.length > 0 && (
            <div className="group bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100 hover:border-purple-200 hover:shadow-md hover:shadow-purple-100/50 transition-all duration-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Star size={18} className="text-purple-600" />
                </div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Destaques</span>
              </div>
              <ul className="space-y-2">
                {data.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.idealFor && (
            <div className="group bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100 hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50 transition-all duration-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Target size={18} className="text-orange-600" />
                </div>
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Ideal para</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.idealFor.toLowerCase().startsWith('ideal') || data.idealFor.toLowerCase().startsWith('perfeito')
                  ? data.idealFor
                  : `Perfeito para ${data.idealFor.charAt(0).toLowerCase() + data.idealFor.slice(1)}`
                }
              </p>
            </div>
          )}

          {data.priceContext && (
            <div className="group bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <TrendingUp size={18} className="text-blue-600" />
                </div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Preço</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.priceContext}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
