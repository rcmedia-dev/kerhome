'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { User, Menu, X } from 'lucide-react';
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

  // Reset scroll position on mobile when tab or active conversation changes
  useEffect(() => {
    const el = document.querySelector('.mobile-scroll-container');
    if (el) {
      el.scrollTop = 0;
    }
  }, [activeTab, activeConversationId]);


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

  const hasRightSidebar = activeTab !== 'stats' && activeTab !== 'messages';

  return (
    <div className="mobile-app-shell lg:h-auto lg:min-h-0 lg:max-h-none bg-gray-50 flex flex-col lg:flex-row relative overflow-hidden">

      {/* Listener de Notificações de Lead */}
      <AgencyNotificationsListener imobiliariaId={userAgency.data?.id || null} />

      {/* Tips Modal — mostra dicas em steps ao entrar no dashboard para corretores/agentes */}
      {isAgent && (
        <DashboardTipsModal
          userId={user.id}
          userProperties={userProperties.data || []}
        />
      )}

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
        />
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* ── Mobile Top Bar — Variação 1: Modern App Shell (FinTech Style) ── */}
        <div className={cn(
          "lg:hidden sticky top-0 z-30 shrink-0",
          isInChatView && "hidden"
        )}>
          <div className="safe-area-top bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-xs supports-backdrop-filter:bg-white/60">
            <div className="py-2.5 px-3.5 flex items-center justify-between">
              {/* Lado Esquerdo: Menu Hamburguer + Logo KerHome */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="p-2 -ml-1 rounded-xl text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer active:scale-95"
                  aria-label={showMobileSidebar ? "Fechar menu" : "Abrir menu"}
                  aria-expanded={showMobileSidebar}
                >
                  {showMobileSidebar ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <Link href="/" aria-label="Página inicial" className="flex items-center gap-1.5 shrink-0">
                  <div className="w-26 sm:w-30">
                    <Image
                      src="/kercasa_logo.png"
                      alt="kerhome logo"
                      width={120}
                      height={30}
                      style={{ width: 'auto', height: 'auto' }}
                      priority
                    />
                  </div>
                  <span className="hidden xs:inline-flex text-[9.5px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.5 rounded-full">
                    Painel
                  </span>
                </Link>
              </div>

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
        <div className={cn(
          "mobile-scroll-container flex-1 flex flex-col",
          activeTab === 'messages' ? "overflow-hidden" : "overflow-y-auto lg:overflow-hidden"
        )}>
          <div className={cn(
            "w-full lg:pb-4",
            activeTab === 'messages'
              ? (isInChatView ? 'h-full p-0 md:p-4' : 'h-full p-2.5 sm:p-4')
              : 'flex-1 pb-28 lg:p-4 lg:h-full',
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

                {/* Mini métricas — V5 summary-grid */}
                <div
                  className="grid grid-cols-3 gap-2"
                  aria-label="Resumo"
                >
                  <div className="bg-white border border-border rounded-[14px] py-3 px-1.5 text-center shadow-card">
                    <div className="text-[17px] font-black tracking-tight tabular-nums text-purple-700 leading-none">
                      {userProperties.data?.length ?? 0}
                    </div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.05em] mt-1">
                      Anúncios
                    </div>
                  </div>
                  <div className="bg-white border border-border rounded-[14px] py-3 px-1.5 text-center shadow-card">
                    <div className="text-[17px] font-black tracking-tight tabular-nums text-purple-700 leading-none">
                      {userFavoriteProperties.data?.length ?? 0}
                    </div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.05em] mt-1">
                      Favoritas
                    </div>
                  </div>
                  <div className="bg-white border border-border rounded-[14px] py-3 px-1.5 text-center shadow-card">
                    <div className="text-[17px] font-black tracking-tight tabular-nums text-purple-700 leading-none">
                      {pendingVisitCount}
                    </div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.05em] mt-1">
                      Visitas
                    </div>
                  </div>
                </div>

                {/* Ads — V5: tag/corpo → CTA + vidro 5s */}
                <div
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg"
                  role="complementary"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-glass-sweep"
                  />
                  <div className="relative z-10 p-4">
                    <h4 className="text-sm font-bold m-0">Destaque seu imóvel</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1.5 mb-0">Publicidade</p>
                    <p className="text-[11px] opacity-90 mt-1 mb-0 leading-snug">
                      Aumente visualizações com o impulsionamento da Kercasa.
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-3 py-1.5 rounded-lg bg-white text-purple-700 text-[11px] font-bold hover:bg-purple-50 transition-all"
                    >
                      Saber Mais
                    </button>
                  </div>
                </div>

                <div
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-lg"
                  role="complementary"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-glass-sweep"
                    style={{ animationDelay: '2.5s' }}
                  />
                  <div className="relative z-10 p-4">
                    <h4 className="text-sm font-bold m-0">Torne-se Agente</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1.5 mb-0">Publicidade</p>
                    <p className="text-[11px] opacity-90 mt-1 mb-0 leading-snug">
                      Cadastre imóveis e gerencie suas vendas na Kercasa.
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-3 py-1.5 rounded-lg bg-white text-orange-600 text-[11px] font-bold hover:bg-orange-50 transition-all"
                    >
                      Ativar Agora
                    </button>
                  </div>
                </div>
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
