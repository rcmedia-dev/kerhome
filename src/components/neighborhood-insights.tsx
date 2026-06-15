'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ThumbsUp, ThumbsDown, Lightbulb, Train, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export function NeighborhoodInsights({ cidade, bairro, provincia }: { cidade?: string | null; bairro?: string | null; provincia?: string | null }) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['neighborhood-insights', cidade, bairro, provincia],
    queryFn: async () => {
      const res = await fetch('/api/mywai/neighborhood-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cidade, bairro, provincia }),
      });
      if (!res.ok) throw new Error('Falha ao carregar insights');
      return res.json();
    },
    enabled: !!cidade || !!bairro,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });

  if (!cidade && !bairro) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Building2 className="w-5 h-5 text-purple-700" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">Insights do Bairro</h3>
            <p className="text-sm text-gray-500">{bairro || cidade}{bairro && cidade ? `, ${cidade}` : ''}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-5 border-t border-gray-100 pt-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Analisando o bairro...</span>
                </div>
              )}

              {error && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Não foi possível carregar os insights do bairro.
                </p>
              )}

              {data && !isLoading && (
                <>
                  {data.overview && (
                    <p className="text-sm text-gray-700 leading-relaxed">{data.overview}</p>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.pros?.length > 0 && (
                      <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-3">
                          <ThumbsUp className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-sm text-green-800">Vantagens</span>
                        </div>
                        <ul className="space-y-2">
                          {data.pros.map((item: string, i: number) => (
                            <li key={i} className="text-xs text-green-700 flex gap-2">
                              <span className="mt-1 w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.cons?.length > 0 && (
                      <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                        <div className="flex items-center gap-2 mb-3">
                          <ThumbsDown className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-sm text-red-800">Pontos de Atenção</span>
                        </div>
                        <ul className="space-y-2">
                          {data.cons.map((item: string, i: number) => (
                            <li key={i} className="text-xs text-red-700 flex gap-2">
                              <span className="mt-1 w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {data.infrastructure && (
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Train className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-sm text-blue-800">Infraestrutura</span>
                      </div>
                      <p className="text-xs text-blue-700 leading-relaxed">{data.infrastructure}</p>
                    </div>
                  )}

                  {data.investmentTip && (
                    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold text-sm text-amber-800">Dica de Investimento</span>
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">{data.investmentTip}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
