'use client'

import { 
  ArrowLeft, Mail, Phone, Building, Globe, Facebook, Linkedin, 
  Instagram, Youtube, Camera, Edit3, Shield, Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  primeiro_nome: string;
  ultimo_nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  sobre_mim?: string;
  role: 'Agente' | 'Administrador' | null;
  status: 'active' | 'inactive' | null;
  licenca?: string;
  created_at: string;
};

export function UserProfile({ user }: { user: User }) {
  const router = useRouter();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const socialLinks = [
    { key: 'website', url: user.website, icon: Globe, label: user.website?.replace(/^https?:\/\//, '') },
    { key: 'facebook', url: user.facebook, icon: Facebook, label: 'Facebook' },
    { key: 'linkedin', url: user.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { key: 'instagram', url: user.instagram, icon: Instagram, label: 'Instagram' },
    { key: 'youtube', url: user.youtube, icon: Youtube, label: 'YouTube' },
  ].filter(link => link.url);

  // Estatísticas
  const totalFields = Object.keys(user).length;
  const filledFields = Object.values(user).filter(v => v !== null && v !== undefined && v !== '').length;
  const profileCompletion = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950/20">
      <div className="max-w-5xl mx-auto p-6">
        {/* Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8 hover:bg-white/70 dark:hover:bg-gray-800/70 backdrop-blur-sm border border-white/20 shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Profile Card */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          
          {/* Header with Cover */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 dark:from-orange-600 dark:via-orange-700 dark:to-amber-600 relative overflow-hidden">
              
              {/* Background Pattern (SVG corrigido) */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%20fill%3D%22white%22%20fill-opacity%3D%220.1%22/%3E%3C/svg%3E')] opacity-30"></div>
              
              {/* Profile Avatar */}
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-3xl font-bold text-orange-600 dark:text-orange-400 shadow-2xl ring-4 ring-white dark:ring-gray-800 transition-all duration-300 hover:scale-105">
                    {getInitials(user.primeiro_nome, user.ultimo_nome)}
                  </div>
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Badges */}
              <div className="absolute top-6 right-6 flex gap-2">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border ${
                  user.status === 'active' 
                    ? 'bg-green-500/90 text-white border-green-400/30' 
                    : 'bg-red-500/90 text-white border-red-400/30'
                }`}>
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>

            {/* Profile Info Header */}
            <div className="pt-20 pb-8 px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {user.primeiro_nome} {user.ultimo_nome}
                  </h1>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                      user.role === 'Agente' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                      user.role === 'Administrador' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      <Shield className="w-4 h-4 mr-2" />
                      {user.role || 'Sem função'}
                    </span>
                    
                    <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild variant="outline" size="lg" className="hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-950/50">
                    <Link href={`/users/${user.id}/edit`}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Link>
                  </Button>
                  <Button variant="destructive" size="lg" className="hover:bg-red-600">
                    Desativar Conta
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sobre */}
              {user.sobre_mim && (
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                    <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                    Sobre
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {user.sobre_mim}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                  <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                  Informações de Contato
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Mail className="w-5 h-5 mr-3 text-orange-500" />
                    {user.email}
                  </div>
                  {user.telefone && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Phone className="w-5 h-5 mr-3 text-orange-500" />
                      {user.telefone}
                    </div>
                  )}
                  {user.empresa && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Building className="w-5 h-5 mr-3 text-orange-500" />
                      {user.empresa}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                    <div className="w-2 h-6 bg-orange-500 rounded-full mr-3"></div>
                    Redes Sociais
                  </h2>
                  
                  <div className="space-y-3">
                    {socialLinks.map(({ key, url, icon: Icon, label }) => (
                      <Link 
                        key={key}
                        href={url!} 
                        target="_blank" 
                        className="flex items-center p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg flex items-center justify-center mr-4">
                          <Icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {label}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30">
                <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-4">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-700 dark:text-orange-300">Perfil Completo</span>
                    <span className="font-bold text-orange-900 dark:text-orange-100">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}
