'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Eye, 
  Clock, 
  BarChart3, 
  Calendar,
  Target,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/lib/store/user-store';
import { 
  BoostedProperty, 
  getBoostedProperties, 
  getPerformanceMetrics, 
  PerformanceMetrics,
} from '@/lib/functions/supabase-actions/boost-functions';
import SectionContainer from '@/components/section-container';
import SectionHeader from '@/components/section-header';
import { AnimatedGrid, EmptyState } from '@/components/empty-state';
import LoadingSpinner from '@/components/loading-spinner';
import BoostedPropertyCard from '@/components/boosted-propertie-card';






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

  // Função auxiliar para calcular tempo
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
      percentage: Math.max(0, Math.min(100, (days / 30) * 100))
    };
  };

  // Filtros corrigidos
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
                    <p className="text-3xl font-bold mt-2">{performanceMetrics.click_through_rate.toLocaleString()}%</p>
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
                  <BoostedPropertyCard 
                    key={property.id} 
                    property={property} 
                    user={user}
                  />
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
                <BoostedPropertyCard 
                  key={property.id} 
                  property={property} 
                  user={user}
                />
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
                <BoostedPropertyCard 
                  key={property.id} 
                  property={property} 
                  user={user}
                />
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
            </div>
          </SectionContainer>
        )}
      </div>
    </div>
  );
}