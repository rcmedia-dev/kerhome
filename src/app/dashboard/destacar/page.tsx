'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { Star, Check, Plus, Home, Calendar, Zap, Crown, ArrowRight, ArrowLeft, Sparkles, Target, TrendingUp, Shield, BadgeCheck, LucideIcon } from 'lucide-react';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { getSupabaseUserProperties } from '@/lib/actions/get-properties';

// =======================
// Types
// =======================
interface PacoteDestaque {
  id: string;
  nome: string;
  dias: number;
  preco: number;
  popular?: boolean;
  economize?: number;
  corDestaque: 'purple' | 'orange';
  icone: ReactNode;
  beneficios: string[];
  recursosEspeciais: string[];
}

// =======================
// Components
// =======================
const PropertySelector = ({
  properties,
  selectedProperties,
  onToggleProperty,
  onAddMore,
}: {
  properties: TPropertyResponseSchema[];
  selectedProperties: string[];
  onToggleProperty: (propertyId: string) => void;
  onAddMore: () => void;
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Home className="w-5 h-5 text-purple-700" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Selecionar Imóveis</h3>
          <p className="text-sm text-gray-600">Escolha os imóveis para destacar</p>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-3 mb-6 pr-2">
        {properties.map((property) => (
          <div
            key={property.id}
            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
              selectedProperties.includes(property.id)
                ? 'border-purple-700 bg-gradient-to-r from-purple-50 to-white shadow-md'
                : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
            }`}
            onClick={() => onToggleProperty(property.id)}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={property.image ?? '/house.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 border border-black/10 rounded-xl" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 line-clamp-1 text-sm">{property.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-1 mt-1">{property.endereco}</p>
                <p className="text-orange-500 font-bold text-sm mt-1">
                  {property.price?.toLocaleString('pt-AO')} Kz
                </p>
              </div>
              
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedProperties.includes(property.id)
                  ? 'bg-purple-700 border-purple-700 shadow-sm'
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

      {properties.length === 0 && (
        <div className="text-center py-8">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Nenhum imóvel encontrado</p>
          <Link
            href="/dashboard/adicionar-imovel"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Imóvel
          </Link>
        </div>
      )}

      <button
        onClick={onAddMore}
        className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-4 flex items-center justify-center gap-3 text-gray-600 hover:border-purple-700 hover:text-purple-700 transition-all duration-300 group"
      >
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
          <Plus className="w-4 h-4" />
        </div>
        <span className="font-medium">Adicionar Outros Imóveis</span>
      </button>
    </div>
  );
};

const PacoteCard = ({
  pacote,
  isSelected,
  onSelect,
}: {
  pacote: PacoteDestaque;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <div
      className={`relative rounded-3xl p-6 border-2 transition-all duration-500 cursor-pointer group overflow-hidden ${
        isSelected
          ? pacote.corDestaque === 'purple'
            ? 'border-purple-700 bg-gradient-to-br from-purple-50 to-white shadow-2xl scale-105'
            : 'border-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-2xl scale-105'
          : 'border-gray-200 bg-white hover:shadow-xl hover:scale-102'
      } ${pacote.popular ? 'ring-4 ring-purple-200' : ''}`}
      onClick={onSelect}
    >
      {/* Background Gradient Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        pacote.corDestaque === 'purple' 
          ? 'bg-gradient-to-br from-purple-500/5 to-transparent' 
          : 'bg-gradient-to-br from-orange-500/5 to-transparent'
      }`} />

      {pacote.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
            <Crown className="w-4 h-4" />
            MAIS POPULAR
          </div>
        </div>
      )}

      {pacote.economize && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold transform rotate-12 shadow-lg">
          Economize {pacote.economize}%
        </div>
      )}

      <div className="relative z-10">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg ${
            pacote.corDestaque === 'purple' 
              ? 'bg-gradient-to-br from-purple-600 to-purple-700' 
              : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}>
            {pacote.icone}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{pacote.nome}</h3>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{pacote.dias} dias de destaque</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">
              {pacote.preco.toLocaleString('pt-AO')}
            </span>
            <span className="text-gray-600 text-lg">Kz</span>
          </div>
          <p className="text-sm text-gray-600">
            {pacote.preco === 10000 ? 'Valor mínimo' : `≈ ${Math.round(pacote.preco / pacote.dias).toLocaleString('pt-AO')} Kz/dia`}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-sm font-semibold text-gray-900 mb-3">Benefícios incluídos:</div>
          {pacote.beneficios.map((beneficio, index) => (
            <div key={index} className="flex items-center gap-3 text-sm text-gray-700">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                pacote.corDestaque === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
              }`}>
                <Check className={`w-3 h-3 ${
                  pacote.corDestaque === 'purple' ? 'text-purple-700' : 'text-orange-500'
                }`} />
              </div>
              <span>{beneficio}</span>
            </div>
          ))}
        </div>

        {pacote.recursosEspeciais.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gray-50">
            <div className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Recursos especiais:
            </div>
            <div className="space-y-2">
              {pacote.recursosEspeciais.map((recurso, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  {recurso}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden group ${
            isSelected
              ? pacote.corDestaque === 'purple'
                ? 'bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="relative z-10">
            {isSelected ? 'Pacote Selecionado ✓' : 'Selecionar Este Pacote'}
          </span>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    </div>
  );
};

// =======================
// Main Page
// =======================
export default function PacotesDestaquePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [properties, setProperties] = useState<TPropertyResponseSchema[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedPacote, setSelectedPacote] = useState<PacoteDestaque | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'imoveis' | 'pacotes'>('imoveis');

  // Pacotes de destaque
  const pacotes: PacoteDestaque[] = [
    {
      id: 'basico',
      nome: 'Básico',
      dias: 7,
      preco: 10000,
      corDestaque: 'purple',
      icone: <Star className="w-6 h-6 text-white" />,
      beneficios: [
        'Destaque na lista principal',
        'Badge "Em Destaque" visível',
        '7 dias de visibilidade premium',
        'Aparece antes dos imóveis comuns',
      ],
      recursosEspeciais: ['Ideal para teste'],
    },
    {
      id: 'popular',
      nome: 'Popular',
      dias: 15,
      preco: 18000,
      popular: true,
      economize: 15,
      corDestaque: 'purple',
      icone: <TrendingUp className="w-6 h-6 text-white" />,
      beneficios: [
        'Tudo do plano Básico',
        'Posição prioritária nos resultados',
        '15 dias de visibilidade',
        '+50% mais visualizações',
        'Destaque em categoria escolhida',
      ],
      recursosEspeciais: ['Melhor custo-benefício', 'Mais vendido'],
    },
    {
      id: 'premium',
      nome: 'Premium',
      dias: 30,
      preco: 30000,
      economize: 25,
      corDestaque: 'orange',
      icone: <Target className="w-6 h-6 text-white" />,
      beneficios: [
        'Tudo do plano Popular',
        'Destaque na página inicial',
        '30 dias de visibilidade',
        'Prioridade máxima de exibição',
        '+100% mais visualizações',
        'Suporte prioritário 24/7',
      ],
      recursosEspeciais: ['Alcance máximo', 'Conversão garantida'],
    },
    {
      id: 'turbo',
      nome: 'Turbo',
      dias: 60,
      preco: 50000,
      economize: 30,
      corDestaque: 'orange',
      icone: <Zap className="w-6 h-6 text-white" />,
      beneficios: [
        'Tudo do plano Premium',
        '60 dias de visibilidade',
        'Destaque em todas as categorias',
        'Análise de performance detalhada',
        'Relatórios semanais de performance',
        'Consultoria personalizada',
        'Certificado de destaque',
      ],
      recursosEspeciais: ['Solução completa', 'Resultados comprovados'],
    },
  ];

  // Carregar imóveis do usuário
  useEffect(() => {
    if (user) {
      loadUserProperties();
    }
  }, [user]);

  const loadUserProperties = async () => {
    try {
      setLoading(true);
      const userProperties = await getSupabaseUserProperties(user!.id);
      setProperties(userProperties);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      toast.error('Erro ao carregar seus imóveis');
    } finally {
      setLoading(false);
    }
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleAddMoreProperties = () => {
    router.push('/dashboard/adicionar-imovel');
  };

  const handleCheckout = () => {
    if (!selectedPacote) {
      toast.error('Selecione um pacote de destaque');
      return;
    }
    if (selectedProperties.length === 0) {
      toast.error('Selecione pelo menos um imóvel');
      return;
    }

    // TODO: Implementar checkout/pagamento
    const total = selectedPacote.preco * selectedProperties.length;
    toast.success(
      <div className="text-center">
        <div className="font-bold text-lg">Processando destaque!</div>
        <div className="text-sm">
          {selectedProperties.length} imóvel(es) com pacote {selectedPacote.nome}
        </div>
        <div className="font-semibold text-orange-500">
          Total: {total.toLocaleString('pt-AO')} Kz
        </div>
      </div>
    );
  };

  const total = selectedPacote ? selectedPacote.preco * selectedProperties.length : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus imóveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-700 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">PACOTES DE DESTAQUE</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
            Destque seus Imóveis
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Aumente em <span className="font-semibold text-orange-500">até 3x</span> as visualizações dos seus imóveis 
            com nossos pacotes de destaque premium. Escolha o plano perfeito para seus objetivos.
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('imoveis')}
                className={`py-3 px-4 rounded-xl text-center transition-all ${
                  activeTab === 'imoveis'
                    ? 'bg-purple-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                Meus Imóveis
              </button>
              <button
                onClick={() => setActiveTab('pacotes')}
                className={`py-3 px-4 rounded-xl text-center transition-all ${
                  activeTab === 'pacotes'
                    ? 'bg-purple-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                Pacotes
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna 1: Seleção de Imóveis */}
          <div className={`lg:col-span-1 ${activeTab === 'pacotes' ? 'hidden lg:block' : 'block'}`}>
            <PropertySelector
              properties={properties}
              selectedProperties={selectedProperties}
              onToggleProperty={togglePropertySelection}
              onAddMore={handleAddMoreProperties}
            />

            {/* Resumo do Pedido */}
            {(selectedPacote || selectedProperties.length > 0) && (
              <div className="bg-white rounded-3xl shadow-xl p-6 mt-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-purple-700" />
                  Resumo do Pedido
                </h3>
                
                {selectedPacote && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">{selectedPacote.nome}</span>
                      <span className="font-bold text-purple-700">
                        {selectedPacote.preco.toLocaleString('pt-AO')} Kz
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedPacote.dias} dias de destaque
                    </div>
                  </div>
                )}

                {selectedProperties.length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>Imóveis selecionados:</span>
                      <span className="font-semibold">{selectedProperties.length}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedProperties.length === 1 
                        ? '1 imóvel será destacado'
                        : `${selectedProperties.length} imóveis serão destacados`
                      }
                    </div>
                  </div>
                )}

                {selectedPacote && selectedProperties.length > 0 && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total a pagar:</span>
                      <span className="text-orange-500 text-xl">
                        {total.toLocaleString('pt-AO')} Kz
                      </span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <Shield className="w-4 h-4" />
                        <span className="font-semibold">Garantia de 7 dias</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Se não gostar dos resultados, devolvemos seu dinheiro!
                      </p>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-purple-700 to-orange-500 text-white py-4 rounded-2xl font-bold hover:from-purple-800 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Destacar Imóveis Agora
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna 2: Pacotes */}
          <div className={`lg:col-span-2 ${activeTab === 'imoveis' ? 'hidden lg:block' : 'block'}`}>
            <div className="grid lg:grid-cols-2 gap-6">
              {pacotes.map((pacote) => (
                <PacoteCard
                  key={pacote.id}
                  pacote={pacote}
                  isSelected={selectedPacote?.id === pacote.id}
                  onSelect={() => setSelectedPacote(pacote)}
                />
              ))}
            </div>

            {/* Estatísticas e Garantias */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-700" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">+300% Visualizações</h4>
                <p className="text-sm text-gray-600">
                  Imóveis destacados recebem em média 3x mais visualizações
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Venda 2x Mais Rápido</h4>
                <p className="text-sm text-gray-600">
                  Tempo médio de venda reduzido pela metade
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Garantia Total</h4>
                <p className="text-sm text-gray-600">
                  7 dias de garantia ou seu dinheiro de volta
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-700 to-orange-500 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">
                Pronto para Transformar suas Vendas?
              </h2>
              <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Junte-se a mais de <span className="font-semibold text-white">5.000 corretores</span> que 
                já aumentaram suas vendas usando nossos pacotes de destaque.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/dashboard"
                  className="px-8 py-4 border-2 border-white text-white rounded-2xl font-bold hover:bg-white hover:text-purple-700 transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar ao Dashboard
                </Link>
                <button
                  onClick={handleCheckout}
                  disabled={!selectedPacote || selectedProperties.length === 0}
                  className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Destacar Imóveis Agora
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-purple-400/30">
                <div className="flex items-center gap-2 text-purple-200 text-sm">
                  <Shield className="w-4 h-4" />
                  Pagamento 100% Seguro
                </div>
                <div className="flex items-center gap-2 text-purple-200 text-sm">
                  <BadgeCheck className="w-4 h-4" />
                  Garantia de 7 Dias
                </div>
                <div className="flex items-center gap-2 text-purple-200 text-sm">
                  <Sparkles className="w-4 h-4" />
                  Suporte 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}