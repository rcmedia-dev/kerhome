'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Check, Plus, Home, Calendar, Zap, Crown, ArrowRight, Sparkles, Target, TrendingUp, Shield, BadgeCheck, Rocket, Medal, X, Search } from 'lucide-react';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { toast } from 'sonner';
import Image from 'next/image';
import { getPropertyById, getSupabaseUserProperties } from '@/lib/actions/get-properties';
import { useUserStore } from '@/lib/store/user-store';
import { createClient } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase';

interface PacoteDestaque {
  id: string;
  nome: string;
  dias: number;
  preco: number;
  popular?: boolean;
  corDestaque: 'purple' | 'orange';
  icone: React.ReactNode;
  beneficios: string[];
}

// Componente do Modal de Seleção
const PropertySelectionModal = ({ 
  isOpen, 
  onClose, 
  properties, 
  selectedProperties, 
  onToggleProperty,
  onAddSelected 
}: {
  isOpen: boolean;
  onClose: () => void;
  properties: TPropertyResponseSchema[];
  selectedProperties: string[];
  onToggleProperty: (id: string) => void;
  onAddSelected: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Selecionar Imóveis</h2>
            <p className="text-sm text-gray-600">Escolha os imóveis que deseja destacar</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar imóveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Imóveis */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                  selectedProperties.includes(property.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
                onClick={() => onToggleProperty(property.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={property.image ?? '/house.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                      {property.title}
                    </h4>
                    <p className="text-orange-500 font-bold text-sm mb-1">
                      {property.price?.toLocaleString('pt-AO')} Kz
                    </p>
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {property.description}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedProperties.includes(property.id)
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedProperties.includes(property.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum imóvel encontrado</p>
            </div>
          )}
        </div>

        {/* Footer do Modal */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedProperties.length} imóvel(s) selecionado(s)
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onAddSelected}
                disabled={selectedProperties.length === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Adicionar ({selectedProperties.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactPropertyCard = ({ property, isSelected, onToggle }: { 
  property: TPropertyResponseSchema;
  isSelected: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-300 border-2 ${
      isSelected
        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-white shadow-lg'
        : 'border-gray-200 hover:border-purple-300 hover:shadow-md bg-white'
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
        <Image src={property.image ?? '/house.jpg'} alt={property.title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{property.title}</h4>
        <p className="text-orange-500 font-bold text-sm">{property.price?.toLocaleString('pt-AO')} Kz</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
      }`}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
    </div>
  </div>
);

const CompactPacoteCard = ({ pacote, isSelected, onSelect }: {
  pacote: PacoteDestaque;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div
    className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
      isSelected
        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-xl scale-105'
        : 'border-gray-200 hover:border-purple-300 hover:shadow-lg bg-white'
    } ${pacote.popular ? 'ring-2 ring-purple-300' : ''}`}
    onClick={onSelect}
  >
    {pacote.popular && (
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Crown className="w-3 h-3" /> POPULAR
        </div>
      </div>
    )}

    <div className="text-center mb-4">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 ${
        pacote.corDestaque === 'purple' 
          ? 'bg-gradient-to-br from-purple-600 to-purple-700' 
          : 'bg-gradient-to-br from-orange-500 to-orange-600'
      }`}>
        {pacote.icone}
      </div>
      <h3 className="font-bold text-gray-900 text-lg">{pacote.nome}</h3>
      <div className="flex items-center justify-center gap-1 text-gray-600 text-sm mt-1">
        <Calendar className="w-4 h-4" /> <span>{pacote.dias} dias</span>
      </div>
    </div>

    <div className="text-center mb-4">
      <div className="text-2xl font-bold text-gray-900">{pacote.preco.toLocaleString('pt-AO')} Kz</div>
    </div>

    <div className="space-y-2 mb-4">
      {pacote.beneficios.slice(0, 3).map((beneficio, index) => (
        <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
            pacote.corDestaque === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
          }`}>
            <Check className={`w-2 h-2 ${pacote.corDestaque === 'purple' ? 'text-purple-700' : 'text-orange-500'}`} />
          </div>
          <span className="line-clamp-1">{beneficio}</span>
        </div>
      ))}
    </div>

    <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
      isSelected
        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}>
      {isSelected ? 'Selecionado ✓' : 'Selecionar'}
    </button>
  </div>
);

const ProgressStep = ({ completed, label, count }: { completed: boolean; label: string; count?: number }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
      completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
    }`}>
      <Check className="w-4 h-4" />
    </div>
    <span className={`text-sm ${completed ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
      {label} {count !== undefined && `(${count})`}
    </span>
  </div>
);

// Função para buscar pacotes do Supabase
const fetchPacotesFromSupabase = async (): Promise<PacoteDestaque[]> => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('pacotes_destaque')
      .select('*')
      .order('preco', { ascending: true });

    if (error) {
      console.error('Erro ao buscar pacotes:', error);
      return getDefaultPacotes();
    }

    if (!data || data.length === 0) {
      return getDefaultPacotes();
    }

    // Mapear os dados do Supabase para o formato da interface
    return data.map(pacote => {
      // Determinar corDestaque baseado no ID ou nome
      const corDestaque = pacote.id === 'premium' || pacote.id === 'turbo' ? 'orange' : 'purple';
      
      // Mapear ícones baseado no nome do ícone
      const getIcone = (iconeName: string) => {
        switch (iconeName) {
          case 'Star': return <Star className="w-5 h-5 text-white" />;
          case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-white" />;
          case 'Target': return <Target className="w-5 h-5 text-white" />;
          case 'Zap': return <Zap className="w-5 h-5 text-white" />;
          default: return <Star className="w-5 h-5 text-white" />;
        }
      };

      return {
        id: pacote.id,
        nome: pacote.nome,
        dias: pacote.dias,
        preco: pacote.preco,
        popular: pacote.popular || false,
        corDestaque,
        icone: getIcone(pacote.icone || 'Star'),
        beneficios: Array.isArray(pacote.beneficios) ? pacote.beneficios : []
      };
    });
  } catch (error) {
    console.error('Erro ao buscar pacotes do Supabase:', error);
    return getDefaultPacotes();
  }
};

// Pacotes padrão caso não haja dados no Supabase
const getDefaultPacotes = (): PacoteDestaque[] => [
  {
    id: 'basico', nome: 'Básico', dias: 7, preco: 10000, corDestaque: 'purple',
    icone: <Star className="w-5 h-5 text-white" />,
    beneficios: ['Destaque na lista principal', '7 dias de visibilidade', 'Badge especial'],
  },
  {
    id: 'popular', nome: 'Popular', dias: 15, preco: 18000, popular: true, corDestaque: 'purple',
    icone: <TrendingUp className="w-5 h-5 text-white" />,
    beneficios: ['Posição prioritária', '15 dias de visibilidade', '+50% visualizações'],
  },
  {
    id: 'premium', nome: 'Premium', dias: 30, preco: 30000, corDestaque: 'orange',
    icone: <Target className="w-5 h-5 text-white" />,
    beneficios: ['Destaque na página inicial', '30 dias visibilidade', 'Suporte prioritário'],
  },
  {
    id: 'turbo', nome: 'Turbo', dias: 60, preco: 50000, corDestaque: 'orange',
    icone: <Zap className="w-5 h-5 text-white" />,
    beneficios: ['Destaque em todas categorias', '60 dias visibilidade', 'Consultoria personalizada'],
  },
];

const tabs = [
  { id: 'imoveis' as const, label: 'Imóveis', icon: Home },
  { id: 'pacotes' as const, label: 'Pacotes', icon: Rocket },
  { id: 'resumo' as const, label: 'Resumo', icon: BadgeCheck },
];

// Função para adicionar imóveis à tabela de destaque
const addPropertiesToBoost = async (propertyIds: string[], planId: string) => {
  const supabase = createClient();
  
  try {
    // Preparar os dados para inserção
    const boostData = propertyIds.map(propertyId => ({
      property_id: propertyId,
      plan_id: planId
    }));

    const { data, error } = await supabase
      .from('properties_to_boost')
      .insert(boostData)
      .select();

    if (error) {
      console.error('Erro ao adicionar imóveis para destaque:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao processar destaque:', error);
    throw error;
  }
};

export default function CompactPacotesDestaquePage() {
  const { user } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<TPropertyResponseSchema[]>([]);
  const [pacotes, setPacotes] = useState<PacoteDestaque[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedPacote, setSelectedPacote] = useState<PacoteDestaque | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'imoveis' | 'pacotes' | 'resumo'>('imoveis');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSelectedProperties, setModalSelectedProperties] = useState<string[]>([]);

  // Obter o ID do parâmetro da URL
  const propertyId = searchParams.get('id');

  useEffect(() => {
    if (user) {
      loadUserProperties();
      loadPacotes();
    }
  }, [user]);

  useEffect(() => {
    // Se há um ID na URL, carregar e selecionar automaticamente o imóvel
    if (propertyId && properties.length > 0) {
      const propertyExists = properties.find(p => p.id === propertyId);
      if (propertyExists && !selectedProperties.includes(propertyId)) {
        setSelectedProperties([propertyId]);
        toast.success('Imóvel selecionado automaticamente');
        
        // Mudar para a aba de pacotes automaticamente
        setTimeout(() => setActiveTab('pacotes'), 1000);
      }
    }
  }, [propertyId, properties, selectedProperties]);

  const loadUserProperties = async () => {
    try {
      setLoading(true);
      const userProperties = await getSupabaseUserProperties(user!.id);
      setProperties(userProperties);

      // Se há um ID na URL, buscar o imóvel específico
      if (propertyId) {
        const specificProperty = await getPropertyById(propertyId);
        if (specificProperty) {
          // Verificar se o imóvel pertence ao usuário
          const userOwnsProperty = userProperties.some(p => p.id === propertyId);
          if (!userOwnsProperty) {
            toast.error('Este imóvel não pertence ao seu usuário');
          }
        } else {
          toast.error('Imóvel não encontrado ou não está aprovado');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      toast.error('Erro ao carregar seus imóveis');
    }
  };

  const loadPacotes = async () => {
    try {
      const pacotesData = await fetchPacotesFromSupabase();
      setPacotes(pacotesData);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
      toast.error('Erro ao carregar pacotes de destaque');
      // Usar pacotes padrão em caso de erro
      setPacotes(getDefaultPacotes());
    } finally {
      setLoading(false);
    }
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => prev.includes(propertyId) 
      ? prev.filter(id => id !== propertyId) 
      : [...prev, propertyId]
    );
  };

  const toggleModalPropertySelection = (propertyId: string) => {
    setModalSelectedProperties(prev => prev.includes(propertyId) 
      ? prev.filter(id => id !== propertyId) 
      : [...prev, propertyId]
    );
  };

  const openModal = () => {
    setModalSelectedProperties([...selectedProperties]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalSelectedProperties([]);
  };

  const addSelectedProperties = () => {
    setSelectedProperties([...modalSelectedProperties]);
    toast.success(`${modalSelectedProperties.length} imóvel(s) adicionado(s) para destaque`);
    closeModal();
  };

  const handleCheckout = async () => {
    if (!selectedPacote) return toast.error('Selecione um pacote de destaque');
    if (selectedProperties.length === 0) return toast.error('Selecione pelo menos um imóvel');
    
    setProcessing(true);

    try {
      // Verificar se o plano existe na lista de pacotes
      const planoValido = pacotes.some(pacote => pacote.id === selectedPacote.id);
      
      if (!planoValido) {
        toast.error('Plano selecionado não é válido');
        return;
      }

      // Adicionar imóveis à tabela de destaque
      await addPropertiesToBoost(selectedProperties, selectedPacote.id);
      
      const total = selectedPacote.preco * selectedProperties.length;
      
      // Registrar a fatura no Supabase
      const { data: fatura, error } = await supabase
        .from('faturas')
        .insert([
          {
            user_id: user?.id, // assumindo que você tem o objeto user disponível
            valor: total,
            status: 'paga', // ou 'pendente' dependendo do seu fluxo de pagamento
            servico: `Destaque - ${selectedPacote.nome} (${selectedPacote.dias} dias) para ${selectedProperties.length} imóvel(is)`
          }
        ])
        .select();

      if (error) {
        console.error('Erro ao registrar fatura:', error);
        toast.error('Erro ao registrar fatura, mas destaque foi ativado.');
      } else {
        console.log('Fatura registrada com sucesso:', fatura);
      }

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">✅ Destaque ativado com sucesso!</span>
          <span>{selectedProperties.length} imóvel(es) destacado(s)</span>
          <span>Plano: {selectedPacote.nome} - {selectedPacote.dias} dias</span>
          <span>Total: {total.toLocaleString('pt-AO')} Kz</span>
        </div>
      );

      // Limpar seleções após sucesso
      setSelectedProperties([]);
      setSelectedPacote(null);
      setActiveTab('imoveis');

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Erro ao processar destaque:', error);
      toast.error('Erro ao ativar destaque. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const total = selectedPacote ? selectedPacote.preco * selectedProperties.length : 0;

  // Encontrar o imóvel específico se há um ID na URL
  const specificProperty = propertyId 
    ? properties.find(p => p.id === propertyId)
    : null;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header com informação do imóvel específico se aplicável */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-lg mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {specificProperty ? 'DESTAQUE ESTE IMÓVEL' : 'DESTAQUE SEUS IMÓVEIS'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {specificProperty ? (
                <>
                  Destacar <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">{specificProperty.title}</span>
                </>
              ) : (
                <>
                  Escolha seus <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">Imóveis</span> e <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">Pacote</span>
                </>
              )}
            </h1>
            {specificProperty && (
              <p className="text-gray-600 max-w-2xl mx-auto">
                Selecione um pacote de destaque para este imóvel e aumente sua visibilidade
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-xl mb-6">
            <div className="grid grid-cols-3 gap-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                  {tab.id === 'imoveis' && selectedProperties.length > 0 && (
                    <span className="bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {selectedProperties.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Conteúdo Principal */}
            <div className="lg:col-span-2">
              {activeTab === 'imoveis' && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Home className="w-6 h-6 text-purple-600" />
                      <h2 className="text-xl font-bold text-gray-900">
                        {specificProperty ? 'Imóvel Selecionado' : 'Seus Imóveis Selecionados'}
                      </h2>
                    </div>
                    <span className="text-sm text-gray-600">{selectedProperties.length} selecionado(s)</span>
                  </div>

                  {selectedProperties.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4 mb-6 max-h-96 overflow-y-auto pr-2">
                        {properties
                          .filter(property => selectedProperties.includes(property.id))
                          .map((property) => (
                            <CompactPropertyCard
                              key={property.id}
                              property={property}
                              isSelected={selectedProperties.includes(property.id)}
                              onToggle={() => togglePropertySelection(property.id)}
                            />
                          ))}
                      </div>
                      {!specificProperty && (
                        <div className="flex gap-3">
                          <button
                            onClick={openModal}
                            className="flex-1 border-2 border-dashed border-gray-300 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-600 hover:border-purple-500 hover:text-purple-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" /> Adicionar Mais Imóveis
                          </button>
                          {selectedProperties.length > 0 && (
                            <button
                              onClick={() => setSelectedProperties([])}
                              className="px-4 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                            >
                              Limpar Todos
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {specificProperty ? 'Imóvel não encontrado' : 'Nenhum imóvel selecionado'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {specificProperty 
                          ? 'O imóvel solicitado não está disponível para destaque'
                          : 'Adicione imóveis para começar a impulsionar'
                        }
                      </p>
                      {!specificProperty && (
                        <button
                          onClick={openModal}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
                        >
                          <Plus className="w-5 h-5" /> Selecionar Imóveis
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pacotes' && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Rocket className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Pacotes de Destaque</h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pacotes.map((pacote) => (
                      <CompactPacoteCard
                        key={pacote.id}
                        pacote={pacote}
                        isSelected={selectedPacote?.id === pacote.id}
                        onSelect={() => setSelectedPacote(pacote)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'resumo' && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BadgeCheck className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Resumo do Pedido</h2>
                  </div>

                  {!selectedPacote || selectedProperties.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-2">Complete as etapas anteriores</p>
                      <p className="text-sm text-gray-400">Selecione imóveis e escolha um pacote para continuar</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-50 to-white rounded-2xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">{selectedPacote.nome}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4" /> {selectedPacote.dias} dias de destaque
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-purple-700 text-lg">{selectedPacote.preco.toLocaleString('pt-AO')} Kz</div>
                            <div className="text-sm text-gray-600">por imóvel</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-900">Imóveis Selecionados</span>
                          <span className="bg-purple-600 text-white text-sm rounded-full px-3 py-1">{selectedProperties.length}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedProperties.length === 1 ? '1 imóvel será destacado' : `${selectedProperties.length} imóveis serão destacados`}
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total a pagar:</span>
                          <span className="text-orange-500 text-xl">{total.toLocaleString('pt-AO')} Kz</span>
                        </div>
                        
                        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 text-green-700 text-sm">
                            <Shield className="w-4 h-4" /> <span className="font-semibold">Garantia de 7 dias</span>
                          </div>
                        </div>

                        <button 
                          onClick={handleCheckout}
                          disabled={processing}
                          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Processando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" /> Destacar Imóveis Agora <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-purple-600" /> Seu Progresso
                </h3>
                
                <div className="space-y-4">
                  <ProgressStep completed={selectedProperties.length > 0} label="Imóveis Selecionados" count={selectedProperties.length} />
                  <ProgressStep completed={!!selectedPacote} label="Pacote Escolhido" />
                  <ProgressStep completed={selectedProperties.length > 0 && !!selectedPacote} label="Pronto para Finalizar" />
                </div>

                {(selectedPacote || selectedProperties.length > 0) && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl border border-purple-200">
                    <div className="text-sm text-gray-600 mb-2">Resumo Rápido:</div>
                    {selectedPacote && (
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pacote {selectedPacote.nome}:</span>
                        <span className="font-semibold">{selectedPacote.preco.toLocaleString('pt-AO')} Kz</span>
                      </div>
                    )}
                    {selectedProperties.length > 0 && (
                      <div className="flex justify-between text-sm mb-2">
                        <span>Imóveis:</span>
                        <span className="font-semibold">{selectedProperties.length}x</span>
                      </div>
                    )}
                    {selectedPacote && selectedProperties.length > 0 && (
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-orange-500">{total.toLocaleString('pt-AO')} Kz</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Imóveis */}
      <PropertySelectionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        properties={properties}
        selectedProperties={modalSelectedProperties}
        onToggleProperty={toggleModalPropertySelection}
        onAddSelected={addSelectedProperties}
      />
    </>
  );
}