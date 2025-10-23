'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Eye, 
  Clock, 
  DollarSign, 
  BarChart3, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Target,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';
import { BoostedProperty, getBoostedProperties, getPerformanceMetrics, PerformanceMetrics } from '@/lib/actions/supabase-actions/boost-functions';



// Reutilizando os componentes do seu código
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

const SectionHeader = ({ 
  title, 
  icon: Icon, 
  description,
  className 
}: { 
  title: string; 
  icon: any;
  description?: string;
  className?: string;
}) => (
  <div className={cn("mb-6", className)}>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-gradient-to-r from-purple-100 to-orange-100 rounded-xl">
        <Icon className="w-5 h-5 text-purple-700" />
      </div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
    {description && (
      <p className="text-gray-600 text-sm ml-11">{description}</p>
    )}
  </div>
);

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

const AnimatedGrid = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    layout
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    {children}
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

// Card para propriedades impulsionadas (mantido igual)
const BoostedPropertyCard = ({ property }: { property: BoostedProperty }) => {
  const calculateTimeLeft = (expiresAt: string, boostStatus: string) => {
    if (boostStatus !== 'active') {
      return { 
        expired: true, 
        text: boostStatus === 'pending' ? 'Pendente' : 'Rejeitado',
        percentage: 0 
      };
    }

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return { expired: true, text: 'Expirado', percentage: 0 };
    
    // Calcular dias totais do plano para a porcentagem
    const boostStart = new Date(property.boost_started_at);
    const totalDuration = expiry.getTime() - boostStart.getTime();
    const totalDays = Math.floor(totalDuration / (1000 * 60 * 60 * 24));
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const percentage = totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - days) / totalDays) * 100)) : 0;
    
    return { 
      expired: false, 
      text: `${days}d ${hours}h ${minutes}m`,
      days,
      hours,
      minutes,
      percentage
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle2;
      case 'pending':
        return AlertCircle;
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getBoostTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'featured':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
  };

  const timeLeft = calculateTimeLeft(property.boost_expires_at, property.boost_status);
  const StatusIcon = getStatusIcon(property.boost_status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      {/* Header com imagem e badges */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-orange-100">
            <Target className="w-12 h-12 text-purple-400" />
          </div>
        )}
        
        {/* Badge do tipo de boost */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${getBoostTypeColor(property.boost_type)}`}>
          {property.boost_type.toUpperCase()}
        </div>

        {/* Badge de status */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(property.boost_status)}`}>
          <StatusIcon size={12} />
          {property.boost_status === 'active' ? 'Ativo' : 
           property.boost_status === 'pending' ? 'Pendente' : 'Rejeitado'}
        </div>

        {/* Barra de progresso para boosts ativos */}
        {property.boost_status === 'active' && !timeLeft.expired && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2">
            <div 
              className={`h-full ${
                timeLeft.percentage > 50 
                  ? 'bg-green-500' 
                  : timeLeft.percentage > 20 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
              } transition-all duration-500`}
              style={{ width: `${timeLeft.percentage}%` }}
            />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12">
          {property.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
          {property.location}
        </p>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span>Iniciado em {new Date(property.boost_started_at).toLocaleDateString('pt-AO')}</span>
        </div>

        {/* Métricas de performance */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Visualizações</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{property.views.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Cliques</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{property.clicks.toLocaleString()}</p>
          </div>
        </div>

        {/* Taxa de conversão */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Taxa de Cliques</span>
            <span className="text-sm font-bold text-purple-600">
              {property.views > 0 ? ((property.clicks / property.views) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${property.views > 0 ? Math.min((property.clicks / property.views) * 100, 100) : 0}%` 
              }}
            />
          </div>
        </div>

        {/* Informações do plano */}
        <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Plano:</span>
            <span className="font-semibold text-gray-900">{property.boost_plan}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Tempo Restante:</span>
            <span className={`font-semibold ${
              timeLeft.expired ? 'text-red-600' : 'text-green-600'
            }`}>
              {timeLeft.text}
            </span>
          </div>
        </div>

        {/* Preço */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg text-sm font-semibold cursor-pointer"
            onClick={() => {
              // Navegar para a página de detalhes da propriedade
              window.open(`/property/${property.property_id}`, '_blank');
            }}
          >
            Ver Detalhes
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal atualizado
export default function PropriedadesImpulsionadasDashboard() {
  const { user } = useUserStore();
  const [boostedProperties, setBoostedProperties] = useState<BoostedProperty[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [properties, metrics] = await Promise.all([
        getBoostedProperties(user.id),
        getPerformanceMetrics(user.id)
      ]);

      
      setBoostedProperties(properties);
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Função auxiliar para calcular tempo - CORRIGIDA
  const calculateTimeLeft = (expiresAt: string, boostStatus: string) => {
    if (boostStatus !== 'active') {
      return { 
        expired: true, 
        text: boostStatus === 'pending' ? 'Pendente' : 'Rejeitado',
        percentage: 0 
      };
    }

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return { expired: true, text: 'Expirado', percentage: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { 
      expired: false, 
      text: `${days}d ${hours}h ${minutes}m`,
      days,
      hours,
      minutes,
      percentage: Math.max(0, Math.min(100, (days / 30) * 100)) // Aproximação
    };
  };

  // CORREÇÃO: Usar 'active' em vez de 'approved'
  const activeProperties = boostedProperties.filter(p => 
    p.boost_status === 'active' && 
    calculateTimeLeft(p.boost_expires_at, p.boost_status).expired === false
  );

  const pendingProperties = boostedProperties.filter(p => p.boost_status === 'pending');
  const expiredProperties = boostedProperties.filter(p => 
    (p.boost_status === 'active' && 
    calculateTimeLeft(p.boost_expires_at, p.boost_status).expired === true) ||
    p.boost_status === 'rejected'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/20 p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent mb-2">
                Dashboard de Impulsionamentos
              </h1>
              <p className="text-gray-600 text-lg">
                Acompanhe o desempenho dos seus imóveis em destaque
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('/pacotes-destaque', '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-orange-600 transition-all"
              >
                <Zap className="w-4 h-4" />
                Novo Impulsionamento
              </motion.button> */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{activeProperties.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingProperties.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expirados/Rejeitados</p>
                <p className="text-2xl font-bold text-gray-900">{expiredProperties.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{boostedProperties.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Métricas Gerais */}
        {performanceMetrics && (
          <SectionContainer>
            <SectionHeader 
              title="Performance Geral" 
              icon={BarChart3}
              description="Visão geral do desempenho dos seus impulsionamentos"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Impressões</p>
                    <p className="text-3xl font-bold mt-2">{performanceMetrics.total_impressions.toLocaleString()}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Cliques</p>
                    <p className="text-3xl font-bold mt-2">{performanceMetrics.total_clicks.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Taxa de Cliques</p>
                    <p className="text-3xl font-bold mt-2">{performanceMetrics.click_through_rate}%</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-200" />
                </div>
              </motion.div>

            </div>
          </SectionContainer>
        )}

        {/* Propriedades Ativas */}
        <SectionContainer>
          <SectionHeader 
            title="Impulsionamentos Ativos" 
            icon={Zap}
            description={`${activeProperties.length} propriedades atualmente em destaque`}
          />

          <AnimatePresence mode="wait">
            {activeProperties.length === 0 ? (
              <EmptyState 
                message="Nenhum impulsionamento ativo no momento."
                icon={Zap}
                className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200"
              />
            ) : (
              <AnimatedGrid>
                {activeProperties.map((property, index) => (
                  <BoostedPropertyCard key={property.id} property={property} />
                ))}
              </AnimatedGrid>
            )}
          </AnimatePresence>
        </SectionContainer>

        {/* Propriedades Pendentes */}
        {pendingProperties.length > 0 && (
          <SectionContainer>
            <SectionHeader 
              title="Solicitações Pendentes" 
              icon={Clock}
              description={`${pendingProperties.length} aguardando aprovação`}
            />

            <AnimatedGrid>
              {pendingProperties.map((property, index) => (
                <BoostedPropertyCard key={property.id} property={property} />
              ))}
            </AnimatedGrid>
          </SectionContainer>
        )}

        {/* Propriedades Expiradas/Rejeitadas */}
        {expiredProperties.length > 0 && (
          <SectionContainer>
            <SectionHeader 
              title="Impulsionamentos Finalizados" 
              icon={Calendar}
              description={`${expiredProperties.length} destaque(s) concluído(s) ou rejeitados`}
            />

            <AnimatedGrid>
              {expiredProperties.map((property, index) => (
                <BoostedPropertyCard key={property.id} property={property} />
              ))}
            </AnimatedGrid>
          </SectionContainer>
        )}

        {/* Todas as Propriedades - Apenas se houver dados */}
        {boostedProperties.length > 0 && (
          <SectionContainer>
            <SectionHeader 
              title="Todos os Impulsionamentos" 
              icon={BarChart3}
              description={`Visão completa de ${boostedProperties.length} propriedades`}
            />

            <AnimatedGrid>
              {boostedProperties.map((property, index) => (
                <BoostedPropertyCard key={property.id} property={property} />
              ))}
            </AnimatedGrid>
          </SectionContainer>
        )}

        {/* Estado vazio geral */}
        {boostedProperties.length === 0 && !loading && (
          <SectionContainer>
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Nenhum impulsionamento encontrado
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Você ainda não tem propriedades em destaque. Comece agora mesmo a impulsionar seus imóveis para aumentar a visibilidade.
              </p>
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('/pacotes-destaque', '_blank')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-2xl font-bold hover:from-purple-700 hover:to-orange-600 transition-all shadow-lg"
              >
                <Zap className="w-5 h-5" />
                Impulsionar Primeira Propriedade
              </motion.button> */}
            </div>
          </SectionContainer>
        )}
      </div>
    </div>
  );
}