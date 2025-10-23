'use client';

import {
  BarChart3,
  Eye,
  Heart,
  Home,
  Rocket,
  Settings,
  Star,
  Upload,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Card,
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
} from './dashboard-tabs-content';
import { ConfiguracoesConta } from './account-setting';
import { PlanoCard } from './plano-card';
import { getImoveisFavoritos } from '@/lib/actions/get-favorited-imoveis';
import { getSupabaseUserProperties } from '@/lib/actions/get-properties';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CanSeeIt } from './can';
import Link from 'next/link';
import { UserCard } from './user-card';
import { getFaturas } from '@/lib/actions/supabase-actions/user-bills-action';
import { getMyPropertiesWithViews } from '@/lib/actions/supabase-actions/get-most-seen-propeties';
import { getUserPlan } from '@/lib/actions/supabase-actions/get-user-package-action';
import { notificateN8n } from '@/lib/actions/supabase-actions/n8n-notification-request';
import { supabase } from '@/lib/supabase';
import { UserAction } from './user-action';
import { useUserStore } from '@/lib/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Variants, Easing } from "framer-motion";
import { cn } from '@/lib/utils';
import PropriedadesImpulsionadasDashboard from './boosted-properties';

// Loading suave e elegante
const SoftLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 flex items-center justify-center">
    <div className="text-center">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"
      />
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 font-medium"
      >
        Carregando seu espaço...
      </motion.p>
    </div>
  </div>
);

// Card com animação suave
const SoftCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    whileHover={{ 
      y: -2,
      transition: { duration: 0.2 }
    }}
    className={cn(
      "bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300",
      className
    )}
  >
    {children}
  </motion.div>
);

// Item do menu com animação suave
const SoftMenuItem = ({ 
  item, 
  activeTab, 
  setActiveTab,
  index 
}: { 
  item: any; 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  index: number;
}) => {
  const isActive = activeTab === item.id;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ 
        x: 4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveTab(item.id)}
      className={cn(
        "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 group",
        isActive
          ? "bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200"
          : "bg-white border border-transparent hover:border-orange-100 hover:bg-orange-50/50"
      )}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={isActive ? { 
            scale: [1, 1.1, 1],
            rotate: [0, -5, 0]
          } : {}}
          transition={{ duration: 0.5 }}
          className={cn(
            "p-2 rounded-lg transition-all duration-300",
            isActive 
              ? "bg-orange-500 text-white shadow-sm" 
              : "bg-purple-100 text-purple-600 group-hover:bg-orange-100 group-hover:text-orange-600"
          )}
        >
          <item.icon className="w-4 h-4" />
        </motion.div>
        <span className={cn(
          "font-medium transition-colors",
          isActive ? "text-orange-700" : "text-gray-700 group-hover:text-orange-600"
        )}>
          {item.label}
        </span>
      </div>
      {item.badge !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className={cn(
            "px-2 py-1 text-xs font-semibold rounded-full transition-colors",
            isActive 
              ? "bg-orange-500 text-white" 
              : "bg-gray-100 text-gray-600 group-hover:bg-orange-500 group-hover:text-white"
          )}
        >
          {item.badge}
        </motion.span>
      )}
    </motion.div>
  );
};

// Efeito de partículas suaves para o background
const SoftBackground = () => {
  const [dimensions, setDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    }
  }, []);

  if (dimensions.w === 0 || dimensions.h === 0) return null; // Evita render no SSR

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-purple-100 to-orange-100 opacity-20"
          initial={{
            x: Math.random() * dimensions.w,
            y: Math.random() * dimensions.h,
          }}
          animate={{
            x: [null, Math.random() * dimensions.w],
            y: [null, Math.random() * dimensions.h],
          }}
          transition={{
            duration: 20 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user, isLoading: userLoading } = useUserStore();
  const [activeTab, setActiveTab] = useState('properties');
  const queryClient = useQueryClient();

  const [propertyCount, setPropertyCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  // Queries (mantidas as mesmas)
  const userProperties = useQuery({
    queryKey: ['user-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await getSupabaseUserProperties(user.id);
      setPropertyCount(response.length);
      return response;
    },
    enabled: !!user?.id,
  });

  const userFavoriteProperties = useQuery({
    queryKey: ['favorite-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await getImoveisFavoritos(user.id);
      setFavoriteCount(response.length);
      return response;
    },
    enabled: !!user?.id,
  });

  const userInvoices = useQuery({
    queryKey: ['user-invoices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await getFaturas(user.id);
      setInvoiceCount(response.length);
      return response;
    },
    enabled: !!user?.id,
  });

  const mostViewed = useQuery<{ total_views_all: number; properties: any[] }>({
    queryKey: ['most-viewed', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total_views_all: 0, properties: [] };
      const response = await getMyPropertiesWithViews(user.id);
      setViewsCount(response.total_views_all);
      return response;
    },
    enabled: !!user?.id,
  });

  const userPlan = useQuery({
    queryKey: ['user-plan', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getUserPlan(user.id);
    },
    enabled: !!user?.id,
  });

  if (userLoading) {
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
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-purple-600 to-orange-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium inline-block"
            >
              Fazer Login
            </Link>
          </motion.div>
        </SoftCard>
      </div>
    );
  }

  const displayName =
    user.primeiro_nome?.trim() || user.email?.split('@')[0] || 'Usuário';

  const stats = [
    { label: 'Propriedades', value: propertyCount, icon: Home },
    { label: 'Favoritas', value: favoriteCount, icon: Heart },
    { label: 'Faturas', value: invoiceCount, icon: BarChart3 },
    { label: 'Visualizações', value: viewsCount, icon: Eye },
  ];

  const menuItems = [
    {
      id: 'properties',
      label: 'Minhas Propriedades',
      icon: Home,
      badge: propertyCount,
    },
    { id: 'favorites', label: 'Favoritas', icon: Heart, badge: favoriteCount },
    { id: 'invoices', label: 'Faturas', icon: BarChart3 },
    {
      id: 'views',
      label: 'Visualizações de Imóveis',
      icon: Eye,
      badge: viewsCount,
    },
    {
      id: 'boost',
      label: 'Propriedades Impulsionadas',
      icon: Rocket,
    },
    { id: 'settings', label: 'Configurações da Conta', icon: Settings },
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
                housesRemaining={userPlan.data?.restante ?? 0}
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
              <UserCard user={user} displayName={displayName} stats={stats} />
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
              <CardContent className="space-y-2 py-">
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
                  {activeTab === 'properties' && <MinhasPropriedades userProperties={userProperties.data ?? []} />}
                  {activeTab === 'favorites' && <Favoritas userFavoriteProperties={userFavoriteProperties.data ?? []} />}
                  {activeTab === 'invoices' && <Faturas invoices={userInvoices.data ?? []} />}
                  {activeTab === 'views' && <PropriedadesMaisVisualizadas mostViewedProperties={mostViewed.data!} />}
                  {activeTab === 'boost' && <PropriedadesImpulsionadasDashboard />}
                  {activeTab === 'settings' && <ConfiguracoesConta profile={user || undefined} />}
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
                <PlanoCard plan={userPlan.data ?? undefined} />
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
                {activeTab === 'properties' && <MinhasPropriedades userProperties={userProperties.data ?? []} />}
                {activeTab === 'favorites' && <Favoritas userFavoriteProperties={userFavoriteProperties.data ?? []} />}
                {activeTab === 'invoices' && <Faturas invoices={userInvoices.data ?? []} />}
                {activeTab === 'views' && <PropriedadesMaisVisualizadas mostViewedProperties={mostViewed.data!} />}
                {activeTab === 'boost' && <PropriedadesImpulsionadasDashboard />}
                {activeTab === 'settings' && <ConfiguracoesConta profile={user} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}


type AgentRequestButtonProps = {
  userId: string;
  userName: string;
  queryClient: any;
}

// AgentRequestButton atualizado com animações suaves
export function AgentRequestButton({ userId, userName, queryClient }: AgentRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: pendingRequest, isLoading: isChecking } = useQuery<{ id: string; status: string } | null>({
    queryKey: ["agent-request", userId],
    queryFn: async (): Promise<{ id: string; status: string } | null> => {
      const { data, error } = await supabase
        .from("agente_requests")
        .select("id, status")
        .eq("user_id", userId)
        .eq("status", "pending")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleBecomeAgent = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("agente_requests")
        .insert([{ user_id: userId, status: "pending" }])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar requisição:", error.message);
        alert("Erro ao enviar solicitação");
        return;
      }

      await queryClient.invalidateQueries({ 
        queryKey: ["agent-request", userId] 
      });

      await notificateN8n("agente_solicitation", { agentName: userName });

      alert("Solicitação para se tornar agente enviada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao enviar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const hasPendingRequest = Boolean(pendingRequest);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleBecomeAgent}
      disabled={isLoading || isChecking || hasPendingRequest}
      className={cn(
        "flex justify-center items-center px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 text-sm md:text-base w-full md:w-auto font-medium",
        isLoading || isChecking || hasPendingRequest
          ? "bg-gradient-to-r from-purple-400 to-orange-400 cursor-not-allowed shadow-sm"
          : "bg-gradient-to-r from-purple-600 to-orange-600 hover:shadow-md shadow-sm text-white"
      )}
    >
      <motion.div
        animate={isLoading ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
      >
        <User className="w-4 h-4 mr-2" />
      </motion.div>
      {isLoading
        ? "Enviando..."
        : isChecking
        ? "Verificando..."
        : hasPendingRequest
        ? "Aguardando Aprovação"
        : "Tornar-se Agente"}
    </motion.button>
  );
}
