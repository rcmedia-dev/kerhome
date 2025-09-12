'use client';

import { useAuth } from './auth-context';
import {
  BarChart3,
  Eye,
  Heart,
  Home,
  Settings,
  Star,
  Upload,
  User,
} from 'lucide-react';
import { useState } from 'react';
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
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import {
  getUserProfile,
  UserProfile,
} from '@/lib/actions/supabase-actions/get-user-profile';
import { CanSeeIt } from './can';
import Link from 'next/link';
import { UserCard } from './user-card';
import { getFaturas } from '@/lib/actions/supabase-actions/user-bills-action';
import { getMyPropertiesWithViews } from '@/lib/actions/supabase-actions/get-most-seen-propeties';
import { getUserPlan } from '@/lib/actions/supabase-actions/get-user-package-action';
import { notificateN8n } from '@/lib/actions/supabase-actions/n8n-notification-request';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');

  const [propertyCount, setPropertyCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);


  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<UserProfile>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await getUserProfile(user?.id);
      return response;
    },
    enabled: !!user?.id, // só executa se houver user.id
  });

  //fetching user properties views count
  const userProperties = useQuery({
    queryKey: ['user-properties'],
    queryFn: async() => {
      const response = await getSupabaseUserProperties(user?.id);
      setPropertyCount(response.length)
      return response
    },
    enabled: !!user?.id, // só executa se houver user.id
  })

  //fetching user favorites properties
  const userFavoriteProperties = useQuery({
    queryKey: ['favorite-properties'],
    queryFn: async() => {
      const response = await getImoveisFavoritos(user?.id);
      setFavoriteCount(response.length)
      return response;
    }
  })

  //fetching user ivoices
  const userInvoices = useQuery({
    queryKey: ['user-invoices'],
    queryFn: async() => {
      const response = await getFaturas(user!.id)
      setInvoiceCount(response.length)
      return response
    }
  })

  //fetching most viewed properties
  const mostViewed = useQuery({
    queryKey: ['most-viewed'],
    queryFn: async() => {
      const response = await getMyPropertiesWithViews(user?.id)
      setViewsCount(response.total_views_all)
      return response
    }
  })

  //user plan request
  const userPlan = useQuery({
    queryKey: ['user-plan'],
    queryFn: async() => {
      const response = await getUserPlan(user!.id)
      return response
    }
  })


  if (!user) return null;

  const displayName =
    user.primeiro_nome?.trim() || user.email?.split('@')[0] || 'Usuário';

  // Estatísticas para o UserCard
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
      label: 'Visualizações de Imoveis',
      icon: Eye,
      badge: viewsCount,
    },
    { id: 'settings', label: 'Configurações da Conta', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Card className="mb-6 shadow-md">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Bem-vindo, {displayName}
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm sm:text-base">
                Gerencie suas propriedades com elegância
              </CardDescription>
            </div>

            <div>
              {isLoading ? (
                <span className="text-gray-500 text-sm">Carregando...</span>
              ) : isError ? (
                <span className="text-red-500 text-sm">Erro ao carregar perfil</span>
              ) : profile?.role === "user" ? (
                <AgentRequestButton userId={user.id} userName={displayName} />
              ) : profile?.role === "agent" ? (
                // Botão de enviar propriedade
                <Link
                  href="/dashboard/cadastrar-imovel"
                  className="flex justify-center items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm md:text-base w-full md:w-auto mt-4 md:mt-0"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Propriedade
                </Link>
              ) : (
                <span className="text-gray-500 text-sm">Perfil sem role definida</span>
              )}
            </div>

          </CardHeader>
        </Card>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-6 order-1">
            {/* Usando o UserCard componentizado */}
            {profile ? (
              <UserCard user={profile} displayName={displayName} stats={stats} />
            ) : (
              <Card className="shadow-md p-6 flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  Carregando perfil...
                </span>
              </Card>
            )}

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
                  <User className="w-5 h-5 mr-2 text-purple-700" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                {menuItems.map((item) => {
                  const isProtected =
                    item.id == 'invoices' || item.id == 'views';
                  if (isProtected) {
                    return (
                      <CanSeeIt key={item.id}>
                        <div
                          onClick={() => setActiveTab(item.id)}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-xl cursor-pointer hover:bg-gray-100 ${
                            activeTab === item.id
                              ? 'bg-orange-100 border border-orange-300'
                              : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <item.icon className="w-5 h-5 text-purple-700" />
                            <span className="text-gray-800 text-sm sm:text-base">
                              {item.label}
                            </span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </CanSeeIt>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-xl cursor-pointer hover:bg-gray-100 ${
                        activeTab === item.id
                          ? 'bg-orange-100 border border-orange-300'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="w-5 h-5 text-purple-700" />
                        <span className="text-gray-800 text-sm sm:text-base">
                          {item.label}
                        </span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="block lg:hidden">
              {activeTab === 'properties' && <MinhasPropriedades userProperties={userProperties.data ?? []} />}
              {activeTab === 'favorites' && <Favoritas userFavoriteProperties={userFavoriteProperties.data ?? []}/>}
              {activeTab === 'invoices' && <Faturas invoices={userInvoices.data ?? []}/>}
              {activeTab === 'views' && <PropriedadesMaisVisualizadas mostViewedProperties={mostViewed.data!}/>}
              {activeTab === 'settings' && <ConfiguracoesConta profile={profile!}/>}
            </div>

            <CanSeeIt>
              
              <PlanoCard plan={userPlan.data} />

              <Card className="shadow border border-orange-100 mt-4 bg-orange-50/60">
                <CardHeader>
                  <CardTitle className="text-orange-600 text-base sm:text-lg font-bold flex items-center gap-2">
                    <Star className="w-5 h-5 text-orange-400" />
                    Por que fazer upgrade?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 text-xs sm:text-sm text-gray-700 space-y-1 mb-3">
                    <li>Publique mais imóveis e alcance mais clientes</li>
                    <li>Tenha seus anúncios em destaque</li>
                    <li>Suporte prioritário e atendimento exclusivo</li>
                  </ul>
                  <p className="text-gray-700 text-xs sm:text-sm">
                    Aproveite todo o potencial da plataforma, aumente sua
                    visibilidade e conquiste mais resultados. Faça o upgrade e
                    destaque-se no mercado imobiliário!
                  </p>
                </CardContent>
              </Card>
            </CanSeeIt>
          </div>

          <div className="hidden lg:block lg:col-span-8 order-2 mt-6 lg:mt-0">
            {activeTab === 'properties' && <MinhasPropriedades userProperties={userProperties.data ?? []} />}
            {activeTab === 'favorites' && <Favoritas userFavoriteProperties={userFavoriteProperties.data ?? []}/>}
            {activeTab === 'invoices' && <Faturas invoices={userInvoices.data ?? []}/>}
            {activeTab === 'views' && <PropriedadesMaisVisualizadas mostViewedProperties={mostViewed.data!}/>}
            {activeTab === 'settings' && <ConfiguracoesConta profile={profile!}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentRequestButton({ userId, userName }: { userId: string, userName: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);


  //useQuery requests
  //fetching plan requests 
  const planRequest = useQuery({
    queryKey: ['plan-request'],
    queryFn: async() => {
      const { data, error } = await supabase.from('plan_requests').select('id, status').eq('user_id', userId).eq('status', 'pending').single() 
      if (data && !error) {
        setHasPendingRequest(true);
      }

      return
    }
  })

  const handleBecomeAgent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("plan_requests")
        .insert([
          {
            user_id: userId,
            status: "pending",
            plan_id: null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar requisição:", error.message);
        alert("Erro ao enviar solicitação");
        return;
      }

      await notificateN8n("agente_solicitation", {
        agentName: userName
      });

      alert("Solicitação para se tornar agente enviada com sucesso!");
      setHasPendingRequest(true);
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao enviar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasPendingRequest) {
    return (
      <button
        disabled
        className="flex justify-center items-center px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg cursor-not-allowed text-sm md:text-base w-full md:w-auto mt-4 md:mt-0"
      >
        <User className="w-4 h-4 mr-2" />
        Aguardando Aprovação
      </button>
    );
  }

  return (
    <button
      onClick={handleBecomeAgent}
      disabled={isLoading}
      className={`flex justify-center items-center px-3 sm:px-4 py-2 rounded-lg transition text-sm md:text-base w-full md:w-auto mt-4 md:mt-0 ${
        isLoading
          ? "bg-blue-400 cursor-wait"
          : "bg-blue-600 hover:bg-blue-700"
      } text-white`}
    >
      <User className="w-4 h-4 mr-2" />
      {isLoading ? "Enviando..." : "Tornar-se Agente"}
    </button>
  );
}