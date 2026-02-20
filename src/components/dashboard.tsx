'use client';

import { useState } from 'react';
import { Home, Heart, BarChart3, Eye, User } from 'lucide-react';
import { useUserStore } from '@/lib/store/user-store';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useDashboardActions } from '@/hooks/use-dashboard-actions';

import SoftLoading from '@/components/soft-loading';
import SoftCard from '@/components/soft-card';

// Sub-components
import { DashboardSidebar } from './dashboard/sidebar';
import { DashboardWelcomeCard } from './dashboard/welcome-card';
import { DashboardPlanCard } from './dashboard/plan-card';
import { DashboardStats } from './dashboard/stats';
import { DashboardContent } from './dashboard/content';

export default function Dashboard() {
  const { user, isLoading: userLoading } = useUserStore();
  const [activeTab, setActiveTab] = useState('properties');

  const {
    userProperties,
    userFavoriteProperties,
    userInvoices,
    mostViewed,
    userPlan,
    isLoading: isDataLoading
  } = useDashboardData(user?.id);

  const {
    isUploading,
    isRequestingAgent,
    handleAvatarUpload,
    handleRequestAgent
  } = useDashboardActions();

  // No initial load: only block if we don't have a user and we are still loading the user profile
  if (!user && userLoading) {
    return <SoftLoading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 flex items-center justify-center">
        <SoftCard className="p-8 text-center max-w-md">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Acesso Necessário</h2>
          <p className="text-gray-500 mt-2">Por favor, faça login para acessar o painel.</p>
        </SoftCard>
      </div>
    );
  }

  const displayName = user.primeiro_nome?.trim() || user.email?.split('@')[0] || 'Usuário';

  const stats = [
    { label: 'Propriedades', value: userProperties.data?.length || 0, icon: Home },
    { label: 'Favoritas', value: userFavoriteProperties.data?.length || 0, icon: Heart },
    { label: 'Faturas', value: userInvoices.data?.length || 0, icon: BarChart3 },
    { label: 'Visualizações', value: mostViewed.data?.total_views_all || 0, icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col lg:flex-row relative overflow-hidden">

      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        propertyCount={userProperties.data?.length || 0}
        favoriteCount={userFavoriteProperties.data?.length || 0}
        invoiceCount={userInvoices.data?.length || 0}
        viewCount={mostViewed.data?.total_views_all || 0}
      />

      <main className="flex-1 min-w-0 flex flex-col h-full lg:h-screen lg:overflow-y-auto custom-scrollbar p-0">
        <div className="w-full h-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          <DashboardContent
            activeTab={activeTab}
            user={user}
            userProperties={userProperties.data ?? []}
            userFavoriteProperties={userFavoriteProperties.data ?? []}
            userInvoices={userInvoices.data ?? []}
            mostViewed={mostViewed.data || { total_views_all: 0, properties: [] }}
            isLoading={isDataLoading}
          />

          <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col gap-4 h-full">
            <DashboardWelcomeCard
              displayName={displayName}
              avatarUrl={user.avatar_url}
              role={user.role}
              agentRequestStatus={user.current_agent_request_status}
              isUploading={isUploading}
              isRequestingAgent={isRequestingAgent}
              onAvatarUpload={handleAvatarUpload}
              onRequestAgent={handleRequestAgent}
            />

            <DashboardPlanCard
              planName={userPlan.data?.nome}
              limit={userPlan.data?.limite || 0}
              remaining={userPlan.data?.restante || 0}
            />

            <DashboardStats stats={stats} isLoading={isDataLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}