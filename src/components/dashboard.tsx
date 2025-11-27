'use client';

import {
  BarChart3,
  Eye,
  Heart,
  Home,
  Rocket,
  Settings,
  Star,
  User,
} from 'lucide-react';
import { useState } from 'react';
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from './ui/card';
import {
  MinhasPropriedades,
  Favoritas,
  PropriedadesMaisVisualizadas,
  Faturas,
} from '@/components/dashboard-tabs-content';
import { ConfiguracoesConta } from '@/components/account-setting';
import { PlanoCard } from '@/components/plano-card';
import { getImoveisFavoritos } from '@/lib/functions/get-favorited-imoveis';
import { getSupabaseUserProperties } from '@/lib/functions/get-properties';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CanSeeIt } from '@/components/can';
import Link from 'next/link';
import { UserCard } from '@/components/user-card';
import { getFaturas } from '@/lib/functions/supabase-actions/user-bills-action';
import { getMyPropertiesWithViews } from '@/lib/functions/supabase-actions/get-most-seen-propeties';
import { getUserPlan } from '@/lib/functions/supabase-actions/get-user-package-action';
import { UserAction } from '@/components/user-action';
import { useUserStore } from '@/lib/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Variants, Easing } from "framer-motion";
import PropriedadesImpulsionadasDashboard from '@/components/boosted-properties';
import SoftLoading from '@/components/soft-loading';
import SoftCard from '@/components/soft-card';
import SoftMenuItem from '@/components/soft-menu-item';
import SoftBackground from '@/components/soft-background';

export default function Dashboard() {
  const { user, isLoading: userLoading } = useUserStore();
  const [activeTab, setActiveTab] = useState('properties');
  const queryClient = useQueryClient();

  // Queries rodando em paralelo com cache strategy
  const userProperties = useQuery({
    queryKey: ['user-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getSupabaseUserProperties(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const userFavoriteProperties = useQuery({
    queryKey: ['favorite-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getImoveisFavoritos(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const userInvoices = useQuery({
    queryKey: ['user-invoices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getFaturas(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const mostViewed = useQuery({
    queryKey: ['most-viewed', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total_views_all: 0, properties: [] };
      return await getMyPropertiesWithViews(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const userPlan = useQuery({
    queryKey: ['user-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getUserPlan(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
  });

  // Verificar se as queries principais estão carregando
  const isLoadingQueries = userProperties.isLoading || 
                          userFavoriteProperties.isLoading || 
                          userPlan.isLoading;

  if (userLoading || isLoadingQueries) {
    return <SoftLoading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 flex items-center justify-center">
        <SoftCard className="p-8 text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <User className="w-8 h-8 text-white" />
          </motion.div>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mb-6 text-lg"
          >
            Acesso necessário
          </motion.p>
        </SoftCard>
      </div>
    );
  }

  const displayName =
    user.primeiro_nome?.trim() || user.email?.split('@')[0] || 'Usuário';

  // Stats usando dados diretamente das queries
  const stats = [
    { 
      label: 'Propriedades', 
      value: userProperties.data?.length || 0, 
      icon: Home 
    },
    { 
      label: 'Favoritas', 
      value: userFavoriteProperties.data?.length || 0, 
      icon: Heart 
    },
    { 
      label: 'Faturas', 
      value: userInvoices.data?.length || 0, 
      icon: BarChart3 
    },
    { 
      label: 'Visualizações', 
      value: mostViewed.data?.total_views_all || 0, 
      icon: Eye 
    },
  ];

  const menuItems = [
    {
      id: 'properties',
      label: 'Minhas Propriedades',
      icon: Home,
      badge: userProperties.data?.length || 0,
    },
    { 
      id: 'favorites', 
      label: 'Favoritas', 
      icon: Heart, 
      badge: userFavoriteProperties.data?.length || 0 
    },
    { 
      id: 'invoices', 
      label: 'Faturas', 
      icon: BarChart3,
      badge: userInvoices.data?.length || 0,
    },
    {
      id: 'views',
      label: 'Visualizações de Imóveis',
      icon: Eye,
      badge: mostViewed.data?.total_views_all || 0,
    },
    {
      id: 'boost',
      label: 'Propriedades Impulsionadas',
      icon: Rocket,
    },
    { 
      id: 'settings', 
      label: 'Configurações da Conta', 
      icon: Settings 
    },
  ];

  const tabContentVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as Easing } 
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 relative">
      <SoftBackground />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <SoftCard delay={0.1} className="mb-8">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                Olá, {displayName} 👋
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm sm:text-base mt-2">
                Gerencie suas propriedades com facilidade
              </CardDescription>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <UserAction 
                isLoading={userLoading}
                isError={false}
                profile={user}
                user={user}
                displayName={displayName}
                queryClient={queryClient}
                housesRemaining={(userPlan.data?.restante ?? 0) - (userProperties.data?.length ?? 0)}
              />
            </motion.div>
          </CardHeader>
        </SoftCard>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-1">
            {/* User Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <UserCard 
                user={user} 
                displayName={displayName} 
                stats={stats} 
              />
            </motion.div>

            {/* Navigation Menu */}
            <SoftCard className='py-4'>
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-800 flex items-center text-lg">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {menuItems.map((item, index) => {
                  const isProtected = item.id === 'invoices' || item.id === 'views';
                  const menuItem = (
                    <SoftMenuItem
                      key={item.id}
                      item={item}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      index={index}
                    />
                  );

                  if (isProtected) {
                    return (
                      <CanSeeIt key={item.id}>
                        {menuItem}
                      </CanSeeIt>
                    );
                  }

                  return menuItem;
                })}
              </CardContent>
            </SoftCard>

            {/* Mobile Content */}
            <div className="block lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {activeTab === 'properties' && (
                    <MinhasPropriedades 
                      userProperties={userProperties.data ?? []} 
                    />
                  )}
                  {activeTab === 'favorites' && (
                    <Favoritas 
                      userFavoriteProperties={userFavoriteProperties.data ?? []} 
                    />
                  )}
                  {activeTab === 'invoices' && (
                    <Faturas 
                      invoices={userInvoices.data ?? []} 
                    />
                  )}
                  {activeTab === 'views' && (
                    <PropriedadesMaisVisualizadas 
                      mostViewedProperties={mostViewed.data || { total_views_all: 0, properties: [] }} 
                    />
                  )}
                  {activeTab === 'boost' && <PropriedadesImpulsionadasDashboard />}
                  {activeTab === 'settings' && (
                    <ConfiguracoesConta 
                      profile={user} 
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Upgrade Section */}
            <CanSeeIt>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <PlanoCard plan={userPlan.data ?? undefined} userProperties={userProperties.data?.length ?? 0} />
              </motion.div>

              <SoftCard className="mt-4 bg-gradient-to-r from-orange-50 to-amber-50 py-4 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-700 text-lg font-bold flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-2 bg-orange-100 rounded-lg"
                    >
                      <Star className="w-5 h-5 text-orange-500" />
                    </motion.div>
                    Por que fazer upgrade?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.ul 
                    className="space-y-3 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {[
                      "Publique mais imóveis e alcance mais clientes",
                      "Tenha seus anúncios em destaque",
                      "Suporte prioritário e atendimento exclusivo"
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-start text-sm text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-gray-600 text-sm leading-relaxed"
                  >
                    Aproveite todo o potencial da plataforma, aumente sua
                    visibilidade e conquiste mais resultados.
                  </motion.p>
                </CardContent>
              </SoftCard>
            </CanSeeIt>
          </div>

          {/* Desktop Content */}
          <div className="hidden lg:block lg:col-span-8 order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full"
              >
                {activeTab === 'properties' && (
                  <MinhasPropriedades 
                    userProperties={userProperties.data ?? []} 
                  />
                )}
                {activeTab === 'favorites' && (
                  <Favoritas 
                    userFavoriteProperties={userFavoriteProperties.data ?? []} 
                  />
                )}
                {activeTab === 'invoices' && (
                  <Faturas 
                    invoices={userInvoices.data ?? []} 
                  />
                )}
                {activeTab === 'views' && (
                  <PropriedadesMaisVisualizadas 
                    mostViewedProperties={mostViewed.data || { total_views_all: 0, properties: [] }} 
                  />
                )}
                {activeTab === 'boost' && <PropriedadesImpulsionadasDashboard />}
                {activeTab === 'settings' && (
                  <ConfiguracoesConta 
                    profile={user} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}