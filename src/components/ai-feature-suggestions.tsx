'use client';

import { useState } from 'react';
import { Sparkles, Lightbulb, Plus, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const STATIC_SUGGESTIONS: Record<string, string[]> = {
  apartments: ['Piscina', 'Segurança 24h', 'Ar Condicionado', 'Estacionamento', 'Vista para o Mar', 'Gerador', 'Varanda', 'Elevador'],
  houses: ['Piscina', 'Jardim', 'Churrasqueira', 'Garagem para 2 Carros', 'Sistema de Alarme', 'Cisterna', 'Área de Lazer', 'Cozinha Planejada'],
  commercial: ['Montra/Expositor', 'Ar Condicionado', 'Casa de Banho Privativa', 'Estacionamento para Clientes', 'Acesso para Deficientes', 'Sala de Reunião'],
  land: ['Água', 'Eletricidade', 'Esgoto', 'Cerca', 'Topografia Plana', 'Acesso Asfaltado'],
};

export function AiFeatureSuggestions({
  tipo,
  currentFeatures,
  onAddFeature,
}: {
  tipo?: string;
  currentFeatures: string[];
  onAddFeature: (feature: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = () => {
    setLoading(true);
    let base: string[];
    if (tipo?.toLowerCase().includes('apartamento')) base = STATIC_SUGGESTIONS.apartments;
    else if (tipo?.toLowerCase().includes('moradia') || tipo?.toLowerCase().includes('villa')) base = STATIC_SUGGESTIONS.houses;
    else if (tipo?.toLowerCase().includes('comercial') || tipo?.toLowerCase().includes('loja')) base = STATIC_SUGGESTIONS.commercial;
    else if (tipo?.toLowerCase().includes('terreno')) base = STATIC_SUGGESTIONS.land;
    else base = [...STATIC_SUGGESTIONS.apartments, ...STATIC_SUGGESTIONS.houses];

    const filtered = base.filter(f => !currentFeatures.includes(f));
    setSuggestions(filtered.sort(() => Math.random() - 0.5).slice(0, 6));
    setLoading(false);
    setIsOpen(true);
  };

  const handleAdd = (feature: string) => {
    onAddFeature(feature);
    setSuggestions(prev => prev.filter(f => f !== feature));
    toast.success(`"${feature}" adicionada`);
  };

  return (
    <div className="relative">
      <button
        onClick={generateSuggestions}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
      >
        {loading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
        Sugerir Características
      </button>

      {isOpen && suggestions.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-72 bg-white rounded-xl border border-gray-100 shadow-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Lightbulb size={12} className="text-orange-500" />
                Sugestões para {tipo || 'imóvel'}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gray-500">
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((feature) => (
                <button
                  key={feature}
                  onClick={() => handleAdd(feature)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 text-xs text-gray-600 hover:text-purple-700 font-medium transition-all group"
                >
                  <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  {feature}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
