import React, { useState, useTransition, useCallback, useEffect, useMemo } from 'react';
import { CheckCircle2, Heart, TrendingUp, Calendar, DollarSign, AlertTriangle, Download, Trash2, RefreshCw, ShieldAlert, Eye, Building2, Clock, MapPin, CheckCircle, XCircle, User } from 'lucide-react';
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

// import { TFavoritedPropertyResponseSchema } from '@/lib/types/user'; // Removed unused import
import { Fatura, TPropertyResponseSchema } from '@/lib/types/property';
import { TMyPropertiesWithViews } from '@/lib/functions/supabase-actions/property-views-actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
                        <PropertyCard
                          property={property}
                          canBoost={suspended.length <= 1}
                          onDelete={() => handleOptimisticDelete(property.id)}
                        />
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
      </SectionContainer>
    </ErrorBoundary>
  );
}

// =======================
// Favoritas
// =======================
type FavoritasProps = {
  userFavoriteProperties: TPropertyResponseSchema[] | null
}

export function Favoritas({ userFavoriteProperties }: FavoritasProps) {
  if (!userFavoriteProperties) return <LoadingState.LoadingSpinner />;
  const hasFavorites = userFavoriteProperties && userFavoriteProperties.length > 0;

  return (
    <SectionContainer className="bg-transparent border-none p-0 shadow-none">
      <SectionHeader
        title="Imóveis Guardados"
        icon={Heart}
        description={`${userFavoriteProperties?.length || 0} propriedades salvas na sua lista`}
        className="mb-8 px-2"
      />

      <AnimatePresence mode="wait">
        {!hasFavorites ? (
          <EmptyState message="Nenhum imóvel guardado ainda." icon={Heart} />
        ) : (
          <AnimatedGrid>
            <AnimatePresence mode="popLayout">
              {userFavoriteProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PropertyFavoritedCard
                    property={{
                      ...property,
                      propertyid: property.propertyid || property.id,
                      price: property.price != null ? String(property.price) : null,
                      bedrooms: property.bedrooms ?? 0,
                      bathrooms: property.bathrooms ?? 0,
                      garagens: property.garagens ?? 0,
                      size: property.size ?? '',
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
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
              <KanbanColumn title="Pendentes" count={pending.length} color="orange" icon={AlertTriangle}>
                <AnimatePresence mode="popLayout">
                  {pending.map((fatura) => (
                    <motion.div
                      key={fatura.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-black text-[13px] text-gray-800 uppercase tracking-tight">{toPascalCase(fatura.servico)}</span>
                        <span className="font-black text-lg text-orange-600">{fatura.valor.toLocaleString('pt-AO')} Kz</span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                          <Calendar className="w-4 h-4" />
                          {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                        </div>
                        <button
                          onClick={() => handleDeleteClick(fatura.id)}
                          disabled={isDeleting === fatura.id}
                          className="p-2.5 text-red-500 bg-red-50/50 hover:bg-red-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          {isDeleting === fatura.id ? <LoadingSpinner className="w-4 h-4 border-red-500" /> : <Trash2 className="w-4 h-4" />}
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
                      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="font-black text-[13px] text-gray-800 uppercase tracking-tight">{toPascalCase(fatura.servico)}</span>
                        <span className="font-black text-lg text-green-700">{fatura.valor.toLocaleString('pt-AO')} Kz</span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Liquidado
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                          <Calendar className="w-4 h-4" />
                          {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {paid.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                    <p className="text-gray-400 text-sm">Sem faturas pagas</p>
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
        className="mb-8 px-2"
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
// Visitas Agendadas
// =======================
type VisitasProps = {
  userId: string;
}

export function VisitasAgendadas({ userId }: VisitasProps) {
  const [visits, setVisits] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [subTab, setSubTab] = useState<'pending' | 'confirmed' | 'history'>('pending');

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/visits?agent_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits || []);
      }
    } catch (e) {
      toast.error('Erro ao carregar visitas');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setVisits(prev => prev ? prev.map(v => v.id === id ? { ...v, status } : v) : null);
        toast.success('Status atualizado');
      }
    } catch (e) {
      toast.error('Erro ao atualizar');
    }
  };

  if (isLoading) return <LoadingState.LoadingSpinner />;

  const pending = visits?.filter(v => v.status === 'pending') || [];
  const confirmed = visits?.filter(v => v.status === 'confirmed') || [];
  const history = visits?.filter(v => v.status === 'done' || v.status === 'cancelled') || [];

  const currentList = subTab === 'pending' ? pending : subTab === 'confirmed' ? confirmed : history;

  return (
    <SectionContainer className="bg-transparent border-none p-0 shadow-none">
      <SectionHeader
        title="Visitas Agendadas"
        icon={Calendar}
        description="Gerencie seus compromissos com potenciais clientes."
        className="mb-8 px-2"
      >
        <button
          onClick={fetchVisits}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </SectionHeader>

      {!visits || visits.length === 0 ? (
        <EmptyState message="Nenhuma visita agendada ainda." icon={Calendar} />
      ) : (
        <div className="space-y-8">
          {/* Sub-tabs Navigation */}
          <div className="flex p-1 bg-gray-100 rounded-2xl w-fit mx-auto lg:mx-0">
            {[
              { id: 'pending', label: 'Pendentes', count: pending.length, color: 'text-orange-600' },
              { id: 'confirmed', label: 'Confirmadas', count: confirmed.length, color: 'text-purple-600' },
              { id: 'history', label: 'Histórico', count: history.length, color: 'text-gray-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  subTab === tab.id 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {tab.label}
                <span className={cn("px-2 py-0.5 rounded-full bg-gray-50 text-[10px]", subTab === tab.id ? tab.color : "text-gray-300")}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* List Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={subTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 min-w-0"
            >
              {currentList.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Nada para mostrar aqui</p>
                </div>
              ) : (
                currentList.map((visit) => (
                  <VisitListItem key={visit.id} visit={visit} onUpdate={handleUpdateStatus} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </SectionContainer>
  );
}

function VisitListItem({ visit, onUpdate }: { visit: any, onUpdate: (id: string, status: string) => void }) {
  const statusMap: any = {
    pending: { label: 'Pendente', cls: 'bg-orange-50 text-orange-700 border-orange-100', icon: Clock },
    confirmed: { label: 'Confirmada', cls: 'bg-purple-50 text-purple-700 border-purple-100', icon: CheckCircle },
    cancelled: { label: 'Cancelada', cls: 'bg-red-50 text-red-700 border-red-100', icon: XCircle },
    done: { label: 'Realizada', cls: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle2 },
  };

  const s = statusMap[visit.status] || statusMap.pending;
  const StatusIcon = s.icon;

  // Formatting date
  const dateObj = visit.scheduled_date ? new Date(visit.scheduled_date + 'T12:00:00') : new Date();
  const formattedDate = format(dateObj, "dd 'de' MMMM", { locale: ptBR });
  const dayName = format(dateObj, "EEEE", { locale: ptBR });
  const timeShort = visit.scheduled_time?.substring(0, 5) || '--:--';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-6 md:p-8 lg:p-10 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-purple-200 transition-all group space-y-7 relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className={cn("absolute -right-6 -top-6 w-32 h-32 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110", s.cls.split(' ')[0])}>
        <StatusIcon className="w-full h-full" />
      </div>

      <div className="flex justify-between items-start relative z-10">
        <div className={cn("flex items-center gap-2.5 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest", s.cls)}>
          <StatusIcon className="w-4 h-4" />
          {s.label}
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Horário</p>
          <div className="flex items-center gap-1.5 justify-end text-purple-600">
            <Clock className="w-4 h-4" />
            <p className="text-lg font-black">{timeShort}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2.5 text-orange-500">
          <Calendar className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-widest">{dayName}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
          {formattedDate}
        </h3>
      </div>

      <div className="p-6 bg-gray-50/50 rounded-[32px] border border-gray-100 space-y-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Imóvel da Visita</p>
            <p className="text-[13px] font-black text-gray-800 line-clamp-2 leading-snug">{visit.property_title || 'Não especificado'}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Lead / Cliente</p>
            <p className="text-[13px] font-black text-gray-800 line-clamp-1 leading-snug">{visit.lead_name || 'Anónimo'}</p>
          </div>
        </div>
      </div>

      {visit.notes && (
        <div className="px-6 py-4 bg-purple-50/40 rounded-[24px] border border-purple-100/40 relative z-10">
          <p className="text-xs text-purple-700/80 font-semibold italic leading-relaxed">
            "{visit.notes}"
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
        {visit.status === 'pending' && (
          <>
            <button
              onClick={() => onUpdate(visit.id, 'confirmed')}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl shadow-purple-200 cursor-pointer flex items-center justify-center gap-2"
            >
              Confirmar
            </button>
            <button
              onClick={() => onUpdate(visit.id, 'cancelled')}
              className="px-5 py-4 bg-gray-50 text-gray-400 rounded-[20px] hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 cursor-pointer flex items-center justify-center"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </>
        )}
        {visit.status === 'confirmed' && (
          <button
            onClick={() => onUpdate(visit.id, 'done')}
            className="w-full py-4 md:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-[20px] text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Finalizar Visita
          </button>
        )}
        {(visit.status === 'done' || visit.status === 'cancelled') && (
           <div className="w-full py-4 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-[20px]">
             Concluído
           </div>
        )}
      </div>
    </motion.div>
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
  AgencyProperties: React.memo(AgencyProperties),
  VisitasAgendadas: React.memo(VisitasAgendadas)
};
