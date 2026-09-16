'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Home, Heart, BarChart3, Eye, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';
import { useChatStore } from '@/lib/store/chat-store';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useDashboardActions } from '@/hooks/use-dashboard-actions';
import { createClient } from '@/lib/supabase/client';

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
import { NotificationsPanel } from './dashboard/notifications-panel';

function DashboardInner() {
  const { user, isLoading: userLoading } = useUserStore();
  const { activeConversationId } = useChatStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAgent = ['agente', 'agent', 'corretor', 'profissional'].includes(user?.role?.toLowerCase() || '');
  const [activeTab, setActiveTab] = useState('properties');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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

  // Fetch latest agent request status directly from DB (overrides stale store value)
  const supabaseDashboard = createClient();
  const { data: dbAgentStatus } = useQuery<string | null>({
    queryKey: ['agent-request-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabaseDashboard
        .from('agente_requests')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.status || null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30s sem refetch
  });
  const effectiveAgentStatus = dbAgentStatus ?? user?.current_agent_request_status;

  const { data: pendingVisitCount = 0 } = useQuery<number>({
    queryKey: ['pending-visit-count', user?.id, isAgent],
    queryFn: async () => {
      if (!user?.id) return 1;
      const endpoint = isAgent ? `/api/visits?agent_id=${user.id}` : `/api/visits?client_id=${user.id}`;
      const response = await fetch(endpoint);
      if (!response.ok) return 1;
      const data = await response.json();
      const visits = data.visits || [];
      if (visits.length === 0) return 1;
      return visits.filter((visit: { status?: string }) => (
        visit.status === 'pending' || visit.status === 'confirmed'
      )).length;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

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

  const displayName = [user.primeiro_nome, user.ultimo_nome].filter(Boolean).join(' ').trim() || user.email?.split('@')[0] || 'Usuário';

  const stats = [
    { label: 'Propriedades', value: userProperties.data?.length || 0, icon: Home },
    { label: 'Favoritas', value: userFavoriteProperties.data?.length || 0, icon: Heart },
    { label: 'Faturas', value: userInvoices.data?.length || 0, icon: BarChart3 },
    { label: 'Visualizações', value: mostViewed.data?.total_views_all || 0, icon: Eye },
  ];

  const hasRightSidebar = activeTab !== 'stats' && activeTab !== 'messages';

  return (
    <div className="h-[100dvh] lg:h-[calc(100vh-104px)] bg-gray-50 flex flex-col lg:flex-row relative overflow-hidden">

      {/* Listener de Notificações de Lead */}
      <AgencyNotificationsListener imobiliariaId={userAgency.data?.id || null} />

      {/* Tips Modal — mostra dicas em steps ao entrar no dashboard */}
      <DashboardTipsModal
        userId={user.id}
        userProperties={userProperties.data || []}
      />

      {/* ── Mobile: Bottom Tab Bar → Sidebar Drawer — hidden when viewing a chat conversation ── */}
      {!isInChatView && (
        <MobileNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userAgency={userAgency.data}
          displayName={displayName}
          avatarUrl={user.avatar_url}
          planName={userPlan.data?.nome || 'Free'}
          propertyCount={userProperties.data?.length || 0}
          favoriteCount={userFavoriteProperties.data?.length || 0}
          invoiceCount={userInvoices.data?.length || 0}
          visitCount={pendingVisitCount}
          isAgent={isAgent}
          planLimit={userPlan.data?.limite || 10}
          planRemaining={userPlan.data?.restante ?? userProperties.data?.length ?? 0}
          showSidebar={showMobileSidebar}
          onOpenSidebar={() => setShowMobileSidebar(true)}
          onCloseSidebar={() => setShowMobileSidebar(false)}
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
          visitCount={pendingVisitCount}
          isAgent={isAgent}
          userAgency={userAgency.data}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* ── Mobile Top Bar — Variação 1: Modern App Shell (FinTech Style) ── */}
        <div className={cn(
          "lg:hidden sticky top-0 z-30 shrink-0",
          isInChatView && "hidden"
        )}>
          <div className="bg-white/95 backdrop-blur-xl border-b border-slate-100/90 shadow-2xs">
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              {/* Left: Hamburger Menu */}
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center active:scale-95 transition-all shrink-0"
                aria-label="Abrir Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h10" />
                </svg>
              </button>

              {/* Right: Notifications Panel + Avatar */}
              <div className="flex items-center gap-2 shrink-0">
                <NotificationsPanel userId={user.id} />
                <button
                  onClick={() => router.push('/dashboard?tab=settings')}
                  className="relative shrink-0 active:scale-95 transition-transform"
                  aria-label="Configurações do perfil"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-orange-500 p-[2px] shadow-sm shadow-purple-300/40">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-black bg-gradient-to-br from-purple-600 to-orange-500 bg-clip-text text-transparent">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </button>
              </div>
            </div>
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
                : 'flex-1 pb-24 lg:p-4 lg:h-full',
            "grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-4 lg:gap-6"
          )}>

            <DashboardContent
              activeTab={activeTab}
              user={user}
              userProperties={userProperties.isLoading ? null : (userProperties.data ?? [])}
              userFavoriteProperties={userFavoriteProperties.isLoading ? null : (userFavoriteProperties.data ?? [])}
              userInvoices={userInvoices.data ?? []}
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
                  agentRequestStatus={effectiveAgentStatus}
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
