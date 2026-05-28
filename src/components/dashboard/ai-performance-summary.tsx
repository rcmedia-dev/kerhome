'use client'

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Lightbulb, Star, RefreshCw } from 'lucide-react';

type PerformanceData = {
  insight: string;
  highlights: string[];
  recommendation: string;
};

export function AiPerformanceSummary({
  stats,
  ownerId,
  periodDays,
}: {
  stats: any;
  ownerId: string;
  periodDays: number;
}) {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch('/api/mywai/performance-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats, ownerId, periodDays }),
    })
      .then(res => res.json())
      .then(json => {
        if (!cancelled && !json.erro) {
          setData(json);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [stats, ownerId, periodDays]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
        <div className="p-5 space-y-3">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-50 rounded w-full" />
          <div className="h-3 bg-gray-50 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-200" />
          <h3 className="text-sm font-bold text-white">Resumo MYWAI</h3>
          <span className="ml-auto text-[10px] uppercase tracking-widest bg-white/15 text-white px-2 py-0.5 rounded-full font-semibold">
            {periodDays} dias
          </span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <TrendingUp size={16} className="text-purple-600 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed">{data.insight}</p>
        </div>

        {data.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.highlights.map((h, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                <Star size={10} />
                {h}
              </span>
            ))}
          </div>
        )}

        {data.recommendation && (
          <div className="flex items-start gap-3 bg-orange-50 rounded-lg p-3 border border-orange-100">
            <Lightbulb size={16} className="text-orange-500 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-800 leading-relaxed">{data.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
