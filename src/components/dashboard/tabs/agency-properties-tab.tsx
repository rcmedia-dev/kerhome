import React, { useState, useTransition, useCallback, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Building2, RefreshCw } from 'lucide-react';
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

  return (
    <div className="space-y-8 mt-8 border-t border-gray-100 pt-8">
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
  );
}
