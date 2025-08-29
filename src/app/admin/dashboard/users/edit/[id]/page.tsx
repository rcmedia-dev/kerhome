'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Mail, Phone, Building, FileText, Globe, 
  Facebook, Linkedin, Instagram, Youtube, Save, 
  X, Check, AlertCircle, Crown, TrendingUp, Lock,
  Calendar, Shield, Zap, ArrowLeft, Key, 
  CreditCard,
  CheckCircle,
  Upload,
  Star,
  LucideIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for demonstration - replace with your actual API calls
const mockUserData = {
  id: '123',
  email: 'usuario@exemplo.com',
  primeiro_nome: 'João',
  ultimo_nome: 'Silva',
  username: 'joao.silva',
  telefone: '+244 912 345 678',
  empresa: 'Imobiliária Silva & Associados',
  licenca: 'LIC-2024-001',
  website: 'https://silva-imoveis.com',
  facebook: 'silva.imoveis',
  linkedin: 'joao-silva-imoveis',
  instagram: '@silva_imoveis',
  youtube: 'SilvaImoveisOficial',
  sobre_mim: 'Profissional experiente no mercado imobiliário com mais de 10 anos de atuação. Especializado em imóveis residenciais e comerciais na região de Luanda.',
  ativo: true,
  pacote_agente: 'Plano Professional',
  role: 'Agente'
};

// Types for plans
type PlanType = {
  badge: string;
  iconBg: string;
  badgeBg: string;
  titleColor: string;
  border: string;
  button: string;
  limite: number;
  destaquesPermitidos: number;
  price: number;
  benefits: string[];
};

type PlansType = {
  "Plano Básico": PlanType;
  "Plano Professional": PlanType;
  "Plano Super": PlanType;
};

// Plans configuration
const PLANS: PlansType = {
  "Plano Básico": {
    badge: "BÁSICO",
    iconBg: "bg-blue-500",
    badgeBg: "bg-blue-100 text-blue-700",
    titleColor: "text-blue-800",
    border: "border-blue-200 bg-blue-50/80",
    button: "bg-blue-600 hover:bg-blue-700",
    limite: 10,
    destaquesPermitidos: 1,
    price: 99000.00,
    benefits: [
      "Até 10 imóveis ativos",
      "1 anúncio em destaque",
      "Suporte prioritário"
    ]
  },
  "Plano Professional": {
    badge: "PRO",
    iconBg: "bg-purple-600",
    badgeBg: "bg-purple-100 text-purple-700",
    titleColor: "text-purple-800",
    border: "border-purple-200 bg-purple-50/80",
    button: "bg-purple-600 hover:bg-purple-700",
    limite: 50,
    destaquesPermitidos: 3,
    price: 199000.00,
    benefits: [
      "Até 50 imóveis ativos",
      "3 anúncios em destaque",
      "Relatórios de desempenho",
      "Suporte prioritário",
      "Exposição em Redes Sociais"
    ]
  },
  "Plano Super": {
    badge: "SUPER",
    iconBg: "bg-orange-500",
    badgeBg: "bg-orange-100 text-orange-600",
    titleColor: "text-orange-600",
    border: "border-orange-200 bg-orange-50/80",
    button: "bg-orange-500 hover:bg-orange-600",
    limite: 1000,
    destaquesPermitidos: 5,
    price: 499000.00,
    benefits: [
      "Imóveis ilimitados",
      "5 anúncios em destaque",
      "Consultoria exclusiva",
      "Suporte VIP 24h",
      "Exposição em Redes Sociais",
    ]
  }
};

// Função para obter classes de cor baseada na seção
const getSectionClasses = (sectionId: string, isActive: boolean) => {
  const baseClasses = `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 border-2 ${
    isActive ? '' : 'border-transparent text-gray-600 hover:bg-gray-50'
  }`;
  
  switch (sectionId) {
    case 'pessoal':
      return isActive 
        ? `${baseClasses} bg-blue-50 text-blue-700 border-blue-200` 
        : baseClasses;
    case 'profissional':
      return isActive 
        ? `${baseClasses} bg-green-50 text-green-700 border-green-200` 
        : baseClasses;
    case 'social':
      return isActive 
        ? `${baseClasses} bg-purple-50 text-purple-700 border-purple-200` 
        : baseClasses;
    case 'sobre':
      return isActive 
        ? `${baseClasses} bg-orange-50 text-orange-700 border-orange-200` 
        : baseClasses;
    case 'plano':
      return isActive 
        ? `${baseClasses} bg-indigo-50 text-indigo-700 border-indigo-200` 
        : baseClasses;
    case 'role':
      return isActive 
        ? `${baseClasses} bg-red-50 text-red-700 border-red-200` 
        : baseClasses;
    default:
      return baseClasses;
  }
};

type InputFieldProps = {
  label: string;
  type?: string;
  icon?: LucideIcon;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  required?: boolean;
  error?: { message: string } | null;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const InputField: React.FC<InputFieldProps> = React.memo(
  ({
    label,
    type = "text",
    icon: Icon,
    placeholder,
    disabled = false,
    rows,
    required = false,
    error,
    value,
    onChange,
    ...rest
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
              value={value || ""}
              onChange={onChange}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none ${
                disabled
                  ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                  : "hover:border-gray-400"
              } ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-300"
              }`}
              {...rest}
            />
          ) : (
            <input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={value || ""}
              onChange={onChange}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                disabled
                  ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                  : "hover:border-gray-400"
              } ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-300"
              }`}
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
  }
);

InputField.displayName = 'InputField';

export default function AdminUserEditInterface() {
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('pessoal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [passwordData, setPasswordData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  });

  const router = useRouter();

  const [formValues, setFormValues] = useState(mockUserData);
  const [errors, setErrors] = useState({});

  // Função auxiliar para obter configuração do plano
  const getPlanConfig = useCallback((planName: string): PlanType | null => {
    return PLANS[planName as keyof PlansType] || null;
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setToastMessage({ 
        title: 'Sucesso', 
        message: 'Perfil atualizado com sucesso' 
      });
    } catch (error) {
      setToastMessage({ 
        title: 'Erro', 
        message: 'Falha ao atualizar perfil' 
      });
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowPasswordModal(false);
      setPasswordData({ novaSenha: '', confirmarSenha: '' });
      setToastMessage({
        title: 'Sucesso',
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      setToastMessage({
        title: 'Erro',
        message: 'Erro ao atualizar senha'
      });
    }

    setIsSubmitting(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }, [passwordData]);

  const handlePlanChange = async () => {
    if (!selectedPlan) {
      setToastMessage({
        title: 'Erro',
        message: 'Selecione um plano'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormValues(prev => ({ ...prev, pacote_agente: selectedPlan }));
      setShowPlanChangeModal(false);
      setSelectedPlan('');
      setToastMessage({
        title: 'Sucesso',
        message: 'Plano alterado com sucesso'
      });
    } catch (error) {
      setToastMessage({
        title: 'Erro',
        message: 'Erro ao alterar plano'
      });
    }

    setIsSubmitting(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(value);
  };

  const sections = [
    { id: 'pessoal', name: 'Pessoal', icon: User },
    { id: 'profissional', name: 'Profissional', icon: Building },
    { id: 'social', name: 'Redes Sociais', icon: Globe },
    { id: 'sobre', name: 'Sobre Mim', icon: FileText },
    { id: 'plano', name: 'Plano', icon: CreditCard },
    { id: 'role', name: 'Administrativo', icon: Shield }
  ];

  const currentPlan = getPlanConfig(formValues.pacote_agente);

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

      {/* Modal de Alteração de Plano */}
      {showPlanChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 rounded-2xl p-3">
                <CreditCard size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Alterar Plano do Usuário</h3>
                <p className="text-gray-600">Selecione o novo plano para {formValues.primeiro_nome} {formValues.ultimo_nome}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {Object.entries(PLANS).map(([planName, planConfig]) => (
                <div
                  key={planName}
                  onClick={() => setSelectedPlan(planName)}
                  className={`relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedPlan === planName 
                      ? `${planConfig.border} ring-4 ring-blue-200` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {formValues.pacote_agente === planName && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2">
                      <CheckCircle size={16} />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${planConfig.iconBg} rounded-xl p-3`}>
                      <Crown size={24} className="text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${planConfig.badgeBg}`}>
                      {planConfig.badge}
                    </span>
                  </div>

                  <h3 className={`text-xl font-bold mb-2 ${planConfig.titleColor}`}>
                    {planName}
                  </h3>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(planConfig.price)}
                    </span>
                    <span className="text-gray-500">/mês</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {planConfig.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check size={16} className="text-green-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{planConfig.limite === 1000 ? '∞' : planConfig.limite}</div>
                        <div className="text-xs text-gray-600">Imóveis</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{planConfig.destaquesPermitidos}</div>
                        <div className="text-xs text-gray-600">Destaques</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowPlanChangeModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handlePlanChange}
                disabled={isSubmitting || !selectedPlan}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Alterando...' : 'Confirmar Alteração'}
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
                <span className="text-sm font-medium">{formValues.role}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit}>
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
                        className={getSectionClasses(section.id, activeSection === section.id)}
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl border-2 border-blue-100 hover:bg-blue-100 transition-all duration-300 mb-3"
                  >
                    <Lock size={16} />
                    Alterar Senha
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowPlanChangeModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl border-2 border-indigo-100 hover:bg-indigo-100 transition-all duration-300"
                  >
                    <Upload size={16} />
                    Alterar Plano
                  </button>
                </div>

                {/* Plan Card */}
                {currentPlan && (
                  <div className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown size={20} className="text-yellow-300" />
                      <h3 className="font-bold text-lg">{formValues.pacote_agente}</h3>
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
                          <span>50 total</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                          <Zap size={20} className="mx-auto mb-1 text-yellow-300" />
                          <div className="text-sm opacity-90">Destaques</div>
                          <div className="font-bold">3</div>
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
                        icon={User}
                        placeholder="Digite o nome"
                        required={true}
                        value={formValues.primeiro_nome}
                        onChange={(e) => handleInputChange('primeiro_nome', e.target.value)}
                      />
                      <InputField
                        label="Sobrenome"
                        icon={User}
                        placeholder="Digite o sobrenome"
                        required={true}
                        value={formValues.ultimo_nome}
                        onChange={(e) => handleInputChange('ultimo_nome', e.target.value)}
                      />
                      <InputField
                        label="Email"
                        type="email"
                        icon={Mail}
                        disabled={true}
                        value={formValues.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                      <InputField
                        label="Username"
                        icon={User}
                        placeholder="@username"
                        value={formValues.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                      />
                      <div className="md:col-span-2">
                        <InputField
                          label="Telefone"
                          type="tel"
                          icon={Phone}
                          placeholder="+244 xxx xxx xxx"
                          value={formValues.telefone}
                          onChange={(e) => handleInputChange('telefone', e.target.value)}
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
                        icon={Building}
                        placeholder="Nome da empresa"
                        value={formValues.empresa}
                        onChange={(e) => handleInputChange('empresa', e.target.value)}
                      />
                      <InputField
                        label="Licença"
                        icon={FileText}
                        placeholder="Número da licença profissional"
                        value={formValues.licenca}
                        onChange={(e) => handleInputChange('licenca', e.target.value)}
                      />
                      <div className="md:col-span-2">
                        <InputField
                          label="Website"
                          type="url"
                          icon={Globe}
                          placeholder="https://site.com"
                          value={formValues.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
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
                        icon={Facebook}
                        placeholder="usuario.facebook"
                        value={formValues.facebook}
                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                      />
                      <InputField
                        label="LinkedIn"
                        icon={Linkedin}
                        placeholder="usuario-linkedin"
                        value={formValues.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      />
                      <InputField
                        label="Instagram"
                        icon={Instagram}
                        placeholder="@usuario"
                        value={formValues.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                      />
                      <InputField
                        label="YouTube"
                        icon={Youtube}
                        placeholder="NomeDoCanal"
                        value={formValues.youtube}
                        onChange={(e) => handleInputChange('youtube', e.target.value)}
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
                      rows={6}
                      placeholder="Experiência, habilidades, interesses..."
                      value={formValues.sobre_mim}
                      onChange={(e) => handleInputChange('sobre_mim', e.target.value)}
                    />
                  </div>
                )}

                {/* Gerenciamento de Plano */}
                {activeSection === 'plano' && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-indigo-100 rounded-2xl p-3">
                        <CreditCard size={24} className="text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Plano</h2>
                        <p className="text-gray-600">Informações e controle do plano atual</p>
                      </div>
                    </div>
                    
                    {currentPlan && (
                      <div className="space-y-8">
                        {/* Plano Atual */}
                        <div className={`rounded-2xl border-2 p-8 ${currentPlan.border}`}>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`${currentPlan.iconBg} rounded-xl p-3`}>
                                <Crown size={28} className="text-white" />
                              </div>
                              <div>
                                <h3 className={`text-2xl font-bold ${currentPlan.titleColor}`}>
                                  {formValues.pacote_agente}
                                </h3>
                                <p className="text-gray-600">Plano Atual</p>
                              </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full font-bold ${currentPlan.badgeBg}`}>
                              {currentPlan.badge}
                            </div>
                          </div>

                          {/* Estatísticas do Plano */}
                          <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                              <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-100 rounded-lg p-3">
                                  <Building size={24} className="text-blue-600" />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">30</span>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-1">Imóveis Usados</h4>
                              <div className="text-sm text-gray-600 mb-3">
                                de {currentPlan.limite === 1000 ? '∞' : currentPlan.limite} disponíveis
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(30 / currentPlan.limite) * 100}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                              <div className="flex items-center justify-between mb-4">
                                <div className="bg-yellow-100 rounded-lg p-3">
                                  <Star size={24} className="text-yellow-600" />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">1</span>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-1">Destaques Usados</h4>
                              <div className="text-sm text-gray-600 mb-3">
                                de {currentPlan.destaquesPermitidos} disponíveis
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(1 / currentPlan.destaquesPermitidos) * 100}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                              <div className="flex items-center justify-between mb-4">
                                <div className="bg-green-100 rounded-lg p-3">
                                  <TrendingUp size={24} className="text-green-600" />
                                </div>
                                <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">ATIVO</span>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-1">Status do Plano</h4>
                              <div className="text-sm text-gray-600">
                                Renovação em 30 dias
                              </div>
                            </div>
                          </div>

                          {/* Benefícios */}
                          <div className="bg-gray-50 rounded-xl p-6">
                            <h4 className="font-bold text-gray-900 mb-4">Benefícios Inclusos</h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              {currentPlan.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <Check size={16} className="text-green-500 flex-shrink-0" />
                                  <span className="text-gray-700">{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Ações do Plano */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="font-bold text-gray-900 mb-4">Ações do Plano</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setShowPlanChangeModal(true)}
                              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                            >
                              <Upload size={20} />
                              Alterar Plano
                            </button>
                            
                            <button
                              type="button"
                              className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                              onClick={() => {
                                setToastMessage({
                                  title: 'Info',
                                  message: 'Histórico de faturas será implementado em breve'
                                });
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 4000);
                              }}
                            >
                              <FileText size={20} />
                              Ver Histórico
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                            onClick={() => handleInputChange('role', 'Agente')}
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
                            onClick={() => handleInputChange('role', 'Admin')}
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