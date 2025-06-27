'use client'

import { Session } from "@supabase/supabase-js";
import { BarChart3, Eye, Heart, Home, Package, Search, Settings, Star, Upload, User } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

interface DashboardProps {
  session: Session
  profile: { first_name?: string; last_name?: string; avatar_url?: string; role?: string } | null
}

export default function Dashboard({ session, profile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('properties')

  const stats = [
    { label: 'Propriedades', value: '15', icon: Home },
    { label: 'Favoritas', value: '8', icon: Heart },
    { label: 'Pesquisas', value: '32', icon: Search },
    { label: 'Visualizações', value: '847', icon: Eye },
  ]

  const menuItems = [
    { id: 'properties', label: 'Minhas Propriedades', icon: Home, badge: '15' },
    { id: 'favorites', label: 'Favoritas', icon: Heart, badge: '8' },
    { id: 'searches', label: 'Pesquisas Salvas', icon: Search, badge: '32' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'Pro' },
    { id: 'add', label: 'Nova Propriedade', icon: Upload }
  ]

  const packageInfo = [
    { label: 'Plano', value: profile?.role ?? '—', icon: Package, color: 'text-yellow-500' },
    { label: 'Listagens', value: '50', icon: Home, color: 'text-green-500' },
    { label: 'Restante', value: '35', icon: Eye, color: 'text-blue-500' },
    { label: 'Destaques', value: '10', icon: Star, color: 'text-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6 shadow-md">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Bem-vindo, {profile?.first_name ?? session.user.email}
              </CardTitle>
              <CardDescription className="text-gray-500">
                Gerencie suas propriedades com elegância
              </CardDescription>
            </div>
            <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
              <Upload className="w-4 h-4 mr-2" />
              Enviar Propriedade
            </button>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-md">
              <CardHeader className="text-center pb-2">
                <div className="relative inline-block">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 mx-auto rounded-full object-cover ring-4 ring-purple-500/50"
                    />
                  ) : (
                    <div className="w-24 h-24 mx-auto rounded-full bg-purple-700 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-purple-500/50">
                        {(() => {
                            const fn = profile?.first_name
                            const ln = profile?.last_name
                            if (fn && ln) {
                            return (
                                fn[0]?.toUpperCase() +
                                ln[0]?.toUpperCase()
                            )
                            }
                            return (
                            fn?.[0]?.toUpperCase() ??
                            session.user.email?.[0]?.toUpperCase() ??
                            ''
                            )
                        })()}
                        </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <CardTitle className="text-xl text-gray-800 mt-4">
                  {profile?.first_name ?? session.user.email}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  {profile?.role ?? 'Usuário'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="p-4 bg-purple-100 rounded-xl flex items-center justify-between border border-purple-200">
                      <div>
                        <div className="text-2xl font-bold text-purple-700">{stat.value}</div>
                        <div className="text-xs text-purple-600">{stat.label}</div>
                      </div>
                      <stat.icon className="w-6 h-6 text-purple-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-700" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                {menuItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gray-100 ${
                      activeTab === item.id ? 'bg-orange-100 border border-orange-300' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-5 h-5 text-purple-700" />
                      <span className="text-gray-800">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-700" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {packageInfo.map((info, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <info.icon className={`w-4 h-4 ${info.color}`} />
                      <span className="text-gray-600">{info.label}</span>
                    </div>
                    <span className="text-gray-800 font-semibold">{info.value}</span>
                  </div>
                ))}
                <button className="w-full mt-4 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">
                  <Star className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center text-gray-800">
                  <Settings className="w-6 h-6 mr-3 text-purple-700" />
                  Configurações da Conta
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Gerencie suas informações pessoais e profissionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Primeiro Nome', 'Último Nome', 'Email', 'Telefone', 'Empresa', 'Licença', 'Website', 'Facebook', 'LinkedIn', 'Instagram', 'YouTube'].map(label => (
                      <div key={label}>
                        <label className="block text-sm font-medium text-gray-700">{label}</label>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500" />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Sobre Mim</label>
                      <textarea rows={4} className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 p-2 focus:border-purple-500 focus:ring-purple-500" />
                    </div>
                  </div>
                  <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800">
                    Atualizar Perfil
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
