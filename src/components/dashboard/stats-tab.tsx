'use client';

import React, { useEffect, useState, useTransition, useMemo } from 'react';
import { 
  TrendingUp, 
  RefreshCw,
  MessageCircle,
  Share2,
  Phone,
  Eye,
  Building2,
  Users,
  Calendar,
  Zap,
  ArrowRight,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  PieChart as PieChartIcon,
  Search,
  Trophy,
  Activity,
  Target,
  HelpCircle,
  BarChart3,
  Clock,
  Rocket,
  LayoutDashboard,
  Settings2
} from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { TMyPropertiesWithViews } from '@/lib/functions/supabase-actions/property-views-actions';
import { 
  BoostedProperty, 
  getBoostedProperties, 
} from '@/lib/functions/supabase-actions/boost-functions';
import BoostedPropertyCard from '@/components/boosted-propertie-card';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { getEventStats } from '@/lib/functions/supabase-actions/get-event-stats-action';
import { type EventStatsResult } from '@/lib/functions/supabase-actions/track-event-types';
import { ErrorBoundary } from './shared-ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PerformanceTipsModal } from './performance-tips-modal';

interface StatsTabProps {
  ownerId: string;
  mostViewedProperties?: TMyPropertiesWithViews | null;
  user?: any;
}

const EVENT_LABEL_MAP: Record<string, string> = {
  'share_whatsapp': 'Partilhas no WhatsApp',
  'view_property': 'Visitas a Imóveis',
  'chat': 'Novas Conversas no Chat',
  'click_phone': 'Cliques no Telefone',
  'whatsapp': 'Mensagens via WhatsApp',
  'view_profile': 'Visitas ao Perfil Global',
  'view_agent': 'Visitas ao seu Perfil',
  'view_agency': 'Visitas à Imobiliária',
  'schedule_visit': 'Agendamentos de Visita',
  'lets_talk': 'Cliques em "Vamos Conversar"',
  'share_facebook': 'Partilhas no Facebook',
  'share_copy_link': 'Links Copiados',
  'view_story': 'Visualizações de Stories'
};

export function StatsTab({ ownerId, mostViewedProperties, user }: StatsTabProps) {
  const [stats, setStats] = useState<EventStatsResult | null>(null);
  const [boostedProperties, setBoostedProperties] = useState<BoostedProperty[]>([]);
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useState(30);
  const [activeSubTab, setActiveSubTab] = useState<'performance' | 'boosts' | 'popular'>('performance');
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  const fetchStats = React.useCallback(() => {
    startTransition(async () => {
      try {
        const [statsData, boostedData] = await Promise.all([
          getEventStats(ownerId, period),
          getBoostedProperties(ownerId)
        ]);
        setStats(statsData);
        setBoostedProperties(boostedData);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        toast.error('Erro ao atualizar métricas.');
      }
    });
  }, [ownerId, period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchStats();
    toast.success('Métricas atualizadas!');
  };

  const chartData = useMemo(() => {
    if (!stats) return [];
    const colors = ['#820AD1', '#FF6B00', '#9333ea', '#f97316', '#c084fc', '#fdba74'];
    return Object.entries(stats.summary)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value], index) => ({
        name: EVENT_LABEL_MAP[name] || name.replace('share_', '').replace('view_', '').replace('click_', '').replace('_', ' '),
        value,
        color: colors[index % colors.length]
      }));
  }, [stats]);

  const hasStats = stats && stats.total > 0;
  const viewsData = mostViewedProperties || { total_views_all: 0, properties: [] };
  const hasPopularProperties = viewsData.properties.length > 0;
  const activeBoosted = boostedProperties.filter(p => p.boost_status === 'active');
  const pendingBoosted = boostedProperties.filter(p => p.boost_status === 'pending');

  if (!hasStats && !hasPopularProperties && boostedProperties.length === 0 && isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-3" />
        <p className="text-gray-400 text-sm font-medium">Sincronizando painel...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Header Consolidado Padronizado rounded-md */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
           <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-purple-600" />
                 Analytics & Performance
              </h2>
              <p className="text-xs text-gray-500">Dados integrados de tráfego e visibilidade.</p>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex bg-gray-100/50 p-1 rounded-md border border-gray-100/50">
                 {[7, 30, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setPeriod(d)}
                      className={cn(
                        "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all",
                        period === d ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {d} DIAS
                    </button>
                 ))}
              </div>
              <button onClick={handleRefresh} disabled={isPending} className="p-2.5 bg-white hover:bg-gray-50 rounded-md border border-gray-100 text-gray-400 transition-all shadow-sm">
                 <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
              </button>
           </div>
        </div>

        {/* Sub-Tabs Selector Padronizado rounded-md */}
        <div className="flex items-center p-1 bg-gray-100/50 rounded-md w-fit mb-4">
            <button
                onClick={() => setActiveSubTab('performance')}
                className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-bold transition-all",
                    activeSubTab === 'performance' ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <LayoutDashboard className="w-4 h-4" />
                Desempenho
            </button>
            <button
                onClick={() => setActiveSubTab('boosts')}
                className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-bold transition-all relative",
                    activeSubTab === 'boosts' ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <Rocket className="w-4 h-4" />
                Destaques
                {activeBoosted.length > 0 && (
                   <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                      {activeBoosted.length}
                   </span>
                )}
            </button>
            <button
                onClick={() => setActiveSubTab('popular')}
                className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-bold transition-all",
                    activeSubTab === 'popular' ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
            >
                <Trophy className="w-4 h-4" />
                Ranking
            </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* TAB: PERFORMANCE */}
            {activeSubTab === 'performance' && (
              <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {hasStats ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       <MetricCard label="Interações" value={stats.total} icon={Eye} color="purple" description="Eventos totais." />
                       <MetricCard label="Contactos" value={stats.total_contacts} icon={MessageCircle} color="green" description="Novas conversas." />
                       <MetricCard label="Partilhas" value={stats.total_shares} icon={Share2} color="orange" description="Conteúdo social." />
                       <MetricCard label="Conversão" value={`${Math.round((stats.total_contacts / stats.total) * 100)}%`} icon={Target} color="blue" description="Eficiência de cliques." />
                    </div>

                    <div className="grid lg:grid-cols-12 gap-6">
                       <div className="lg:col-span-7 bg-white rounded-md border border-gray-100 shadow-sm p-6">
                          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
                             <TrendingUp className="w-4 h-4 text-purple-600" />
                             Canais de Atração
                          </h3>
                          <div className="space-y-1">
                             {Object.entries(stats.summary).sort(([, a], [, b]) => b - a).slice(0, 8).map(([type, count]) => (
                                <ActionRow key={type} type={type} count={count} total={stats.total} />
                             ))}
                          </div>
                       </div>

                       <div className="lg:col-span-5 bg-white rounded-md border border-gray-100 shadow-sm p-6 flex flex-col items-center">
                          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6 self-start">
                             <PieChartIcon className="w-4 h-4 text-orange-500" />
                             Mix de Tráfego
                          </h3>
                          <div className="relative w-full h-48">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                   <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                   </Pie>
                                   <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                                </PieChart>
                             </ResponsiveContainer>
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Total</p>
                                <p className="text-xl font-black text-gray-900 leading-none mt-1">{stats.total}</p>
                             </div>
                          </div>
                          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 w-full">
                             {chartData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                   <span className="text-[10px] font-bold text-gray-500 uppercase truncate tracking-wider">{item.name}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </>
                ) : (
                  <EmptyStatsMessage />
                )}
              </motion.div>
            )}

            {/* TAB: BOOSTS */}
            {activeSubTab === 'boosts' && (
              <motion.div key="boosts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                {boostedProperties.length > 0 ? (
                  <>
                    {activeBoosted.length > 0 && (
                      <div className="space-y-6">
                         <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-600 animate-pulse" />
                            Destaques Ativos
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeBoosted.map((property) => (
                               <BoostedPropertyCard key={property.id} property={property} user={user} />
                            ))}
                         </div>
                      </div>
                    )}

                    {pendingBoosted.length > 0 && (
                      <div className="space-y-6">
                         <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            Aguardando Aprovação
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingBoosted.map((property) => (
                               <BoostedPropertyCard key={property.id} property={property} user={user} />
                            ))}
                         </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-md border border-gray-100 p-12 text-center shadow-sm">
                    <Rocket className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Sem imóveis impulsionados</h3>
                    <p className="text-gray-500 text-xs max-w-sm mx-auto mb-8">Destaque os seus anúncios para aparecerem no topo das pesquisas.</p>
                    <button className="px-8 py-3 bg-purple-600 text-white rounded-md font-bold text-xs shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
                       Impulsionar Agora
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: POPULAR */}
            {activeSubTab === 'popular' && (
              <motion.div key="popular" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {hasPopularProperties ? (
                  <div className="bg-white rounded-md border border-gray-100 shadow-sm p-8">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-orange-500" />
                              Performance por Imóvel
                           </h3>
                           <p className="text-xs text-gray-500">Ranking dos anúncios com maior tráfego orgânico.</p>
                        </div>
                        <div className="bg-purple-50 px-4 py-2 rounded-md border border-purple-100 flex flex-col items-center">
                           <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Total</p>
                           <p className="text-lg font-black text-purple-700">{viewsData.total_views_all.toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {viewsData.properties.map((property) => (
                           <div key={property.id} className="relative group">
                              <div className="scale-95 group-hover:scale-100 transition-transform duration-500">
                                 <PropertyCard property={property} />
                              </div>
                              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-md text-[10px] font-black shadow-xl flex items-center gap-1.5 border border-white z-10">
                                 <Eye className="w-3 h-3 text-purple-600" />
                                 <span>{property.total_views}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-md border border-gray-100 p-12 text-center shadow-sm">
                    <Trophy className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-400 italic text-sm">Ranking ainda não disponível.</p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Insight Card Padronizado rounded-md */}
        <div className="bg-purple-600 rounded-md p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-lg shadow-purple-900/10">
           <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-10">
              <Zap className="w-32 h-32" />
           </div>
           <div className="relative z-10 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                 <Rocket className="w-4 h-4 text-orange-400" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-purple-100">Dica Performance</span>
              </div>
              <h4 className="text-lg font-bold">Aumente o Alcance dos Seus Imóveis</h4>
              <p className="text-sm text-purple-100 max-w-2xl leading-relaxed">
                 Anúncios completos recebem até <span className="font-bold text-white">3x mais contactos</span> diretos.
              </p>
           </div>
           <button 
              onClick={() => setIsTipsModalOpen(true)}
              className="relative z-10 px-8 py-3 bg-white text-purple-700 rounded-md font-bold text-xs shadow-xl hover:bg-gray-50 transition-all"
           >
              Ver Guia
           </button>
        </div>

        <PerformanceTipsModal 
           isOpen={isTipsModalOpen} 
           onClose={() => setIsTipsModalOpen(false)} 
        />

      </div>
    </ErrorBoundary>
  );
}

function MetricCard({ label, value, icon: Icon, color, description }: { label: string, value: string | number, icon: any, color: string, description: string }) {
  const colors = {
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    green: "text-green-600 bg-green-50 border-green-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
  };

  return (
    <div className="bg-white rounded-md p-5 border border-gray-100 shadow-sm hover:border-purple-200 transition-all group flex flex-col">
       <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2.5 rounded-md flex items-center justify-center transition-transform group-hover:scale-110", colors[color as keyof typeof colors])}>
             <Icon className="w-4 h-4" />
          </div>
          <div className="group/help relative">
             <HelpCircle className="w-3.5 h-3.5 text-gray-200 cursor-help hover:text-gray-400 transition-colors" />
             <div className="absolute right-0 bottom-full mb-3 w-56 p-4 bg-gray-900 text-white text-[10px] rounded-md opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-20 shadow-2xl leading-relaxed">
                {description}
             </div>
          </div>
       </div>
       <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{value}</p>
       </div>
    </div>
  );
}

function ActionRow({ type, count, total }: { type: string, count: number, total: number }) {
  const percentage = (count / total) * 100;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors group">
       <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
             <span className="text-xs font-bold text-gray-700">{EVENT_LABEL_MAP[type] || type.replace('_', ' ')}</span>
             <span className="text-xs font-black text-gray-900">{count} <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">vezes</span></span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
             <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-purple-600 rounded-full" transition={{ duration: 1 }} />
          </div>
       </div>
    </div>
  );
}

function EmptyStatsMessage() {
  return (
    <div className="bg-white p-16 rounded-md border border-gray-100 text-center shadow-sm">
       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-gray-200" />
       </div>
       <h3 className="text-base font-bold text-gray-900">Nenhum dado capturado</h3>
       <p className="text-xs text-gray-400 font-medium italic mt-2">Aguardando as primeiras interações.</p>
    </div>
  );
}
