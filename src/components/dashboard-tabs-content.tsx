import React, { useState } from 'react';
import { CheckCircle2, Eye, Heart, TrendingUp, Calendar, DollarSign, AlertTriangle, Download, Trash2 } from 'lucide-react';
import { PropertyCard } from './property-card';
import { TFavoritedPropertyResponseSchema } from '@/lib/types/user';
import { PropertyFavoritedCard } from './property-favorite-card';
import { Fatura, TPropertyResponseSchema } from '@/lib/types/property';
import { TMyPropertiesWithViews } from '@/lib/actions/supabase-actions/get-most-seen-propeties';
import { PendingPropertyCard } from './pending-property-card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Container animado para as seções
const SectionContainer = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className={cn(
      "bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6",
      className
    )}
  >
    {children}
  </motion.div>
);

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
    className={cn(
      "text-center py-12 px-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200",
      className
    )}
  >
    {Icon && (
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    )}
    <p className="text-gray-500 text-lg font-medium">{message}</p>
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
  userProperties: TPropertyResponseSchema[]
}

export function MinhasPropriedades({ userProperties }: MinePropertiesProps) {
  const pendingProperties = userProperties.filter(p => p.aprovement_status === 'pending');
  const approvedProperties = userProperties.filter(p => p.aprovement_status === 'approved');

  return (
    <SectionContainer>
      <SectionHeader 
        title="Minhas Propriedades" 
        icon={TrendingUp}
        description={`${approvedProperties.length} aprovadas • ${pendingProperties.length} pendentes`}
      />

      <AnimatePresence mode="wait">
        {userProperties.length === 0 ? (
          <EmptyState 
            message="Nenhum imóvel cadastrado ainda."
            icon={TrendingUp}
          />
        ) : (
          <AnimatedGrid>
            <AnimatePresence>
              {userProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  layout
                >
                  {property.aprovement_status === 'pending' ? (
                    <PendingPropertyCard property={property} />
                  ) : (
                    <PropertyCard property={property} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </AnimatedGrid>
        )}
      </AnimatePresence>
    </SectionContainer>
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
  const { user } = useUserStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [localInvoices, setLocalInvoices] = useState<Fatura[] | null>(invoices);

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

  // Função para eliminar uma fatura específica
  const handleDeleteFatura = async (faturaId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsDeleting(faturaId);

    try {
      
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('id', faturaId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualiza o estado local
      setLocalInvoices(prev => prev?.filter(fatura => fatura.id !== faturaId) || null);
      
      toast.success('Fatura eliminada com sucesso');
    } catch (error) {
      console.error('Erro ao eliminar fatura:', error);
      toast.error('Erro ao eliminar fatura');
    } finally {
      setIsDeleting(null);
    }
  };

  // Função para eliminar todas as faturas
  const handleDeleteAllFaturas = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!localInvoices || localInvoices.length === 0) {
      toast.info('Não há faturas para eliminar');
      return;
    }

    // Confirmação antes de eliminar tudo
    const confirmDelete = window.confirm(
      `Tem certeza que deseja eliminar todas as ${localInvoices.length} faturas? Esta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    setIsDeletingAll(true);

    try {
      
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Limpa todas as faturas localmente
      setLocalInvoices([]);
      
      toast.success(`Todas as ${localInvoices.length} faturas foram eliminadas`);
    } catch (error) {
      console.error('Erro ao eliminar todas as faturas:', error);
      toast.error('Erro ao eliminar faturas');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Função para baixar/exportar faturas
  const handleExportFaturas = () => {
    if (!localInvoices || localInvoices.length === 0) {
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
  };

  const hasInvoices = localInvoices && localInvoices.length > 0;

  return (
    <SectionContainer>
      <SectionHeader 
        title="Minhas Faturas" 
        icon={DollarSign}
        description={`${localInvoices?.length || 0} transações realizadas`}
      >
        {/* Botões de ação */}
        {hasInvoices && (
          <div className="flex gap-2">
            <button
              onClick={handleExportFaturas}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Exportar faturas"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
            <button
              onClick={handleDeleteAllFaturas}
              disabled={isDeletingAll}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Eliminar todas as faturas"
            >
              {isDeletingAll ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-orange-50 border-b border-gray-200">
                    <th className="p-4 text-left font-semibold text-gray-700">Serviço</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Valor</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Data</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {localInvoices!.map((fatura, index) => (
                      <motion.tr
                        key={fatura.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-4 font-medium text-gray-800 capitalize">
                          {toPascalCase(fatura.servico)}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-green-700">
                            {fatura.valor.toLocaleString("pt-AO")} Kz
                          </span>
                        </td>
                        <td className="p-4">
                          <motion.span 
                            className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Pago
                          </motion.span>
                        </td>
                        <td className="p-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(fatura.created_at).toLocaleDateString("pt-AO")}
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleDeleteFatura(fatura.id)}
                            disabled={isDeleting === fatura.id}
                            className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar fatura"
                          >
                            {isDeleting === fatura.id ? (
                              <div className="w-3 h-3 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Eliminar
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Footer com estatísticas */}
            {hasInvoices && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Total de faturas: {localInvoices.length}</span>
                  <span className="font-semibold text-green-700">
                    Valor total: {localInvoices.reduce((sum, fatura) => sum + fatura.valor, 0).toLocaleString('pt-AO')} Kz
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SectionContainer>
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