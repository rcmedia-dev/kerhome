import { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  BarChart3, 
  MapPin, 
  Home, 
  X, 
  RefreshCw, 
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/store/user-store';

interface BoostedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  image?: string;
  aprovement_status: 'pending' | 'aprovado' | 'rejeitado';
  boost_plan: string;
  boost_expires_at: string;
  boost_started_at: string;
  boost_type: 'featured' | 'premium' | 'standard';
  views: number;
  clicks: number;
  property_id: string;
  plan_id: string;
  created_at: string;
  boost_status: 'approved' | 'pending' | 'rejected';
}

interface BoostManagementProps {
  darkMode: boolean;
}

export default function BoostManagement({ darkMode }: BoostManagementProps) {
  const [boostedProperties, setBoostedProperties] = useState<BoostedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'expired' | 'pending' | 'rejected' | 'all'>('active');
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { user } = useUserStore()

  useEffect(() => {
    fetchBoostedProperties();
  }, []);

  const fetchBoostedProperties = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os boosts
      const { data: boostsData, error: boostsError } = await supabase
        .from('properties_to_boost')
        .select('*')
        .order('created_at', { ascending: false });

      if (boostsError) {
        throw boostsError;
      }

      if (!boostsData || boostsData.length === 0) {
        setBoostedProperties([]);
        return;
      }

      // Buscar informações dos pacotes
      const { data: plansData, error: plansError } = await supabase
        .from('pacotes_destaque')
        .select('*');

      if (plansError) {
        throw plansError;
      }

      // Buscar informações das propriedades
      const propertyIds = boostsData.map(boost => boost.property_id);
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (propertiesError) {
        throw propertiesError;
      }

      // Criar maps para acesso rápido
      const propertiesMap = new Map();
      propertiesData?.forEach(prop => {
        propertiesMap.set(prop.id, prop);
      });

      const plansMap = new Map();
      plansData?.forEach(plan => {
        plansMap.set(plan.id, plan);
      });

      // Transformar os dados
      const formattedProperties: BoostedProperty[] = boostsData.map(boost => {
        const property = propertiesMap.get(boost.property_id);
        const plan = plansMap.get(boost.plan_id);
        
        // Calcular datas de expiração apenas para boosts aprovados
        const startedAt = new Date(boost.created_at);
        const expiresAt = new Date(startedAt);
        
        if (boost.status === 'approved' && plan?.dias) {
          expiresAt.setDate(startedAt.getDate() + plan.dias);
        } else {
          // Para boosts não aprovados, definir como expirado
          expiresAt.setDate(startedAt.getDate() - 1);
        }
        
        // Determinar tipo de boost
        const getBoostType = (planName: string): 'featured' | 'premium' | 'standard' => {
          if (!planName) return 'standard';
          if (planName.toLowerCase().includes('premium')) return 'premium';
          if (planName.toLowerCase().includes('featured')) return 'featured';
          return 'standard';
        };

        // Construir localização
        const location = [property?.bairro, property?.cidade, property?.provincia]
          .filter(Boolean)
          .join(', ') || 'Localização não definida';


        return {
          id: boost.id.toString(),
          property_id: boost.property_id,
          plan_id: boost.plan_id || '',
          title: property?.title || 'Imóvel sem título',
          location: location,
          price: property?.price || 0,
          image: property?.image,
          aprovement_status: property?.aprovement_status || 'pending',
          boost_plan: plan?.nome || 'Plano não especificado',
          boost_expires_at: expiresAt.toISOString(),
          boost_started_at: startedAt.toISOString(),
          boost_type: getBoostType(plan?.nome),
          views: property?.views_count || 0,
          clicks: Math.floor((property?.views_count || 0) * 0.1),
          created_at: boost.created_at,
          boost_status: boost.status || 'pending'
        };
      });

      setBoostedProperties(formattedProperties);
    } catch (error) {
      console.error("Failed to fetch boosted properties:", error);
      toast.error('Erro ao carregar imóveis impulsionados');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBoost = async (boostId: string) => {
    try {
      setApprovingId(boostId);
      
      // Atualizar status para approved
      const { error } = await supabase
        .from('properties_to_boost')
        .update({ status: 'approved' })
        .eq('id', boostId);

      if (error) {
        throw error;
      }

      toast.success('Boost aprovado com sucesso!');
      
      // Recarregar a lista
      await fetchBoostedProperties();
    } catch (error) {
      console.error('Erro ao aprovar boost:', error);
      toast.error('Erro ao aprovar boost');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectBoost = async (boostId: string) => {
    try {
      setRejectingId(boostId);
      
      // Atualizar status para rejected
      const { error } = await supabase
        .from('properties_to_boost')
        .update({ status: 'rejected' })
        .eq('id', boostId);

      if (error) {
        throw error;
      }

      toast.success('Boost rejeitado com sucesso!');
      
      // Recarregar a lista
      await fetchBoostedProperties();
    } catch (error) {
      console.error('Erro ao rejeitar boost:', error);
      toast.error('Erro ao rejeitar boost');
    } finally {
      setRejectingId(null);
    }
  };

  const handleRenewBoost = async (boostId: string) => {
    try {
      setRenewingId(boostId);
      
      // Encontrar o boost atual
      const currentBoost = boostedProperties.find(p => p.id === boostId);
      if (!currentBoost) {
        throw new Error('Boost não encontrado');
      }

      // Buscar informações do plano atual
      const { data: planData, error: planError } = await supabase
        .from('pacotes_destaque')
        .select('*')
        .eq('id', currentBoost.plan_id)
        .single();

      if (planError) {
        throw planError;
      }

      // Criar novo registro de boost (renovação) com status pending
      const { error: insertError } = await supabase
        .from('properties_to_boost')
        .insert([
          {
            property_id: currentBoost.property_id,
            plan_id: currentBoost.plan_id,
            status: 'pending' // Nova renovação precisa ser aprovada
          }
        ]);

      if (insertError) {
        throw insertError;
      }
      
      if (user) {
        // Registrar fatura para a renovação
        const { error: invoiceError } = await supabase
          .from('faturas')
          .insert([
            {
              user_id: user.id,
              valor: planData.preco,
              status: 'paga',
              servico: `Renovação de destaque - ${planData.nome} para o imóvel ${currentBoost.property_id}`
            }
          ]);

        if (invoiceError) {
          console.error('Erro ao registrar fatura:', invoiceError);
        }
      }

      toast.success(`Solicitação de renovação enviada! Aguarde aprovação.`);
      
      // Recarregar a lista
      await fetchBoostedProperties();
    } catch (error) {
      console.error('Erro ao renovar impulso:', error);
      toast.error('Erro ao renovar impulso');
    } finally {
      setRenewingId(null);
    }
  };

  const handleRemoveBoost = async (boostId: string) => {
    try {
      setRemovingId(boostId);
      
      // Deletar o registro de boost
      const { error } = await supabase
        .from('properties_to_boost')
        .delete()
        .eq('id', boostId);

      if (error) {
        throw error;
      }

      toast.success('Impulso removido com sucesso!');
      
      // Recarregar a lista
      await fetchBoostedProperties();
    } catch (error) {
      console.error('Erro ao remover impulso:', error);
      toast.error('Erro ao remover impulso');
    } finally {
      setRemovingId(null);
    }
  };

  const calculateTimeLeft = (expiresAt: string, boostStatus: string) => {
    // Se não está aprovado, mostrar status em vez de tempo
    if (boostStatus !== 'approved') {
      return { 
        expired: true, 
        text: boostStatus === 'pending' ? 'Pendente' : 'Rejeitado',
        percentage: 0 
      };
    }

    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return { expired: true, text: 'Expirado', percentage: 0 };
    
    const totalDays = 30;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const percentage = Math.max(0, Math.min(100, (days / totalDays) * 100));
    
    return { 
      expired: false, 
      text: `${days}d ${hours}h ${minutes}m`,
      days,
      hours,
      minutes,
      percentage
    };
  };

  const getBoostTypeColor = (type: string) => {
    switch (type) {
      case 'premium':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'featured':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
  };

  const getBoostTypeText = (type: string) => {
    switch (type) {
      case 'premium':
        return 'Premium';
      case 'featured':
        return 'Featured';
      default:
        return 'Standard';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'pending':
        return AlertCircle;
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  const filteredProperties = boostedProperties.filter(property => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      const timeLeft = calculateTimeLeft(property.boost_expires_at, property.boost_status);
      return property.boost_status === 'approved' && !timeLeft.expired;
    }
    if (activeTab === 'expired') {
      const timeLeft = calculateTimeLeft(property.boost_expires_at, property.boost_status);
      return property.boost_status === 'approved' && timeLeft.expired;
    }
    if (activeTab === 'pending') return property.boost_status === 'pending';
    if (activeTab === 'rejected') return property.boost_status === 'rejected';
    return true;
  });

  const countByStatus = {
    active: boostedProperties.filter(p => {
      const timeLeft = calculateTimeLeft(p.boost_expires_at, p.boost_status);
      return p.boost_status === 'approved' && !timeLeft.expired;
    }).length,
    expired: boostedProperties.filter(p => {
      const timeLeft = calculateTimeLeft(p.boost_expires_at, p.boost_status);
      return p.boost_status === 'approved' && timeLeft.expired;
    }).length,
    pending: boostedProperties.filter(p => p.boost_status === 'pending').length,
    rejected: boostedProperties.filter(p => p.boost_status === 'rejected').length,
    all: boostedProperties.length
  };

  // Loading state (mantido igual)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex-1 py-4 bg-gray-200 dark:bg-gray-600 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse h-96"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gestão de Imóveis Impulsionados
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Aprove, rejeite e gerencie os imóveis em destaque na plataforma
              </p>
            </div>
            <button
              onClick={fetchBoostedProperties}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              <RefreshCw size={16} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ativos</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {countByStatus.active}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expirados</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {countByStatus.expired}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {countByStatus.pending}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {countByStatus.rejected}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {countByStatus.all}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {[
              { key: 'active', label: 'Ativos', count: countByStatus.active, icon: Zap },
              { key: 'expired', label: 'Expirados', count: countByStatus.expired, icon: Clock },
              { key: 'pending', label: 'Pendentes', count: countByStatus.pending, icon: AlertCircle },
              { key: 'rejected', label: 'Rejeitados', count: countByStatus.rejected, icon: XCircle },
              { key: 'all', label: 'Todos', count: countByStatus.all, icon: BarChart3 },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-3 px-4 rounded-xl text-center transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon size={18} />
                    <span className="font-semibold">{tab.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === tab.key 
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum imóvel impulsionado encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'active' 
                ? 'Não há imóveis atualmente em destaque ativo'
                : activeTab === 'expired'
                ? 'Não há imóveis com destaque expirado'
                : activeTab === 'pending'
                ? 'Não há solicitações de destaque pendentes'
                : activeTab === 'rejected'
                ? 'Não há solicitações de destaque rejeitadas'
                : 'Não há imóveis impulsionados'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map(property => {
              const timeLeft = calculateTimeLeft(property.boost_expires_at, property.boost_status);
              const isExpired = timeLeft.expired;
              const StatusIcon = getStatusIcon(property.boost_status);
              
              return (
                <div
                  key={property.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200 group"
                >
                  {/* Property Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Boost Type Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${getBoostTypeColor(property.boost_type)}`}>
                      {getBoostTypeText(property.boost_type)}
                    </div>

                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(property.boost_status)}`}>
                      <StatusIcon size={12} />
                      {getStatusText(property.boost_status)}
                    </div>

                    {/* Progress Bar - apenas para boosts aprovados e ativos */}
                    {property.boost_status === 'approved' && !isExpired && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 dark:bg-gray-700 h-1">
                        <div 
                          className={`h-full ${
                            timeLeft.percentage > 50 
                              ? 'bg-green-500' 
                              : timeLeft.percentage > 20 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${timeLeft.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 h-12">
                      {property.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {property.price.toLocaleString('pt-AO')} Kz
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye size={14} />
                        <span>{property.views}</span>
                      </div>
                    </div>

                    {/* Boost Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Plano:</span>
                        <span className="font-medium text-gray-900 dark:text-white text-right">
                          {property.boost_plan.split(' - ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`font-medium ${getStatusColor(property.boost_status)} px-2 py-1 rounded-full text-xs`}>
                          {getStatusText(property.boost_status)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {property.boost_status === 'approved' ? 'Tempo:' : 'Solicitado em:'}
                        </span>
                        <span className={`font-medium ${
                          property.boost_status === 'approved' 
                            ? (isExpired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400')
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {property.boost_status === 'approved' 
                            ? timeLeft.text 
                            : new Date(property.created_at).toLocaleDateString('pt-AO')
                          }
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {/* Ações para boosts pendentes */}
                      {property.boost_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveBoost(property.id)}
                            disabled={approvingId === property.id}
                            className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            {approvingId === property.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRejectBoost(property.id)}
                            disabled={rejectingId === property.id}
                            className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            {rejectingId === property.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Rejeitar
                          </button>
                        </>
                      )}

                      {/* Ações para boosts aprovados */}
                      {property.boost_status === 'approved' && (
                        <>
                          {!isExpired && (
                            <button
                              onClick={() => handleRemoveBoost(property.id)}
                              disabled={removingId === property.id}
                              className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                              {removingId === property.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                              Remover
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleRenewBoost(property.id)}
                            disabled={renewingId === property.id}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                              isExpired
                                ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {renewingId === property.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            {isExpired ? 'Renovar' : 'Extender'}
                          </button>
                        </>
                      )}

                      {/* Ações para boosts rejeitados */}
                      {property.boost_status === 'rejected' && (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleRemoveBoost(property.id)}
                            disabled={removingId === property.id}
                            className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            {removingId === property.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Remover
                          </button>
                          <button
                            onClick={() => handleRenewBoost(property.id)}
                            disabled={renewingId === property.id}
                            className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            {renewingId === property.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            Reaplicar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}