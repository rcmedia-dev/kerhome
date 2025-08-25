'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Mail, Phone, Building, FileText, Globe, 
  Facebook, Linkedin, Instagram, Youtube, Save, 
  X, Check, AlertCircle, Crown, TrendingUp,
  Calendar, Shield, Zap, ArrowLeft, Key, Ban, 
  CheckCircle, Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { getUserProfile } from '@/lib/actions/supabase-actions/get-user-profile';
import { updateUserProfile } from '@/lib/actions/supabase-actions/update-user-profile';
import { updateUserPassword } from '@/lib/actions/supabase-actions/admin-update-user-password';

// Tipos TypeScript
interface PlanoAgente {
  id: string;
  nome: string;
  limite: number;
  restante: number;
  destaques: boolean;
  destaques_permitidos: number;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id?: string;
  email?: string;
  primeiro_nome?: string;
  ultimo_nome?: string;
  username?: string;
  telefone?: string;
  empresa?: string;
  licenca?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  sobre_mim?: string;
  ativo?: boolean;
  pacote_agente?: string;
  role?: string;
}

interface AdminUserEditInterfaceProps {
  params: {
    id: string;
  };
}

// Componente InputField com React Hook Form
const InputField = React.memo(({ 
  label, 
  type = 'text', 
  icon: Icon, 
  placeholder, 
  disabled = false,
  rows,
  required = false,
  error,
  field,
  register,
  ...rest
}: {
  label: string;
  type?: string;
  icon?: React.ElementType;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  required?: boolean;
  error?: any;
  field: string;
  register: any;
}) => {
  return (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-gray-600" />}
        {label}
        {required && <span className="text-red-500 text-lg">*</span>}
      </label>
      <div className="relative">
        {rows ? (
          <textarea
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none ${
              disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'
            } ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
            {...register(field)}
            {...rest}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
              disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'
            } ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'}`}
            {...register(field)}
            {...rest}
          />
        )}
        {disabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Shield size={18} className="text-gray-400" />
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm font-medium">
          <AlertCircle size={16} />
          {error.message}
        </div>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default function AdminUserEditInterface(props: { params: Promise<{ id: string }>}) {
  const { id } = React.use(props.params)
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('pessoal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<UserProfile>({
    defaultValues: {
      primeiro_nome: '',
      ultimo_nome: '',
      email: '',
      username: '',
      telefone: '',
      empresa: '',
      licenca: '',
      website: '',
      facebook: '',
      linkedin: '',
      instagram: '',
      youtube: '',
      sobre_mim: '',
      role: 'Agente'
    }
  });

  // Watch form values
  const formValues = watch();

  // Função para voltar à página anterior
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userData = await getUserProfile(id);
        
        // Preencher o formulário com os dados do usuário
        if (userData) {
          Object.entries(userData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              setValue(key as keyof UserProfile, value);
            }
          });
        }
      } catch (error) {
        setToastMessage({ 
          title: 'Erro', 
          message: 'Falha ao carregar dados do usuário' 
        });
        setShowToast(true);
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
        setTimeout(() => setShowToast(false), 4000);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id, setValue]);

  // Função de submit do formulário
  const onSubmit = async (data: UserProfile) => {
    setIsSubmitting(true);
    
    try {
      const success = await updateUserProfile({
        userId: id,
        profileData: data
      });
      
      if (success) {
        setToastMessage({ 
          title: 'Sucesso', 
          message: 'Perfil atualizado com sucesso' 
        });
      } else {
        throw new Error('Falha ao atualizar perfil');
      }
    } catch (error) {
      setToastMessage({ 
        title: 'Erro', 
        message: error instanceof Error ? error.message : 'Falha ao atualizar perfil' 
      });
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsSubmitting(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const handlePasswordChange = useCallback(async () => {
  if (passwordData.novaSenha !== passwordData.confirmarSenha) {
    setToastMessage({
      title: 'Erro',
      message: 'As senhas não coincidem'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
    return;
  }

  if (passwordData.novaSenha.length < 6) {
    setToastMessage({
      title: 'Erro',
      message: 'A senha deve ter pelo menos 6 caracteres'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
    return;
  }

  setIsSubmitting(true);

  const result = await updateUserPassword(id, passwordData.novaSenha); // <-- use o ID do usuário aqui

  setIsSubmitting(false);

  if (result.success) {
    setShowPasswordModal(false);
    setPasswordData({ novaSenha: '', confirmarSenha: '' });
    setToastMessage({
      title: 'Sucesso',
      message: 'Senha alterada com sucesso'
    });
  } else {
    setToastMessage({
      title: 'Erro',
      message: result.error || 'Erro ao atualizar senha'
    });
  }

  setShowToast(true);
  setTimeout(() => setShowToast(false), 4000);
  }, [passwordData, id]);


  const sections = [
    { id: 'pessoal', name: 'Pessoal', icon: User, color: 'blue' },
    { id: 'profissional', name: 'Profissional', icon: Building, color: 'green' },
    { id: 'social', name: 'Redes Sociais', icon: Globe, color: 'purple' },
    { id: 'sobre', name: 'Sobre Mim', icon: FileText, color: 'orange' },
    { id: 'role', name: 'Administrativo', icon: Shield, color: 'red' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Carregando dados do usuário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Toast de Notificação */}
      {showToast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          toastMessage.title === 'Sucesso' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
        }`}>
          <div className="bg-white/20 rounded-full p-1">
            {toastMessage.title === 'Sucesso' ? <Check size={20} /> : <AlertCircle size={20} />}
          </div>
          <div>
            <div className="font-bold">{toastMessage.title}</div>
            <div className="text-sm opacity-90">{toastMessage.message}</div>
          </div>
        </div>
      )}

      {/* Modal de Alteração de Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 rounded-2xl p-3">
                <Lock size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Alterar Senha</h3>
                <p className="text-gray-600">Defina uma nova senha para este usuário</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <input
                  type="password"
                  value={passwordData.novaSenha}
                  onChange={(e) => setPasswordData({...passwordData, novaSenha: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  value={passwordData.confirmarSenha}
                  onChange={(e) => setPasswordData({...passwordData, confirmarSenha: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                  placeholder="Confirme a nova senha"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Alterando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Administrativo */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleBack}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-3 transition-all duration-300"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Editar Usuário</h1>
                  <p className="text-white/80 text-lg">Gerenciamento de conta de usuário</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
                <Shield size={20} className="text-yellow-300" />
                <span className="font-semibold">Modo Administrador</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <div className="bg-white/20 rounded-full p-2">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-semibold">{formValues.primeiro_nome} {formValues.ultimo_nome}</div>
                  <div className="text-sm opacity-90">{formValues.email}</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${formValues.ativo ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                <CheckCircle size={16} /> 
                <span className="text-sm font-medium">Ativo</span>
              </div>
              
              <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-blue-500/30">
                <Key size={16} />
                <span className="text-sm font-medium">{formValues.role }</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seções</h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          activeSection === section.id
                            ? `bg-${section.color}-50 text-${section.color}-700 border-2 border-${section.color}-200`
                            : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{section.name}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Informações do Usuário */}
                <div className="mt-8 bg-gray-50 rounded-2xl p-6">                  
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl border-2 border-blue-100 hover:bg-blue-100 transition-all duration-300"
                  >
                    <Lock size={16} />
                    Alterar Senha
                  </button>
                </div>

                {/* Plan Card */}
                {formValues.pacote_agente && (
                  <div className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown size={20} className="text-yellow-300" />
                      <h3 className="font-bold text-lg">Professional</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm opacity-90">Uso do Plano</span>
                          <span className="font-bold">28%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `28%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm mt-2 opacity-90">
                          <span>30 restante</span>
                          <span>30 total</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                          <Zap size={20} className="mx-auto mb-1 text-yellow-300" />
                          <div className="text-sm opacity-90">Destaques</div>
                          <div className="font-bold">2</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                          <TrendingUp size={20} className="mx-auto mb-1 text-green-300" />
                          <div className="text-sm opacity-90">Status</div>
                          <div className="font-bold text-xs">ATIVO</div>
                        </div>
                      </div>

                      <div className="text-xs opacity-75 text-center pt-3 border-t border-white/20">
                        <Calendar size={12} className="inline mr-1" />
                        Atualizado em 22 de Maio, 2025
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                
                {/* Informações Pessoais */}
                {activeSection === 'pessoal' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-blue-100 rounded-2xl p-3">
                        <User size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Informações Pessoais</h2>
                        <p className="text-gray-600">Dados básicos e informações de contato</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputField
                        label="Nome"
                        field="primeiro_nome"
                        register={register}
                        icon={User}
                        placeholder="Digite o nome"
                        required={true}
                        error={errors.primeiro_nome}
                      />
                      <InputField
                        label="Sobrenome"
                        field="ultimo_nome"
                        register={register}
                        icon={User}
                        placeholder="Digite o sobrenome"
                        required={true}
                        error={errors.ultimo_nome}
                      />
                      <InputField
                        label="Email"
                        field="email"
                        register={register}
                        type="email"
                        icon={Mail}
                        disabled={true}
                        error={errors.email}
                      />
                      <InputField
                        label="Username"
                        field="username"
                        register={register}
                        icon={User}
                        placeholder="@username"
                        error={errors.username}
                      />
                      <div className="md:col-span-2">
                        <InputField
                          label="Telefone"
                          field="telefone"
                          register={register}
                          type="tel"
                          icon={Phone}
                          placeholder="+244 xxx xxx xxx"
                          error={errors.telefone}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações Profissionais */}
                {activeSection === 'profissional' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-green-100 rounded-2xl p-3">
                        <Building size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Informações Profissionais</h2>
                        <p className="text-gray-600">Detalhes sobre carreira e empresa</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputField
                        label="Empresa"
                        field="empresa"
                        register={register}
                        icon={Building}
                        placeholder="Nome da empresa"
                        error={errors.empresa}
                      />
                      <InputField
                        label="Licença"
                        field="licenca"
                        register={register}
                        icon={FileText}
                        placeholder="Número da licença profissional"
                        error={errors.licenca}
                      />
                      <div className="md:col-span-2">
                        <InputField
                          label="Website"
                          field="website"
                          register={register}
                          type="url"
                          icon={Globe}
                          placeholder="https://site.com"
                          error={errors.website}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Redes Sociais */}
                {activeSection === 'social' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-purple-100 rounded-2xl p-3">
                        <Globe size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Redes Sociais</h2>
                        <p className="text-gray-600">Redes sociais conectadas ao perfil</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputField
                        label="Facebook"
                        field="facebook"
                        register={register}
                        icon={Facebook}
                        placeholder="usuario.facebook"
                        error={errors.facebook}
                      />
                      <InputField
                        label="LinkedIn"
                        field="linkedin"
                        register={register}
                        icon={Linkedin}
                        placeholder="usuario-linkedin"
                        error={errors.linkedin}
                      />
                      <InputField
                        label="Instagram"
                        field="instagram"
                        register={register}
                        icon={Instagram}
                        placeholder="@usuario"
                        error={errors.instagram}
                      />
                      <InputField
                        label="YouTube"
                        field="youtube"
                        register={register}
                        icon={Youtube}
                        placeholder="NomeDoCanal"
                        error={errors.youtube}
                      />
                    </div>
                  </div>
                )}

                {/* Sobre Mim */}
                {activeSection === 'sobre' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-orange-100 rounded-2xl p-3">
                        <FileText size={24} className="text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Sobre Mim</h2>
                        <p className="text-gray-600">Descrição pessoal e profissional</p>
                      </div>
                    </div>
                    
                    <InputField
                      label="Descrição"
                      field="sobre_mim"
                      register={register}
                      rows={6}
                      placeholder="Experiência, habilidades, interesses..."
                      error={errors.sobre_mim}
                    />
                  </div>
                )}

                {/* Seção Administrativa */}
                {activeSection === 'role' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-red-100 rounded-2xl p-3">
                        <Shield size={24} className="text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Configurações Administrativas</h2>
                        <p className="text-gray-600">Configurações de acesso и status do usuário</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <Key size={16} className="text-gray-600" />
                          Tipo de Usuário
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setValue('role', 'Agente')}
                            className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 flex-1 flex items-center justify-center gap-2
                              ${
                                formValues.role === 'Agente'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                              }
                              active:scale-95 focus:outline-none`}
                          >
                            <User size={18} />
                            Agente
                          </button>

                          <button
                            type="button"
                            onClick={() => setValue('role', 'Admin')}
                            className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 flex-1 flex items-center justify-center gap-2
                              ${
                                formValues.role === 'Admin'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                              }
                              active:scale-95 focus:outline-none`}
                          >
                            <Shield size={18} />
                            Administrador
                          </button>
                        </div>

                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-700">
                          <span className="font-semibold">Atenção:</span> Alterações nesta seção afetam 
                          diretamente os privilégios de acesso do usuário ao sistema. Use com cuidado.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-4 focus:ring-gray-500/20 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <X size={20} />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Salvar Alterações
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}