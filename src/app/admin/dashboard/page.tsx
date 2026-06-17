'use client'

import React, { useEffect, useState } from 'react';
import { 
  Home, 
  Users, 
  Building2, 
  BarChart3, 
  MessageCircle, 
  Settings, 
  Bell, 
  Search, 
  Menu,
  X,
  Sun,
  Moon,
  Mail,
  Award,
  Medal,
  Rocket,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { RenderProperties } from '@/app/admin/components/properties-component';
import UserManagement from '@/app/admin/components/users-component';
import { RenderDashboard } from '@/app/admin/components/dashboard-component';
import SubscricoesPage from '@/app/admin/components/subscriptions-component';
import AgentSubscriptionsPage from '@/app/admin/components/agent-subscription-component';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import PropertiesToBoost from '@/app/admin/components/properties-to-boost';
import BoostManagement from '@/app/admin/components/properties-to-boost';
import ImobiliariasManagement from '@/app/admin/components/imobiliarias-component';
import { MessagesSection } from '@/app/admin/components/messages-section';
import { SettingsSection } from '@/app/admin/components/settings-section';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';

const supabase = createClient();

type ChartItem = {
  name: string
  value: number
  color: string
}

const KerHomeDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  //Dados reais para os gráficos - Com tratamento de erros apropriado
const activeProperties = useQuery({
  queryKey: ['active-properties'],
  queryFn: async() => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq("aprovement_status", 'approved')

    if (error) {
      console.error('Erro ao buscar propriedades ativas:', error);
      throw error;
    }
    return data || [];
  },
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 10 * 60 * 1000,
  retry: 2,
})

const registeredUsers = useQuery({
  queryKey: ['registered-users'],
  queryFn: async() => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    if (error) {
      console.error('Erro ao buscar usuários registrados:', error);
      throw error;
    }
    return data || [];
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 2,
})

const agentUsers = useQuery({
  queryKey: ['agent-users'],
  queryFn: async() => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'agent')

    if (error) {
      console.error('Erro ao buscar agentes:', error);
      throw error;
    }
    return data || [];
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 2,
})

  const { data, isLoading, error } = useQuery({
    queryKey: ["property-type"],
    queryFn: async () => {
      const response = await supabase
        .from("properties")
        .select("tipo")
        .eq("aprovement_status", "approved")

      if (response.error) throw response.error
      return response.data
    },
  })

  useEffect(() => {
    if (data) {
      // Agrupar por tipo
      const counts: Record<string, number> = {}
      data.forEach((item) => {
        const tipo = item.tipo?.trim().toLowerCase() // normaliza
        if (!tipo) return
        counts[tipo] = (counts[tipo] || 0) + 1
      })

      // Converter para o formato do gráfico
      const mapped = Object.entries(counts).map(([tipo, value]) => ({
        name: tipo.charAt(0).toUpperCase() + tipo.slice(1), // Capitaliza
        value,
        color:
          tipo === "apartamento"
            ? "#8B5CF6"
            : tipo === "casa"
            ? "#F59E0B"
            : tipo === "terreno"
            ? "#10B981"
            : "#EF4444",
      }))

      setChartData(mapped)
    }
  }, [data])


  const sidebarItems = [
    { id: 'home', label: 'Pagina Inicial', icon: Home , href: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '#' },
    { id: 'properties', label: 'Imóveis', icon: Building2, href: '#' },
    { id: 'users', label: 'Utilizadores', icon: Users, href: '#' },
    { id: 'imobiliarias', label: 'Imobiliárias', icon: Store, href: '#' },
    { id: 'subscriptions', label: 'Subscrições de Planos', icon: Award, href: '#' },
    { id: 'subscriptions2', label: 'Subscrições de Agentes', icon: Medal, href: '#' },
    { id: 'subscriptions3', label: 'Propriedades Destacadas', icon: Rocket, href: '#' },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle, href: '#' },
    { id: 'settings', label: 'Configurações', icon: Settings, href: '#' }
  ];



  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard': return <RenderDashboard 
        activeProperties={activeProperties.data?.length} 
        registeredUsers={registeredUsers.data?.length} 
        agentUsers={agentUsers.data?.length}
        propertyTypeData={chartData}
        darkMode={darkMode}/>;
      case 'properties': return  <RenderProperties darkMode={darkMode}/>;
      case 'users': return <UserManagement darkMode={darkMode}/>;
      case 'imobiliarias': return <ImobiliariasManagement darkMode={darkMode} />;
      case 'subscriptions': return <SubscricoesPage />;
      case 'subscriptions2': return <AgentSubscriptionsPage />
      case 'subscriptions3': return <BoostManagement darkMode={darkMode} />
      case 'messages': return <MessagesSection darkMode={darkMode} />;
      case 'settings': return <SettingsSection darkMode={darkMode} setDarkMode={setDarkMode} />;
      default: return <RenderDashboard darkMode={darkMode}/>;
    }
  };


  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className={`h-full px-3 py-4 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
          {/* Logo */}
          <div className="flex items-center mb-8 px-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-lg flex items-center justify-center mr-3">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>KerHome</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg'
                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
                    }`}
                >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                </Link>
                );
            })}
            </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-0'} transition-all duration-300 flex flex-col h-screen`}>
        {/* Header */}
        <header className={`sticky top-0 z-40 px-4 lg:px-6 py-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg lg:hidden ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              {/* Search */}
              <div className="relative ml-4">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              {currentUser ? (
                <NotificationsPanel userId={currentUser.id} />
              ) : (
                <div className="relative">
                  <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <Bell className="w-5 h-5 animate-pulse" />
                  </button>
                </div>
              )}

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AD</span>
                </div>
                <div className="hidden lg:block">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>admin@kerhome.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default KerHomeDashboard;
