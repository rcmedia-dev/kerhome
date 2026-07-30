import React, { useState, useTransition, useCallback, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PropertyCard } from '@/components/property-card';
import { PendingPropertyCard } from '@/components/pending-property-card';
import { RejectedPropertyCard } from '@/components/rejected-property-card';
import LoadingState from '@/app/propriedades/components/loading-state';
import { PropertyHealthScore } from '@/components/property-health-score';

import { TPropertyResponseSchema } from '@/lib/types/property';
import { cn } from '@/lib/utils';

import {
  SectionHeader,
  KanbanColumn,
  EmptyState,
  ErrorBoundary
} from '@/components/dashboard/shared-ui';

type MinePropertiesProps = {
  userProperties: TPropertyResponseSchema[] | null;
}

export function MinhasPropriedades({ userProperties }: MinePropertiesProps) {
  const [localProperties, setLocalProperties] = useState(userProperties);
  const [isRefreshing, startTransition] = useTransition();
  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalProperties(userProperties);
  }, [userProperties]);

  const handleOptimisticDelete = useCallback((id: string) => {
    setLocalProperties(prev => prev ? prev.filter(p => p.id !== id) : null);
  }, []);

  const { pending, approved, suspended, hasSuspended } = useMemo(() => {
    const list = localProperties || [];
    const pending = list.filter(p => p.aprovement_status === 'pending');
    const approved = list.filter(p => p.aprovement_status === 'approved');
    const suspended = list.filter((p: any) => p.rejected_reason === 'suspicious' || p.is_boost_suspended);
    return {
      pending,
      approved,
      suspended,
      hasSuspended: suspended.length > 0
    };
  }, [localProperties]);

  const handleRefresh = useCallback(() => {
    startTransition(async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['user-properties'] });
        toast.success('Lista de propriedades atualizada!');
      } catch (error) {
        toast.error('Erro ao atualizar a lista');
      }
    });
  }, [queryClient]);

  if (!userProperties) return <LoadingState.LoadingGrid viewMode="grid" />;

  return (
    <ErrorBoundary>
      <div className="w-full">
        <SectionHeader
          title="Minhas Propriedades"
          icon={TrendingUp}
          description="Gerencie seus imóveis por status."
          className="mb-8 px-2"
        >
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-border text-gray-600 rounded-button hover:bg-gray-50 transition-all disabled:opacity-50 shadow-card text-[11px] sm:text-sm font-medium"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </SectionHeader>

        {hasSuspended && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 sm:mb-6 bg-red-50 border border-red-100 rounded-card p-3 sm:p-4 flex items-start gap-2 sm:gap-3 shadow-card"
          >
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-red-800 font-semibold text-[11px] sm:text-base mb-0.5 sm:mb-1">Impulsionamento Suspenso</h4>
              <p className="text-red-700 text-[10px] sm:text-xs">Verifique suas propriedades suspensas abaixo para regularizar.</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!localProperties || localProperties.length === 0 ? (
            <EmptyState message="Nenhum imóvel cadastrado ainda." icon={TrendingUp} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
              <KanbanColumn
                title="Em Análise & Pendentes"
                count={pending.length + suspended.length}
                color="orange"
                icon={AlertTriangle}
              >
                <AnimatePresence mode="popLayout">
                  {[...pending, ...suspended].map((property) => {
                    if (!property?.id) return null;
                    return (
                      <motion.div
                        key={property.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        {property.aprovement_status === 'pending' ? (
                          <PendingPropertyCard property={property} onDelete={() => handleOptimisticDelete(property.id)} />
                        ) : (
                          <RejectedPropertyCard property={property} onDelete={() => handleOptimisticDelete(property.id)} />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {pending.length === 0 && suspended.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 text-sm">Tudo em dia aqui</p>
                  </div>
                )}
              </KanbanColumn>

              <KanbanColumn
                title="Publicados"
                count={approved.length}
                color="purple"
                icon={CheckCircle2}
              >
                <AnimatePresence mode="popLayout">
                  {approved.map((property) => {
                    if (!property?.id) return null;
                    return (
                      <motion.div
                        key={property.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="relative">
                          <PropertyCard
                            property={property}
                            canBoost={suspended.length <= 1}
                            onDelete={() => handleOptimisticDelete(property.id)}
                          />
                          <div className="absolute top-3 right-3">
                            <PropertyHealthScore propertyId={property.id} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {approved.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 text-sm">Nenhum imóvel publicado</p>
                  </div>
                )}
              </KanbanColumn>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
