import React, { useState, useTransition, useCallback, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Building2, RefreshCw, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PropertyCard } from '@/components/property-card';
import { PendingPropertyCard } from '@/components/pending-property-card';
import LoadingState from '@/app/propriedades/components/loading-state';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { cn } from '@/lib/utils';

import {
  SectionHeader,
  KanbanColumn
} from '@/components/dashboard/shared-ui';

type AgencyPropertiesProps = {
  properties: TPropertyResponseSchema[] | null;
  agencyName: string;
}

function formatPrice(p: TPropertyResponseSchema) {
  const value = typeof p.price === 'number' ? p.price.toLocaleString('pt-PT') : String(p.price ?? '');
  const unit = p.unidade_preco && p.unidade_preco !== 'preco' ? `/${p.unidade_preco}` : '';
  return `Kz ${value}${unit}`;
}

export function AgencyProperties({ properties, agencyName }: AgencyPropertiesProps) {
  const [localProperties, setLocalProperties] = useState(properties);
  const [isRefreshing, startTransition] = useTransition();
  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  const handleOptimisticDelete = useCallback((id: string) => {
    setLocalProperties(prev => prev ? prev.filter(p => p.id !== id) : null);
  }, []);

  const { pending, approved } = useMemo(() => {
    const list = localProperties || [];
    const pending = list.filter(p => p.aprovement_status === 'pending');
    const approved = list.filter(p => p.aprovement_status === 'approved');
    return { pending, approved };
  }, [localProperties]);

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['user-properties'] });
        toast.success('Lista da agência atualizada!');
      } catch (error) {
        toast.error('Erro ao atualizar');
      }
    });
  }, [queryClient]);

  if (!properties) return <LoadingState.LoadingGrid viewMode="grid" />;

  const allSorted = [...pending, ...approved];

  return (
    <>
      {/* ══════════ Mobile — Variação 1: stats + scroll horizontal ══════════ */}
      <div className="lg:hidden mt-6 border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between gap-3 mb-3 px-0.5">
          <div className="min-w-0">
            <h3 className="text-[15px] font-black text-gray-900 truncate">
              Imóveis da {agencyName}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Gestão de inventário da agência.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-border text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold shrink-0 min-h-[38px]"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-3.5 py-3">
            <strong className="block text-[22px] font-black leading-none text-orange-700">{pending.length}</strong>
            <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-orange-600/90 mt-1.5">
              Em análise
            </span>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50 px-3.5 py-3">
            <strong className="block text-[22px] font-black leading-none text-purple-700">{approved.length}</strong>
            <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-purple-600/90 mt-1.5">
              Publicados
            </span>
          </div>
        </div>

        {allSorted.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-border rounded-2xl">
            <Building2 className="w-7 h-7 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-xs font-semibold">Nenhum imóvel na agência.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
              <AnimatePresence mode="popLayout">
                {allSorted.map(p => {
                  const isPending = p.aprovement_status === 'pending';
                  return (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="snap-start shrink-0 w-[200px]"
                    >
                      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="relative h-[104px] bg-gray-100">
                          {p.image || p.gallery?.[0] ? (
                            <img
                              src={p.image || p.gallery?.[0]}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-7 h-7 text-gray-300" />
                            </div>
                          )}
                          <span
                            className={cn(
                              'absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9.5px] font-black uppercase tracking-wide border',
                              isPending
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                            )}
                          >
                            {isPending ? 'Em análise' : 'Publicado'}
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-[12.5px] font-extrabold text-gray-900 leading-snug line-clamp-2">
                            {p.title}
                          </p>
                          <p className="flex items-center gap-1 text-[10.5px] text-gray-500 mt-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {[p.endereco, p.cidade].filter(Boolean).join(', ') || '—'}
                          </p>
                          <p className="text-[14px] font-black text-[#F97316] mt-1.5">{formatPrice(p)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {allSorted.length > 1 && (
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent"
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>

      {/* ══════════ Desktop — Kanban original ══════════ */}
      <div className="hidden lg:block space-y-8 mt-8 border-t border-gray-100 pt-8">
        <SectionHeader
          title={`Imóveis da ${agencyName}`}
          icon={Building2}
          description="Gestão de inventário da agência."
          className="mb-8 px-2"
        >
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-gray-600 rounded-button hover:bg-gray-50 transition-all text-sm font-medium shadow-card"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Atualizar
          </button>
        </SectionHeader>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
          <KanbanColumn title="Em Análise" count={pending.length} color="orange" icon={AlertTriangle}>
            <AnimatePresence mode="popLayout">
              {pending.map(p => (
                <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PendingPropertyCard property={p} onDelete={() => handleOptimisticDelete(p.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
            {pending.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-card">
                <p className="text-gray-400 text-xs">Sem pendentes</p>
              </div>
            )}
          </KanbanColumn>

          <KanbanColumn title="Publicados" count={approved.length} color="purple" icon={CheckCircle2}>
            <AnimatePresence mode="popLayout">
              {approved.map(p => (
                <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <PropertyCard property={p} onDelete={() => handleOptimisticDelete(p.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
            {approved.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-card">
                <p className="text-gray-400 text-xs">Nenhum imóvel</p>
              </div>
            )}
          </KanbanColumn>
        </div>
      </div>
    </>
  );
}
