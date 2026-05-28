'use client'

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from 'lucide-react';

type MarketData = {
  predictedPrice: number;
  currentPrice: number;
  diff: number;
  diffPercent: number;
  verdict: string;
  message: string;
};

export function AiMarketPrice({ property }: { property: any }) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch('/api/mywai/market-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property }),
    })
      .then(res => res.json())
      .then(json => {
        if (!cancelled && !json.erro) {
          setData(json);
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
        <div className="h-6 bg-gray-50 rounded w-2/3" />
      </div>
    );
  }

  if (!data || !data.predictedPrice) return null;

  const isAbove = data.diffPercent > 10;
  const isBelow = data.diffPercent < -10;
  const Icon = isAbove ? TrendingUp : isBelow ? TrendingDown : Minus;
  const iconColor = isAbove ? 'text-red-500' : isBelow ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp size={15} />
          Análise de Preço MYWAI
        </h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Preço Actual</p>
            <p className="text-xl font-bold text-gray-900">Kz {data.currentPrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500 font-medium">Preço Estimado</p>
            <p className="text-xl font-bold text-gray-900">Kz {data.predictedPrice.toLocaleString()}</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 p-3 rounded-lg ${isAbove ? 'bg-red-50' : isBelow ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <Icon size={18} className={iconColor} />
          <div>
            <p className={`text-sm font-bold ${isAbove ? 'text-red-700' : isBelow ? 'text-green-700' : 'text-yellow-700'}`}>
              {isAbove ? `${data.diffPercent}% acima do mercado` : isBelow ? `${Math.abs(data.diffPercent)}% abaixo do mercado` : 'Dentro do esperado'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{data.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
