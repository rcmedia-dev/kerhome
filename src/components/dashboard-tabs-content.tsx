import React, { useState, useTransition, useCallback, useEffect, useMemo } from 'react';
import { CheckCircle2, Heart, TrendingUp, Calendar, DollarSign, AlertTriangle, Download, Trash2, RefreshCw, ShieldAlert, Eye, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PropertyCard } from '@/components/property-card';
import { PropertyFavoritedCard } from '@/components/property-favorite-card';
import { PendingPropertyCard } from '@/components/pending-property-card';
import { RejectedPropertyCard } from '@/components/rejected-property-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import LoadingState from '@/app/propriedades/components/loading-state';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

import { TFavoritedPropertyResponseSchema } from '@/lib/types/user';
import { Fatura, TPropertyResponseSchema } from '@/lib/types/property';
import { TMyPropertiesWithViews } from '@/lib/functions/supabase-actions/get-most-seen-propeties';
import { useInvoiceManagement } from '@/hooks/use-invoice-management';
import { toPascalCase } from '@/lib/string-utils';
import { cn } from '@/lib/utils';

import {
  SectionContainer,
  SectionHeader,
  KanbanColumn,
  EmptyState,
  AnimatedGrid,
  ErrorBoundary
} from './dashboard/shared-ui';

// =======================
// Minhas Propriedades
// =======================
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
    // Filtrar para mostrar apenas propriedades PESSOAIS (sem imobiliaria_id)
    const list = (localProperties || []).filter(p => !p.imobiliaria_id);
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

  if (!userProperties) return <LoadingState.LoadingSpinner />;

  return (
    <ErrorBoundary>
      <SectionContainer className="bg-transparent border-none p-0 shadow-none">
        <SectionHeader
          title="Minhas Propriedades"
          icon={TrendingUp}
          description="Gerencie seus imóveis por status."
          className="mb-8 px-2"
        >
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm text-sm font-medium"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </SectionHeader>

        {hasSuspended && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm"
          >
            <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-semibold mb-1">Impulsionamento Suspenso</h4>
              <p className="text-red-700 text-xs">Verifique suas propriedades suspensas abaixo para regularizar.</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!localProperties || localProperties.length === 0 ? (
            <EmptyState message="Nenhum imóvel cadastrado ainda." icon={TrendingUp} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4 custom-scrollbar">
              <KanbanColumn
                title="Em Análise & Pendentes"
                count={pending.length + suspended.length}
                color="orange"
                icon={AlertTriangle}
              >
                <AnimatePresence mode="popLayout">
                  {[...pending, ...suspended].map((property) => (
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
                  ))}
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
                  {approved.map((property) => (
                    <motion.div
                      key={property.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <PropertyCard
                        property={property}
                        canBoost={suspended.length <= 1}
                        onDelete={() => handleOptimisticDelete(property.id)}
                      />
                    </motion.div>
                  ))}
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
      </SectionContainer>
    </ErrorBoundary>
  );
}

// =======================
// Favoritas
// =======================
type FavoritasProps = {
  userFavoriteProperties: TFavoritedPropertyResponseSchema[] | null
}

export function Favoritas({ userFavoriteProperties }: FavoritasProps) {
  if (!userFavoriteProperties) return <LoadingState.LoadingSpinner />;
  const hasFavorites = userFavoriteProperties && userFavoriteProperties.length > 0;

  return (
    <SectionContainer>
      <SectionHeader
        title="Imóveis Guardados"
        icon={Heart}
        description={`${userFavoriteProperties?.length || 0} propriedades salvas na sua lista`}
      />

      <AnimatePresence mode="wait">
        {!hasFavorites ? (
          <EmptyState message="Nenhum imóvel guardado ainda." icon={Heart} />
        ) : (
          <AnimatedGrid>
            <AnimatePresence mode="popLayout">
              {userFavoriteProperties.map((property, index) => (
                <motion.div
                  key={property.propertyid}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PropertyFavoritedCard
                    property={{
                      ...property,
                      price: property.price != null ? String(property.price) : null,
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </AnimatedGrid>
        )}
      </AnimatePresence>
    </SectionContainer>
  );
}

// =======================
// Faturas
// =======================
type FaturasProps = {
  invoices: Fatura[] | null
}

export function Faturas({ invoices }: FaturasProps) {
  if (!invoices) return <LoadingState.LoadingSpinner />;
  const {
    isDeleting,
    isDeletingAll,
    localInvoices,
    handleDeleteFatura,
    handleDeleteAllFaturas
  } = useInvoiceManagement(invoices);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [faturaToDelete, setFaturaToDelete] = useState<string | null>(null);

  const { paid, pending, hasInvoices } = useMemo(() => {
    const list = localInvoices || [];
    return {
      paid: list.filter(i => i.status?.toLowerCase() === 'paid' || i.status?.toLowerCase() === 'pago'),
      pending: list.filter(i => i.status?.toLowerCase() !== 'paid' && i.status?.toLowerCase() !== 'pago'),
      hasInvoices: list.length > 0
    };
  }, [localInvoices]);

  const handleDeleteClick = (faturaId: string) => {
    setFaturaToDelete(faturaId);
    setShowDeleteConfirm(true);
  };

  const handleExportFaturas = useCallback(() => {
    if (!localInvoices?.length) {
      toast.info('Não há faturas para exportar');
      return;
    }

    try {
      const csvContent = [
        ['Serviço', 'Valor (Kz)', 'Status', 'Data'],
        ...localInvoices.map(fatura => [
          toPascalCase(fatura.servico),
          fatura.valor.toLocaleString('pt-AO'),
          fatura.status,
          new Date(fatura.created_at).toLocaleDateString('pt-AO')
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `faturas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Faturas exportadas com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar faturas');
    }
  }, [localInvoices]);

  return (
    <ErrorBoundary>
      <SectionContainer className="bg-transparent border-none p-0 shadow-none">
        <SectionHeader
          title="Minhas Faturas"
          icon={DollarSign}
          description="Controle seus pagamentos e faturas de serviços."
          className="mb-8 px-2"
        >
          {hasInvoices && (
            <div className="flex gap-2">
              <button
                onClick={handleExportFaturas}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>

              <button
                onClick={handleDeleteAllFaturas}
                disabled={isDeletingAll}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 shadow-sm font-medium"
              >
                {isDeletingAll ? <LoadingSpinner className="w-4 h-4 border-red-600" /> : <AlertTriangle className="w-4 h-4" />}
                Limpar Tudo
              </button>
            </div>
          )}
        </SectionHeader>

        <AnimatePresence mode="wait">
          {!hasInvoices ? (
            <EmptyState message="Nenhuma fatura encontrada." icon={DollarSign} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4 custom-scrollbar">
              <KanbanColumn title="Pendentes" count={pending.length} color="orange" icon={AlertTriangle}>
                <AnimatePresence mode="popLayout">
                  {pending.map((fatura) => (
                    <motion.div
                      key={fatura.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">{toPascalCase(fatura.servico)}</span>
                        <span className="font-bold text-orange-600">{fatura.valor.toLocaleString('pt-AO')} Kwanzas</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                        </div>
                        <button
                          onClick={() => handleDeleteClick(fatura.id)}
                          disabled={isDeleting === fatura.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {isDeleting === fatura.id ? <LoadingSpinner className="w-3.5 h-3.5 border-red-500" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {pending.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 text-sm">Sem faturas pendentes</p>
                  </div>
                )}
              </KanbanColumn>

              <KanbanColumn title="Pagas" count={paid.length} color="green" icon={CheckCircle2}>
                <AnimatePresence mode="popLayout">
                  {paid.map((fatura) => (
                    <motion.div
                      key={fatura.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">{toPascalCase(fatura.servico)}</span>
                        <span className="font-bold text-green-700">{fatura.valor.toLocaleString('pt-AO')} Kwanzas</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> PAGO
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{new Date(fatura.created_at).toLocaleDateString('pt-AO')}</span>
                          <button
                            onClick={() => handleDeleteClick(fatura.id)}
                            disabled={isDeleting === fatura.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {paid.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 text-sm">Nenhuma fatura paga registrada</p>
                  </div>
                )}
              </KanbanColumn>
            </div>
          )}
        </AnimatePresence>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="rounded-3xl">
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja eliminar esta fatura? Esta ação não pode ser desfeita.
            </DialogDescription>
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-all font-medium">
                  Cancelar
                </button>
              </DialogClose>
              <button
                onClick={() => {
                  if (faturaToDelete) {
                    handleDeleteFatura(faturaToDelete);
                    setShowDeleteConfirm(false);
                    setFaturaToDelete(null);
                  }
                }}
                className="px-6 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-600/20"
              >
                Eliminar
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </SectionContainer>
    </ErrorBoundary>
  );
}

// =======================
// Mais Visualizadas
// =======================
type MostViewedProps = {
  mostViewedProperties: TMyPropertiesWithViews | null;
};

export function PropriedadesMaisVisualizadas({ mostViewedProperties }: MostViewedProps) {
  if (!mostViewedProperties) return <LoadingState.LoadingSpinner />;
  const hasProperties = mostViewedProperties?.properties?.length > 0;

  return (
    <SectionContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6 px-2">
        <SectionHeader
          title="Top Visualizações"
          icon={Eye}
          description="Imóveis que mais atraíram o interesse do público"
          className="mb-0"
        />

        <motion.div
          whileHover={{ y: -4 }}
          className="flex items-center gap-4 bg-white p-3 pr-6 rounded-2xl border border-gray-100 shadow-sm"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visualizações Totais</p>
            <p className="text-2xl font-black bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
              {mostViewedProperties.total_views_all.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!hasProperties ? (
          <EmptyState message="Nenhuma propriedade visualizada ainda." icon={Eye} />
        ) : (
          <AnimatedGrid>
            <AnimatePresence mode="popLayout">
              {mostViewedProperties.properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <PropertyCard property={property} />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 border border-white/50 ring-1 ring-black/5">
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    <span>{property.total_views}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </AnimatedGrid>
        )}
      </AnimatePresence>
    </SectionContainer>
  );
}

// =======================
// Propriedades da Agência
// =======================
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

  if (!properties) return <LoadingState.LoadingSpinner />;

  return (
    <div className="space-y-8 mt-8 border-t border-gray-100 pt-8">
      <SectionHeader
        title={`Imóveis da ${agencyName}`}
        icon={Building2}
        description="Gestão de inventário da agência."
      >
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Atualizar
        </button>
      </SectionHeader>

      <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4 custom-scrollbar">
        <KanbanColumn title="Em Análise" count={pending.length} color="orange" icon={AlertTriangle}>
          <AnimatePresence mode="popLayout">
            {pending.map(p => (
              <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PendingPropertyCard property={p} onDelete={() => handleOptimisticDelete(p.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {pending.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-3xl">
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
            <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-gray-400 text-xs">Nenhum imóvel</p>
            </div>
          )}
        </KanbanColumn>
      </div>
    </div>
  );
}

// =======================
// Export
// =======================
export const DashboardTabs = {
  MinhasPropriedades: React.memo(MinhasPropriedades),
  Favoritas: React.memo(Favoritas),
  Faturas: React.memo(Faturas),
  PropriedadesMaisVisualizadas: React.memo(PropriedadesMaisVisualizadas),
  AgencyProperties: React.memo(AgencyProperties)
};
