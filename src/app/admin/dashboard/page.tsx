'use client'

import React, { useState } from 'react';
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
  Subscript,
  AwardIcon,
  Award,
  Medal,
} from 'lucide-react';
import Link from 'next/link';
import { RenderProperties } from '../components/properties-component';
import UserManagement from '../components/users-component';
import { RenderDashboard } from '../components/dashboard-component';
import SubscricoesPage from '../components/subscriptions-component';
import AgentSubscriptionsPage from '../components/agent-subscription-component';

const KerHomeDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarItems = [
    { id: 'home', label: 'Pagina Inicial', icon: Home , href: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '#' },
    { id: 'properties', label: 'Imóveis', icon: Building2, href: '#' },
    { id: 'users', label: 'Utilizadores', icon: Users, href: '#' },
    { id: 'subscriptions', label: 'Subscrições de Planos', icon: Award, href: '#' },
    { id: 'subscriptions2', label: 'Subscrições de Agentes', icon: Medal, href: '#' },
    { id: 'messages', label: 'Mensagens', icon: MessageCircle, href: '#' },
    { id: 'settings', label: 'Configurações', icon: Settings, href: '#' }
  ];



  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Centro de Mensagens</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <Mail className="w-4 h-4 mr-2" />
          Nova Mensagem
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Caixa de Entrada</h3>
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className={`p-3 rounded-lg border cursor-pointer hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>João Silva</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Dúvida sobre imóvel...</p>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>2h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`border-b pb-4 mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Conversa com João Silva</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Última mensagem há 2 horas</p>
          </div>
          
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            <div className="flex justify-start">
              <div className={`max-w-xs p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Olá! Tenho interesse no apartamento T3 em Luanda Sul. Podem agendar uma visita?</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>14:30</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="max-w-xs p-3 rounded-lg bg-purple-600 text-white">
                <p className="text-sm">Claro! Vamos verificar a disponibilidade do agente responsável e entramos em contacto consigo.</p>
                <p className="text-xs mt-1 text-purple-200">14:35</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Configurações</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Preferências Gerais</h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Idioma</label>
              <select className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Moeda</label>
              <select className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                <option value="aoa">Kwanza (Kz)</option>
                <option value="usd">Dólar ($)</option>
                <option value="eur">Euro (€)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Modo Escuro</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notificações</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Novos imóveis</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mensagens</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Denúncias</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Relatórios semanais</span>
              <input type="checkbox" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
            </div>
          </div>
        </div>

        <div className={`lg:col-span-2 p-6 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Gestão de Permissões</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Ana Costa', role: 'Super Admin', email: 'ana@kerhome.com', status: 'active' },
              { name: 'Carlos Silva', role: 'Moderador', email: 'carlos@kerhome.com', status: 'active' },
              { name: 'Sofia Lima', role: 'Suporte', email: 'sofia@kerhome.com', status: 'inactive' }
            ].map((admin, index) => (
              <div key={index} className={`p-4 border rounded-lg ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{admin.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {admin.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{admin.email}</p>
                <p className={`text-sm font-medium mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{admin.role}</p>
                <div className="mt-3 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard': return <RenderDashboard darkMode={darkMode}/>;
      case 'properties': return  <RenderProperties darkMode={darkMode}/>;
      case 'users': return <UserManagement darkMode={darkMode}/>;
      case 'subscriptions': return <SubscricoesPage />;
      case 'subscriptions2': return <AgentSubscriptionsPage />
      case 'messages': return renderMessages();
      case 'settings': return renderSettings();
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
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-0'} transition-all duration-300`}>
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
              <div className="relative">
                <button className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
              </div>

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
        <main className="p-4 lg:p-6">
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