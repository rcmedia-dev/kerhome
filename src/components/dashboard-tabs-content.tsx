import React, { useState, useTransition, useCallback, useEffect } from 'react';
import { CheckCircle2, Eye, Heart, TrendingUp, Calendar, DollarSign, AlertTriangle, Download, Trash2, RefreshCw, ShieldAlert } from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { TFavoritedPropertyResponseSchema } from '@/lib/types/user';
import { PropertyFavoritedCard } from '@/components/property-favorite-card';
import { Fatura, TPropertyResponseSchema } from '@/lib/types/property';
import { TMyPropertiesWithViews } from '@/lib/functions/supabase-actions/get-most-seen-propeties';
import { PendingPropertyCard } from '@/components/pending-property-card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import LoadingState from '@/app/propriedades/components/loading-state';
import { useInvoiceManagement } from '@/hooks/use-invoice-management';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { RejectedPropertyCard } from '@/components/rejected-property-card';

// Create ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          Algo deu errado. Por favor, recarregue a página.
        </div>
      );
    }

    return this.props.children;
  }
}

// Optimize reusable components with memo
const SectionContainer = React.memo(({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    className={cn(
      "bg-white/70 backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 relative overflow-hidden",
      "before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-50/30 before:via-transparent before:to-orange-50/30 before:pointer-events-none",
      className
    )}
  >
    <div className="relative z-10">{children}</div>
  </motion.div>
));

const KanbanColumn = ({
  title,
  count,
  children,
  color = "purple",
  icon: Icon
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  color?: "purple" | "orange" | "green" | "blue" | "red";
  icon?: any;
}) => {
  const colorStyles = {
    purple: "bg-purple-50 border-purple-100 text-purple-900",
    orange: "bg-orange-50 border-orange-100 text-orange-900",
    green: "bg-green-50 border-green-100 text-green-900",
    blue: "bg-blue-50 border-blue-100 text-blue-900",
    red: "bg-red-50 border-red-100 text-red-900",
  };

  const badgeStyles = {
    purple: "text-purple-700",
    orange: "text-orange-700",
    green: "text-green-700",
    blue: "text-blue-700",
    red: "text-red-700",
  }

  return (
    <div className="flex flex-col gap-4 min-w-[300px] flex-1">
      <div className={cn("flex items-center justify-between p-4 rounded-2xl border", colorStyles[color])}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 opacity-70" />}
          <h3 className="font-bold text-sm tracking-wide">{title}</h3>
        </div>
        <span className={cn("px-2.5 py-1 rounded-full bg-white text-xs font-bold shadow-sm", badgeStyles[color])}>
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
};

// Header das seções com ícone
const SectionHeader = ({
  title,
  icon: Icon,
  description,
  className,
  children
}: {
  title: string;
  icon: any;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={cn("mb-6", className)}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-100 to-orange-100 rounded-xl">
          <Icon className="w-5 h-5 text-purple-700" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
          {title}
        </h2>
      </div>
      {children}
    </div>
    {description && (
      <p className="text-gray-600 text-sm ml-11">{description}</p>
    )}
  </div>
);

// Empty state component
const EmptyState = ({
  message,
  icon: Icon,
  className
}: {
  message: string;
  icon?: any;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
    className={cn(
      "text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80 border border-gray-100 shadow-sm",
      "flex flex-col items-center justify-center gap-4",
      className
    )}
  >
    {Icon && (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-orange-200 rounded-full blur-xl opacity-30 transform scale-150" />
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative z-10 border border-white">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    )}
    <p className="text-gray-500 text-lg font-medium max-w-sm mx-auto">{message}</p>
  </motion.div>
);

// Grid animado para os cards
const AnimatedGrid = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    layout
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    {children}
  </motion.div>
);

type MinePropertiesProps = {
  userProperties: TPropertyResponseSchema[];
}

export function MinhasPropriedades({ userProperties }: MinePropertiesProps) {
  const [localProperties, setLocalProperties] = useState(userProperties);
  const [isRefreshing, startTransition] = useTransition();
  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalProperties(userProperties);
  }, [userProperties]);

  const handleOptimisticDelete = useCallback((id: string) => {
    setLocalProperties(prev => prev.filter(p => p.id !== id));
  }, []);

  const pendingProperties = localProperties.filter(p => p.aprovement_status === 'pending');
  const approvedProperties = localProperties.filter(p => p.aprovement_status === 'aprovado');

  // Verificar propriedades com boost suspenso
  const suspendedProperties = localProperties.filter(
    (p: any) => p.rejected_reason === 'suspicious' || p.is_boost_suspended
  );
  const hasSuspendedProperties = suspendedProperties.length > 0;
  const hasMultipleSuspended = suspendedProperties.length > 1;

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

  if (!userProperties) {
    return <LoadingState.LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <SectionContainer className="bg-transparent border-none p-0 shadow-none">
        <SectionHeader
          title="Minhas Propriedades"
          icon={TrendingUp}
          description="Gerencie seus imóveis por status."
          className="mb-8 px-2"
        >
          {/* Botão de refresh como children */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </SectionHeader>

        {/* Alerta de propriedades suspensas permanece igual */}
        {hasSuspendedProperties && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-semibold mb-1">Impulsionamento Suspenso</h4>
              <p className="text-red-700 text-sm">Verifique suas propriedades suspensas abaixo.</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {localProperties.length === 0 ? (
            <EmptyState
              message="Nenhum imóvel cadastrado ainda."
              icon={TrendingUp}
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">

              {/* Coluna Em Análise / Pendente / Rejeitado */}
              <KanbanColumn
                title="Em Análise & Pendentes"
                count={pendingProperties.length + suspendedProperties.length}
                color="orange"
                icon={AlertTriangle}
              >
                <AnimatePresence>
                  {[...pendingProperties, ...suspendedProperties].map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      {property.aprovement_status === 'pending' ? (
                        <PendingPropertyCard property={property} onDelete={() => handleOptimisticDelete(property.id)} />
                      ) : (
                        <RejectedPropertyCard property={property} onDelete={() => handleOptimisticDelete(property.id)} />
                      )}
                    </motion.div>
                  ))}
                  {pendingProperties.length === 0 && suspendedProperties.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-400 text-sm font-medium">Nenhum imóvel pendente</p>
                    </div>
                  )}
                </AnimatePresence>
              </KanbanColumn>

              {/* Coluna Publicados */}
              <KanbanColumn
                title="Publicados"
                count={approvedProperties.length}
                color="purple"
                icon={CheckCircle2}
              >
                <AnimatePresence>
                  {approvedProperties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <PropertyCard
                        property={property}
                        canBoost={!hasMultipleSuspended}
                        onDelete={() => handleOptimisticDelete(property.id)}
                      />
                    </motion.div>
                  ))}
                  {approvedProperties.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-400 text-sm font-medium">Nenhum imóvel publicado</p>
                    </div>
                  )}
                </AnimatePresence>
              </KanbanColumn>

            </div>
          )}
        </AnimatePresence>
      </SectionContainer>
    </ErrorBoundary>
  );
}

type FavoritasProps = {
  userFavoriteProperties: TFavoritedPropertyResponseSchema[]
}

export function Favoritas({ userFavoriteProperties }: FavoritasProps) {
  const hasFavorites = userFavoriteProperties && userFavoriteProperties.length > 0;

  return (
    <SectionContainer>
      <SectionHeader
        title="Imóveis Guardados"
        icon={Heart}
        description={`${userFavoriteProperties?.length || 0} propriedades salvas`}
      />

      <AnimatePresence mode="wait">
        {!hasFavorites ? (
          <EmptyState
            message="Nenhum imóvel guardado ainda."
            icon={Heart}
          />
        ) : (
          <AnimatedGrid>
            <AnimatePresence>
              {userFavoriteProperties!.map((property, index) => (
                <motion.div
                  key={property.propertyid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  layout
                >
                  <PropertyFavoritedCard
                    property={{
                      ...property,
                      price: property.price !== null && property.price !== undefined
                        ? String(property.price)
                        : null,
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

type FaturasProps = {
  invoices: Fatura[]
}

export function Faturas({ invoices }: FaturasProps) {
  const {
    isDeleting,
    isDeletingAll,
    localInvoices,
    handleDeleteFatura,
    handleDeleteAllFaturas
  } = useInvoiceManagement(invoices);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [faturaToDelete, setFaturaToDelete] = useState<string | null>(null);

  // Memoize calculations
  const totalValue = React.useMemo(() =>
    localInvoices?.reduce((sum, fatura) => sum + fatura.valor, 0) || 0
    , [localInvoices]);

  const handleDeleteClick = (faturaId: string) => {
    setFaturaToDelete(faturaId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (faturaToDelete) {
      await handleDeleteFatura(faturaToDelete);
      setShowDeleteConfirm(false);
      setFaturaToDelete(null);
    }
  };

  function toPascalCase(text: string) {
    return text
      .toLowerCase()
      .split(/[\s_-]+/)
      .map(word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
      )
      .join(" ");
  }

  // Função para baixar/exportar faturas
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
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `faturas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Faturas exportadas com sucesso');
    } catch (error) {
      console.error('Erro ao exportar faturas:', error);
      toast.error('Erro ao exportar faturas');
    }
  }, [localInvoices]);

  const hasInvoices = localInvoices && localInvoices.length > 0;

  // Invoices categorization
  const paidInvoices = localInvoices?.filter(i => i.status === 'paid' || i.status === 'pago') || [];
  const pendingInvoices = localInvoices?.filter(i => i.status !== 'paid' && i.status !== 'pago') || [];

  return (
    <ErrorBoundary>
      <SectionContainer className="bg-transparent border-none p-0 shadow-none">
        <SectionHeader
          title="Minhas Faturas"
          icon={DollarSign}
          description="Controle seus pagamentos e faturas."
          className="mb-8 px-2"
        >
          {/* Botões de ação */}
          {hasInvoices && (
            <div className="flex gap-2">
              <button
                onClick={handleExportFaturas}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-green-200 text-green-700 rounded-md hover:bg-green-50 transition-colors shadow-sm font-medium"
                title="Exportar faturas"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>

              <button
                onClick={handleDeleteAllFaturas}
                disabled={isDeletingAll}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
                title="Eliminar todas as faturas"
              >
                {isDeletingAll ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                Eliminar Todas
              </button>
            </div>
          )}
        </SectionHeader>

        <AnimatePresence mode="wait">
          {!hasInvoices ? (
            <EmptyState
              message="Nenhuma fatura encontrada."
              icon={DollarSign}
            />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Coluna Pendentes */}
              <KanbanColumn
                title="Pendentes"
                count={pendingInvoices.length}
                color="orange"
                icon={AlertTriangle}
              >
                {pendingInvoices.map((fatura, index) => (
                  <motion.div
                    key={fatura.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800 capitalize">{toPascalCase(fatura.servico)}</span>
                      <span className="font-bold text-orange-600">{fatura.valor.toLocaleString('pt-AO')} Kz</span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                      </div>
                      <button
                        onClick={() => handleDeleteClick(fatura.id)}
                        disabled={isDeleting === fatura.id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar"
                      >
                        {isDeleting === fatura.id ? (
                          <LoadingSpinner className="w-3.5 h-3.5 border-red-500" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
                {pendingInvoices.length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400 text-sm font-medium">Nenhuma fatura pendente</p>
                  </div>
                )}
              </KanbanColumn>

              {/* Coluna Pagas */}
              <KanbanColumn
                title="Pagas"
                count={paidInvoices.length}
                color="green"
                icon={CheckCircle2}
              >
                {paidInvoices.map((fatura, index) => (
                  <motion.div
                    key={fatura.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-50 to-transparent -mr-8 -mt-8 rounded-full opacity-50 pointer-events-none" />

                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="font-semibold text-gray-800 capitalize">{toPascalCase(fatura.servico)}</span>
                      <span className="font-bold text-green-700">{fatura.valor.toLocaleString('pt-AO')} Kz</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 relative z-10">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> PAGO
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {new Date(fatura.created_at).toLocaleDateString('pt-AO')}
                        </span>
                        <button
                          onClick={() => handleDeleteClick(fatura.id)}
                          disabled={isDeleting === fatura.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {paidInvoices.length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400 text-sm font-medium">Nenhuma fatura paga</p>
                  </div>
                )}
              </KanbanColumn>

            </div>
          )}
        </AnimatePresence>

        {/* Add confirmation dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja eliminar esta fatura? Esta ação não pode ser desfeita.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <button className="px-4 py-2 text-sm text-gray-600">
                  Cancelar
                </button>
              </DialogClose>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md"
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

type MostViewedProps = {
  mostViewedProperties: TMyPropertiesWithViews;
};

export function PropriedadesMaisVisualizadas({
  mostViewedProperties,
}: MostViewedProps) {
  return (
    <SectionContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <SectionHeader
          title="Propriedades Mais Visualizadas"
          icon={Eye}
          className="mb-0"
        />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div className="text-right">
            <p className="text-sm text-gray-600">Total de visualizações</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
              {mostViewedProperties.total_views_all}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {mostViewedProperties.properties.length === 0 ? (
          <EmptyState
            message="Nenhuma propriedade visualizada ainda."
            icon={Eye}
          />
        ) : (
          <AnimatedGrid>
            <AnimatePresence>
              {mostViewedProperties.properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative group"
                  layout
                >
                  <PropertyCard property={property} />

                  {/* Badge de visualizações */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 backdrop-blur-sm"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{property.total_views}</span>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </AnimatedGrid>
        )}
      </AnimatePresence>
    </SectionContainer>
  );
}

// Wrap the exported components with ErrorBoundary
export const DashboardTabs = {
  MinhasPropriedades: React.memo(MinhasPropriedades),
  Favoritas: React.memo(Favoritas),
  Faturas: React.memo(Faturas),
  PropriedadesMaisVisualizadas: React.memo(PropriedadesMaisVisualizadas)
};