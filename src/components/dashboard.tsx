'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Home, Heart, BarChart3, Eye, User, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';
import { useChatStore } from '@/lib/store/chat-store';
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
import { DashboardTipsModal } from './dashboard-tips-modal';

function DashboardInner() {
  const { user, isLoading: userLoading } = useUserStore();
  const { activeConversationId } = useChatStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('properties');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // True when user has opened a specific conversation on mobile
  const isInChatView = activeTab === 'messages' && !!activeConversationId;

  // Hide global mobile Header (redundant — dashboard has its own)
  // Also constrain root to viewport height (needed by tab components using `h-full` / `absolute inset-0`)
  useEffect(() => {
    setMounted(true);
    const header = document.getElementById('global-mobile-header');
    if (header) header.style.display = 'none';
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.style.paddingBottom = '0';
    const root = document.getElementById('global-layout-root');
    if (root instanceof HTMLElement) {
      root.style.height = '100dvh';
      root.style.overflow = 'hidden';
    }
    return () => {
      if (header) header.style.display = '';
      if (mainEl) mainEl.style.paddingBottom = '';
      if (root instanceof HTMLElement) {
        root.style.height = '';
        root.style.overflow = '';
      }
    };
  }, []);

  // Sync tab with URL parameter (on initial load or back/forward navigation)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL parameter when activeTab changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') !== activeTab) {
      params.set('tab', activeTab);
      window.history.pushState(null, '', `?${params.toString()}`);
    }
  }, [activeTab]);

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

  if (!mounted) {
    return <SoftLoading />;
  }

  if (!user && userLoading) {
    return <SoftLoading />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 flex items-center justify-center px-4">
        <SoftCard className="p-8 text-center max-w-md w-full">
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

  const hasRightSidebar = activeTab !== 'stats' && activeTab !== 'messages';

  return (
    <div className="h-[100dvh] lg:h-[calc(100vh-104px)] bg-gray-50 flex flex-col lg:flex-row relative overflow-hidden">

      {/* 📡 Listener de Notificações de Lead */}
      <AgencyNotificationsListener imobiliariaId={userAgency.data?.id || null} />

      {/* 💡 Tips Modal — mostra dicas em steps ao entrar no dashboard */}
      <DashboardTipsModal
        userId={user.id}
        userProperties={userProperties.data || []}
      />

      {/* ── Mobile: Bottom Tab Bar — hidden when viewing a chat conversation ── */}
      {!isInChatView && (
        <MobileNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userAgency={userAgency.data}
        />
      )}

      {/* ── Desktop: Left Sidebar ── */}
      <div className="hidden lg:block h-full shrink-0">
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

      {/* ── Main Content Area ── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* ── Mobile Compact Header Strip — hidden when viewing a chat conversation ── */}
        <div className={cn(
          "lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm px-4 py-2.5 flex items-center justify-between shrink-0",
          isInChatView && "hidden"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 p-[2px] shadow">
              <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 leading-none">Olá,</p>
              <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                {displayName.split(' ')[0]}
              </p>
            </div>
          </div>

          {/* Plan pill */}
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 shrink-0">
            <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
            <span className="text-[11px] font-bold text-orange-700">
              {userPlan.data?.nome || 'FREE'}
            </span>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col">
          <div className={cn(
            "w-full lg:pb-4",
            isInChatView
              ? 'h-full p-0'
              : activeTab === 'messages'
                ? 'h-full p-3 sm:p-4'
                : 'flex-1 pb-24 p-3 sm:p-4 lg:h-full',
            "grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6"
          )}>

            <DashboardContent
              activeTab={activeTab}
              user={user}
              userProperties={userProperties.isLoading ? null : (userProperties.data ?? [])}
              userFavoriteProperties={userFavoriteProperties.isLoading ? null : (userFavoriteProperties.data ?? [])}
              userInvoices={userInvoices.isLoading ? null : (userInvoices.data ?? [])}
              mostViewed={mostViewed.isLoading ? null : (mostViewed.data || { total_views_all: 0, properties: [] })}
              userAgency={userAgency.data}
              isLoading={isDataLoading}
              isFullWidth={!hasRightSidebar}
            />

            {/* ── Right Sidebar: Desktop only ── */}
            {hasRightSidebar && (
              <div className="hidden lg:flex lg:col-span-3 flex-col gap-3 lg:h-full lg:overflow-y-auto custom-scrollbar">
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
