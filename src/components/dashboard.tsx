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
import { DashboardBanner } from '@/components/dashboard-banner';

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
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 xl:gap-8">
          {/* Left Column: Navigation (2 cols) */}
          <div className="lg:col-span-2 xl:col-span-2 flex flex-col gap-6 order-1">
            {/* Logo area */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-tight">Kercasa</span>
            </div>

            {/* Navigation Menu */}
            <div className="space-y-1">
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
            </div>
          </div>

          {/* Center Column: Main Content (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6 order-2">
            {/* Banner */}
            <DashboardBanner
              displayName={displayName}
              userPlanName={userPlan.data?.nome}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 min-h-[500px]"
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

          {/* Right Column: Stats & User (3 cols) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-6 order-3">
            {/* Actions & Profile */}
            <div className="flex justify-end items-center gap-4 mb-2">
              <UserAction
                isLoading={userLoading}
                isError={false}
                profile={user}
                user={user}
                displayName={displayName}
                queryClient={queryClient}
                housesRemaining={(userPlan.data?.restante ?? 0) - (userProperties.data?.length ?? 0)}
              />
            </div>

            {/* User Card */}
            <UserCard
              user={user}
              displayName={displayName}
              housesRemaining={(userPlan.data?.restante ?? 0) - (userProperties.data?.length ?? 0)}
              stats={[]} // Stats are displayed separately below
            />

            {/* Stats List (Vertical) */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-gray-800 px-1">Estatísticas</h3>
              {stats.map((stat, index) => {
                const shouldShow = (stat.label !== "Visualizações" && stat.label !== "Faturas");

                const card = (
                  <SoftCard key={index} delay={0.2 + index * 0.1} className="p-4 flex items-center justify-between border-none shadow-sm hover:shadow-md bg-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-purple-50 text-purple-600">
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                  </SoftCard>
                );

                if (!shouldShow) {
                  return <CanSeeIt key={index}>{card}</CanSeeIt>;
                }
                return card;
              })}
            </div>


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


            {/* Plan Status Card - Always Visible */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2"
            >
              <SoftCard className="py-4 border-0 shadow-lg bg-white overflow-hidden relative group">
                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-orange-500/5 to-purple-500/5 opacity-50" />

                <CardHeader className="pb-2 relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                      Seu Plano Atual
                    </CardTitle>
                    <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-full border border-purple-200">
                      {userPlan.data?.nome || "Carregando..."}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative z-10">
                  {/* Usage Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-600">
                      <span>Uso do Limite</span>
                      <span>
                        {((userPlan.data?.limite || 0) - (userPlan.data?.restante || 0))} de {userPlan.data?.limite || 0} imóveis
                      </span>
                    </div>
                    {(() => {
                      const total = userPlan.data?.limite || 1;
                      const remaining = userPlan.data?.restante || 0;
                      const used = total - remaining;
                      const percentage = Math.min(100, Math.max(0, (used / total) * 100));

                      return (
                        <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      );
                    })()}
                    <div className="text-xs text-right text-purple-600 font-semibold">
                      {userPlan.data?.restante || 0} imóveis restantes
                    </div>
                  </div>

                  {/* Feature Highlights (Mini) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                      <span>Fotos ilimitadas</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-green-500 rounded-full" />
                      <span>Suporte prioritário</span>
                    </div>
                  </div>

                  {/* Upgrade CTA */}
                  <Link href="/planos" className="block w-full">
                    <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group-hover:animate-pulse">
                      <Rocket className="w-4 h-4" />
                      Atualizar Meu Plano
                    </button>
                  </Link>
                </CardContent>
              </SoftCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}