'use client';

import { useAuth } from './auth-context';
import { BarChart3, Eye, Heart, Home, Settings, Star, Upload, User, AlertCircle } from 'lucide-react';
import { useState, useEffect, useTransition, useRef, RefObject } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import  { MinhasPropriedades, Favoritas, PropriedadesMaisVisualizadas, Faturas} from './dashboard-tabs-content';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ConfiguracoesConta } from './account-setting';
import { PlanoCard } from './plano-card';
import { useRouter } from 'next/navigation';
import { toggleFavoritoProperty } from '@/lib/actions/toggle-favorite';
import { getImoveisFavoritos } from '@/lib/actions/get-favorited-imoveis';
import { getSupabaseUserProperties } from '@/lib/actions/get-properties';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile, UserProfile } from '@/lib/actions/supabase-actions/get-user-profile';
import { CanSeeIt } from './can';
import { Button } from './ui/button';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dialogRef = useRef<HTMLButtonElement | null>(null);

  const [propertyCount, setPropertyCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  useEffect(() => {
  if (!user?.id) return;

  // Função para buscar o número total de visualizações de todas as propriedades do usuário
  const fetchViewsCount = async () => {
    const properties = await getSupabaseUserProperties(user.id);
    
    if (properties) {
      let totalViews = 0;
      for (const property of properties) {
        const { data } = await supabase
          .from('property_views')
          .select('id')
          .eq('property_id', property.id);
        totalViews += data?.length || 0;
      }
      setViewsCount(totalViews);
    }
  };

  getSupabaseUserProperties(user.id).then(props => setPropertyCount(props?.length || 0));
  getImoveisFavoritos(user.id).then(favs => setFavoriteCount(favs?.length || 0));
  fetchViewsCount();
}, [user?.id]);

    const {data: profile} = useQuery<UserProfile>({
        queryKey: ['profiles'],
        queryFn: async() => {
            const response = await getUserProfile(user?.id)
            return response
        }
    })

  if (!user) return null;

  const displayName =
    user.primeiro_nome?.trim() || user.email?.split('@')[0] || 'Usuário';

  const stats = [
    { label: 'Propriedades', value: propertyCount, icon: Home },
    { label: 'Favoritas', value: favoriteCount, icon: Heart },
    { label: 'Faturas', value: invoiceCount, icon: BarChart3 },
    { label: 'Visualizações', value: viewsCount, icon: Eye },
  ];
  
  const menuItems = [
    { id: 'properties', label: 'Minhas Propriedades', icon: Home, badge: propertyCount },
    { id: 'favorites', label: 'Favoritas', icon: Heart, badge: favoriteCount },
    { id: 'invoices', label: 'Faturas', icon: BarChart3 },
    { id: 'views', label: 'Visualizações de Imoveis', icon: Eye, badge: viewsCount },
    { id: 'settings', label: 'Configurações da Conta', icon: Settings },
  ];

  const handleRemoveFavorito = async (propertyId: string) => {
    startTransition(async () => {
      await toggleFavoritoProperty(user.id, propertyId);
    });
  };

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

            {/* Renderização condicional */}
            {user?.role === "user" ? (
              <>
                <NeedAgentDialog userId={user.id} />
              </>
            ) : (
              <SubmitPropertyButton />
            )}
          </CardHeader>
        </Card>


        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-6 order-1">
            <Card className="shadow-md">
              <CardHeader className="text-center pb-2">
                <div className="relative inline-block">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-purple-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold ring-4 ring-purple-500/50">
                    {user.primeiro_nome?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <CardTitle className="text-lg sm:text-xl text-gray-800 mt-4">{displayName}</CardTitle>
                <CardDescription className="text-gray-500 text-xs sm:text-base">{user?.sobre_mim ?? 'Usuário'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {stats.map((stat, i) => {
                    if(stat.label == 'Visualizações' || stat.label == 'Faturas'){
                      return(
                        <CanSeeIt>
                          <div key={i} className="p-3 sm:p-4 bg-purple-100 rounded-xl flex items-center justify-between border border-purple-200">
                            <div>
                              <div className="text-lg sm:text-2xl font-bold text-purple-700">{stat.value}</div>
                              <div className="text-xs text-purple-600">{stat.label}</div>
                            </div>
                            <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                        </CanSeeIt>
                      )
                    }

                    return (
                      <div key={i} className="p-3 sm:p-4 bg-purple-100 rounded-xl flex items-center justify-between border border-purple-200">
                      <div>
                        <div className="text-lg sm:text-2xl font-bold text-purple-700">{stat.value}</div>
                        <div className="text-xs text-purple-600">{stat.label}</div>
                      </div>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center text-base sm:text-lg">
                  <User className="w-5 h-5 mr-2 text-purple-700" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                {menuItems.map(item => {
                  const isProtected = item.id == 'invoices' || item.id == 'views'
                  if(isProtected) {
                    console.log({item})
                    return(
                      <CanSeeIt>
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center justify-between p-2 sm:p-3 rounded-xl cursor-pointer hover:bg-gray-100 ${
                              activeTab === item.id ? 'bg-orange-100 border border-orange-300' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <item.icon className="w-5 h-5 text-purple-700" />
                              <span className="text-gray-800 text-sm sm:text-base">{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded">
                                {item.badge}
                              </span>
                            )}
                        </div>
                      </CanSeeIt>
                    )
                  }

                  return(
                    <div
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-xl cursor-pointer hover:bg-gray-100 ${
                        activeTab === item.id ? 'bg-orange-100 border border-orange-300' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="w-5 h-5 text-purple-700" />
                        <span className="text-gray-800 text-sm sm:text-base">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )

                })}
              </CardContent>
            </Card>

            <div className="block lg:hidden">
              {activeTab === 'properties' && <MinhasPropriedades />}
              {activeTab === 'favorites' && <Favoritas />}
              {activeTab === 'invoices' && <Faturas />}
              {activeTab === 'views' && <PropriedadesMaisVisualizadas />}
              {activeTab === 'settings' && <ConfiguracoesConta />}
            </div>

            <CanSeeIt>
              <PlanoCard userId={user.id} />

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
                    Aproveite todo o potencial da plataforma, aumente sua visibilidade e conquiste mais resultados. Faça o upgrade e destaque-se no mercado imobiliário!
                  </p>
                </CardContent>
              </Card>
            </CanSeeIt>

          </div>

          <div className="hidden lg:block lg:col-span-8 order-2 mt-6 lg:mt-0">
            {activeTab === 'properties' && <MinhasPropriedades />}
            {activeTab === 'favorites' && <Favoritas />}
            {activeTab === 'invoices' && <Faturas />}
            {activeTab === 'views' && <PropriedadesMaisVisualizadas />}
            {activeTab === 'settings' && <ConfiguracoesConta />}
          </div>
        </div>
      </div>
    </div>
  );
}


export function SubmitPropertyButton() {
  return (
    <Link
      href={"/dashboard/cadastrar-imovel"}
      className="flex justify-center items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm md:text-base w-full md:w-auto mt-4 md:mt-0"
    >
      <Upload className="w-4 h-4 mr-2" />
      Enviar Propriedade
    </Link>
  )
}

export function NeedAgentDialog({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"idle" | "pending" | "requested">("idle")
  const [open, setOpen] = useState(false)

  async function handleBecomeAgentRequest() {
    setStatus("pending")

    const { error } = await supabase
      .from("agente_requests")
      .insert([{ user_id: userId, status: "pending" }])
      .select()

    if (error) {
      console.error(error.message)
      alert("Erro ao enviar solicitação")
      setStatus("idle")
      return
    }

    setStatus("requested")
    setOpen(false) // fecha a dialog automaticamente
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={status === "requested"}
          className={`flex justify-center items-center px-3 sm:px-4 py-2 rounded-lg transition text-sm md:text-base w-full md:w-auto mt-4 md:mt-0 ${
            status === "requested"
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          <Upload className="w-4 h-4 mr-2" />
          {status === "requested" ? "Aguardando aprovação" : "Enviar Propriedade"}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Permissão necessária
          </DialogTitle>
          <DialogDescription>
            Você precisa ser um <span className="font-semibold">Agente</span> para cadastrar um imóvel.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleBecomeAgentRequest}
            disabled={status === "pending"}
            className={`text-white ${
              status === "pending"
                ? "bg-blue-400 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {status === "pending" ? "Enviando..." : "Solicitar acesso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}