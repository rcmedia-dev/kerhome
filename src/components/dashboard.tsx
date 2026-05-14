'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home, Heart, BarChart3, Eye, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useDashboardActions } from '@/hooks/use-dashboard-actions';

import SoftLoading from '@/components/soft-loading';
import SoftCard from '@/components/soft-card';
import { AgencyNotificationsListener } from './dashboard/agency-notifications-listener';

// Sub-components
import { DashboardSidebar } from './dashboard/sidebar';
import { MobileNavbar } from './dashboard/mobile-navbar';
import { DashboardWelcomeCard } from './dashboard/welcome-card';
import { DashboardPlanCard } from './dashboard/plan-card';
import { DashboardStats } from './dashboard/stats';
import { DashboardContent } from './dashboard/content';

function DashboardInner() {
  const { user, isLoading: userLoading } = useUserStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'properties');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sync tab with URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const {
    userProperties,
    userFavoriteProperties,
    userInvoices,
    mostViewed,
    userPlan,
    userAgency,
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
    <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-104px)] bg-gray-50/50 flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* ðŸ“¡ Listener de Notificações de Lead da Agência */}
      <AgencyNotificationsListener imobiliariaId={userAgency.data?.id || null} />

      <MobileNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userAgency={userAgency.data} 
      />

      <div className="hidden lg:block h-full">
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          propertyCount={userProperties.data?.length || 0}
          favoriteCount={userFavoriteProperties.data?.length || 0}
          invoiceCount={userInvoices.data?.length || 0}
          viewCount={mostViewed.data?.total_views_all || 0}
          userAgency={userAgency.data}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      <main className={cn("flex-1 min-w-0 flex flex-col p-0 overflow-hidden relative")}>
        <div className="w-full h-full p-0 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6">

          <DashboardContent
            activeTab={activeTab}
            user={user}
            userProperties={userProperties.data ?? []}
            userFavoriteProperties={userFavoriteProperties.data ?? []}
            userInvoices={userInvoices.data ?? []}
            mostViewed={mostViewed.data || { total_views_all: 0, properties: [] }}
            userAgency={userAgency.data}
            isLoading={isDataLoading}
            isFullWidth={activeTab === 'stats' || activeTab === 'messages'}
          />

          {activeTab !== 'stats' && activeTab !== 'messages' && (
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
                userAgency={userAgency.data}
              />

              <DashboardPlanCard
                planName={userPlan.data?.nome}
                limit={userPlan.data?.limite || 0}
                remaining={userPlan.data?.restante || 0}
              />

              <DashboardStats stats={stats} isLoading={isDataLoading} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<SoftLoading />}>
      <DashboardInner />
    </Suspense>
  );
}
