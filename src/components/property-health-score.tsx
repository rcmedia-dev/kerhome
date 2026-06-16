'use client';

import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Lightbulb, AlertTriangle, RefreshCw, Image, Video, MapPin, Type, AlignLeft, DollarSign, Home, Maximize, Grid3x3 } from 'lucide-react';
import { analyzePropertyHealth, type PropertyHealthAnalysis } from '@/lib/functions/supabase-actions/analyze-property-health';

const FIELD_ICONS: Record<string, any> = {
  'Título': Type,
  'Descrição detalhada': AlignLeft,
  'Preço': DollarSign,
  'Endereço completo': MapPin,
  'Foto de capa': Image,
  'Galeria de fotos': Image,
  'Tipo de imóvel': Home,
  'Quartos': Home,
  'Banheiros': Home,
  'Área/terreno': Maximize,
  'Características': Grid3x3,
  'Vídeo/Tour 360°': Video,
};

export function PropertyHealthScore({ propertyId, onRefresh }: { propertyId: string; onRefresh?: () => void }) {
  const [data, setData] = useState<PropertyHealthAnalysis | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    analyzePropertyHealth(propertyId).then((result) => {
      if (!cancelled) { setData(result); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [propertyId]);

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-2 px-3 py-1.5">
        <div className="w-4 h-4 bg-gray-100 rounded-full" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    );
  }

  if (!data) return null;

  const scoreColor = data.score >= 80 ? 'text-green-600' : data.score >= 50 ? 'text-orange-500' : 'text-red-500';
  const scoreBg = data.score >= 80 ? 'bg-green-50' : data.score >= 50 ? 'bg-orange-50' : 'bg-red-50';

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${scoreBg} ${scoreColor} border-current/20 hover:shadow-sm`}
      >
        <Sparkles size={10} />
        <span>{data.score}</span>
        <span className="font-normal opacity-60">/100</span>
      </button>

      {expanded && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />
          <div className="absolute left-0 top-full mt-2 z-50 w-80 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-200" />
                <span className="text-xs font-bold text-white">Saúde do Anúncio</span>
              </div>
              <span className={`text-xs font-black ${data.score >= 80 ? 'text-green-300' : data.score >= 50 ? 'text-orange-300' : 'text-red-300'}`}>
                {data.score}/100
              </span>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {data.tips.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb size={10} className="text-orange-500" />
                    Dicas para melhorar
                  </h4>
                  {data.tips.slice(0, 4).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 bg-orange-50 rounded-lg p-2.5 border border-orange-100">
                      <AlertTriangle size={12} className="text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-orange-800 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Itens verificados</h4>
              {(() => {
                const items = [
                  { label: 'Foto de capa', ok: data.score > 20 },
                  { label: 'Título + Descrição', ok: data.score >= 30 },
                  { label: 'Galeria (3+ fotos)', ok: data.score >= 40 },
                  { label: 'Localização completa', ok: data.score >= 25 },
                  { label: 'Características', ok: data.score >= 50 },
                  { label: 'Vídeo/Tour 360°', ok: data.score >= 65 },
                ];
                return items.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-[11px]">
                    {item.ok ? (
                      <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                    ) : (
                      <XCircle size={12} className="text-gray-300 shrink-0" />
                    )}
                    <span className={item.ok ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                  </div>
                ));
              })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
