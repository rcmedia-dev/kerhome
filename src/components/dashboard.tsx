'use client';

import {
  BarChart3,
  Eye,
  Heart,
  Home,
  LogOut,
  Rocket,
  Settings,
  Star,
  Search,
  Pen,
  User,
  LayoutGrid,
} from 'lucide-react';
import { useState, useRef } from 'react';
import {
  MinhasPropriedades,
  Favoritas,
  PropriedadesMaisVisualizadas,
  Faturas,
} from '@/components/dashboard-tabs-content';
import { ConfiguracoesConta } from '@/components/account-setting';
import { getImoveisFavoritos } from '@/lib/functions/get-favorited-imoveis';
import { getSupabaseUserProperties } from '@/lib/functions/get-properties';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CanSeeIt } from '@/components/can';
import Link from 'next/link';
import { getFaturas } from '@/lib/functions/supabase-actions/user-bills-action';
import { getMyPropertiesWithViews } from '@/lib/functions/supabase-actions/get-most-seen-propeties';
import { getUserPlan } from '@/lib/functions/supabase-actions/get-user-package-action';
import { UserAction } from '@/components/user-action';
import { useUserStore } from '@/lib/store/user-store';
import { motion, AnimatePresence, Variants, Easing } from 'framer-motion';
import PropriedadesImpulsionadasDashboard from '@/components/boosted-properties';
import SoftLoading from '@/components/soft-loading';
import SoftCard from '@/components/soft-card';
import SoftMenuItem from '@/components/soft-menu-item';
import SoftBackground from '@/components/soft-background';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { notificateN8n } from '@/lib/functions/supabase-actions/n8n-notification-request';

export default function Dashboard() {
  const { user, isLoading: userLoading, updateUser } = useUserStore();
  const [activeTab, setActiveTab] = useState('properties');
  const [isUploading, setIsUploading] = useState(false);
  const [isRequestingAgent, setIsRequestingAgent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Avatar Upload Handler
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateUser({ avatar_url: publicUrl });
      toast.success('Foto de perfil atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      toast.error('Erro ao atualizar a foto.');
    } finally {
      setIsUploading(false);
    }
  };

  // Agent Request Handler
  // Agent Request Handler
  const handleRequestAgent = async () => {
    if (!user) return;
    try {
      setIsRequestingAgent(true);

      // 1. Salvar no banco primeiro (Persistência)
      const { error: dbError } = await supabase
        .from('agente_requests')
        .insert({
          user_id: user.id,
          status: 'pending'
        });

      if (dbError) {
        // Se já existe uma solicitação pendente by constraint
        if (dbError.code === '23505') {
          toast.info("Você já possui uma solicitação pendente.");
          await updateUser({ current_agent_request_status: 'pending' });
          return;
        }
        throw new Error(`Erro ao salvar solicitação: ${dbError.message}`);
      }

      // Atualizar estado local imediatamente
      await updateUser({ current_agent_request_status: 'pending' });
      toast.success('Solicitação registrada com sucesso!');

      // 2. Tentar notificar n8n
      try {
        await notificateN8n('agente_solicitation', {
          agentName: displayName,
        });
      } catch (n8nError) {
        console.warn('Alerta de notificação falhou, mas registro foi salvo:', n8nError);
      }

    } catch (error) {
      console.error('Erro ao solicitar:', error);
      toast.error('Erro ao enviar solicitação.');
    } finally {
      setIsRequestingAgent(false);
    }
  };

  const isPending = user?.current_agent_request_status === 'pending';

  // Queries
  const userProperties = useQuery({
    queryKey: ['user-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getSupabaseUserProperties(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const userFavoriteProperties = useQuery({
    queryKey: ['favorite-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getImoveisFavoritos(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const userInvoices = useQuery({
    queryKey: ['user-invoices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getFaturas(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const mostViewed = useQuery({
    queryKey: ['most-viewed', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total_views_all: 0, properties: [] };
      return await getMyPropertiesWithViews(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const userPlan = useQuery({
    queryKey: ['user-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getUserPlan(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const isLoadingQueries = userProperties.isLoading || userFavoriteProperties.isLoading || userPlan.isLoading;

  if (userLoading || isLoadingQueries) {
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

  const menuItems = [
    { id: 'properties', label: 'Minhas Propriedades', icon: Home, badge: userProperties.data?.length || 0 },
    { id: 'favorites', label: 'Favoritas', icon: Heart, badge: userFavoriteProperties.data?.length || 0 },
    { id: 'invoices', label: 'Faturas', icon: BarChart3, badge: userInvoices.data?.length || 0 },
    { id: 'views', label: 'Visualizações', icon: Eye, badge: mostViewed.data?.total_views_all || 0 },
    { id: 'boost', label: 'Impulsionadas', icon: Rocket },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const tabContentVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as Easing } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  // Calculations for Plan Progress
  const totalLimit = userPlan.data?.limite || 0;
  const remaining = userPlan.data?.restante || 0;
  const used = totalLimit - remaining;
  const percentage = totalLimit > 0 ? (used / totalLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col lg:flex-row relative overflow-hidden">
      <SoftBackground />

      {/* LEFT SIDEBAR - NAVIGATION */}
      <aside className="w-full lg:w-72 bg-white/80 backdrop-blur-md border-r border-gray-100 flex flex-col shrink-0 lg:h-screen lg:sticky lg:top-0 z-40">

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
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
            if (isProtected) return <CanSeeIt key={item.id}>{menuItem}</CanSeeIt>;
            return menuItem;
          })}

          {/* ADS / ANNOUNCEMENTS BLOCKS */}
          <div className="mt-auto pt-4 space-y-4">
            {/* Ad Block 1 - Premium Plan */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-purple-600 to-indigo-700 text-white relative overflow-hidden group cursor-pointer shadow-lg">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Rocket className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-sm mb-1">Seja Premium</h3>
                <p className="text-[10px] text-purple-100 leading-tight mb-2">
                  Destaque seus imóveis e venda 3x mais rápido.
                </p>
                <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-medium w-fit backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  Ver Planos
                </div>
              </div>
            </div>

            {/* Ad Block 2 - Mobile App */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white relative overflow-hidden group cursor-pointer shadow-lg">
              <div className="absolute -bottom-2 -right-2 p-2 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                <LayoutGrid className="w-16 h-16" />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-sm mb-1">Baixe o App</h3>
                <p className="text-[10px] text-orange-100 leading-tight mb-2">
                  Gerencie seus negócios em qualquer lugar.
                </p>
                <div className="px-2 py-1 bg-white/20 rounded text-[10px] font-medium w-fit backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  Download
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col h-full lg:h-screen lg:overflow-y-auto custom-scrollbar p-0">

        {/* GRID CONTAINER - FULL WIDTH */}
        <div className="w-full h-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CENTER COLUMN: TABS CONTENT (9/12 width = 75%) */}
          <div className="lg:col-span-9 order-2 lg:order-1 h-full">
            <div className="h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabContentVariants}
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-md p-6 lg:p-8 shadow-sm border border-gray-200 h-full min-h-[calc(100vh-3rem)]"
                >
                  {activeTab === 'properties' && <MinhasPropriedades userProperties={userProperties.data ?? []} />}
                  {activeTab === 'favorites' && <Favoritas userFavoriteProperties={userFavoriteProperties.data ?? []} />}
                  {activeTab === 'invoices' && <Faturas invoices={userInvoices.data ?? []} />}
                  {activeTab === 'views' && <PropriedadesMaisVisualizadas mostViewedProperties={mostViewed.data || { total_views_all: 0, properties: [] }} />}
                  {activeTab === 'boost' && <PropriedadesImpulsionadasDashboard />}
                  {activeTab === 'settings' && <ConfiguracoesConta profile={user} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COLUMN: BANNER & STATS (3/12 width = 25%) */}
          <div className="lg:col-span-3 order-1 lg:order-2 flex flex-col gap-4 h-full">

            {/* WELCOME CARD - Vertical - NO FLOATING EFFECTS */}
            <div className="relative rounded-md bg-gradient-to-br from-purple-900 to-gray-900 overflow-hidden shadow-md p-6 group shrink-0 border border-purple-500/20">

              <div className="relative z-10 flex flex-col gap-4 text-center items-center">
                <div className="flex flex-col items-center">
                  {/* AVATAR & EDIT BUTTON */}
                  <div className="relative mb-4 group/avatar">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-purple-500 to-orange-500 shadow-xl ring-4 ring-white/10">
                      <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden flex items-center justify-center relative">
                        {userLoading || isUploading ? (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : null}
                        {user?.avatar_url ? (
                          <img
                            src={user?.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-white font-bold">{displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </div>

                    {/* EDIT BUTTON OVERLAY */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-purple-600 shadow-lg hover:scale-110 transition-transform cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group-hover/avatar:bg-purple-600 group-hover/avatar:text-white"
                      title="Alterar Foto"
                    >
                      <Pen className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                      {['agente', 'agent', 'corretor'].includes(user?.role?.toLowerCase() || '') ? 'Agente Kercasa' : 'Usuário'}
                    </span>


                    <h1 className="text-2xl font-bold text-white leading-tight mt-1">
                      Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">{displayName.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-gray-400 text-xs">
                      Bem-vindo ao seu painel.
                    </p>

                    {!['agente', 'agent', 'corretor'].includes(user?.role?.toLowerCase() || '') && user?.current_agent_request_status !== 'approved' && (
                      <button
                        disabled={isRequestingAgent || isPending}
                        onClick={handleRequestAgent}
                        className="w-full lg:w-auto mt-2 lg:mt-1 h-8 lg:h-6 text-xs px-3 lg:px-2 bg-orange-500 text-white rounded shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isPending ? 'Aguardando Aprovação' : (isRequestingAgent ? 'Enviando...' : 'Solicitar ser Agente')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PLAN CARD - Vertical */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-md p-5 shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Seu Plano</p>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                    {userPlan.data?.nome || "Carregando..."}
                    <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                  </h3>
                </div>
                <Link href="/planos">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-md hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-600">Uso do Plano</span>
                    <span className={remaining < 3 ? "text-red-500" : "text-emerald-600"}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2 bg-gray-100 rounded-full" indicatorClassName="bg-gradient-to-r from-purple-500 to-orange-500" />
                  <p className="text-[10px] text-gray-400 text-right">{used} / {totalLimit || "∞"} imóveis</p>
                </div>
                <Link href="/planos" className="block">
                  <Button size="sm" className="w-full bg-gray-900 text-white hover:bg-gray-800 h-9 text-xs rounded-md shadow-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Fazer Upgrade <Rocket className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* STATS - Vertical List */}
            <div className="flex flex-col gap-3 flex-1">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4 bg-white p-4 rounded-md shadow-sm border border-gray-200 hover:border-purple-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{stat.value}</p>
                    <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider truncate">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}