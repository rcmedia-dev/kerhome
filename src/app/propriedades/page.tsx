'use client'

import React, { useState, useEffect, ReactNode, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import {
  Bed,
  Bath,
  Car,
  MapPin,
  ChevronDown,
  SlidersHorizontal,
  DollarSign,
  X,
  Building,
  TrendingUp,
  Sparkles,
  LucideIcon,
  Search,
  Check,
  ArrowRight
} from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { PropertyComparison, useCompare } from '@/components/property-comparison';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { getMixedProperties, getProperties } from '@/lib/functions/get-properties';
import { motion, Variants, Transition, AnimatePresence } from 'framer-motion';
import LoadingState from './components/loading-state';
import { RecentlyViewedProperties } from '@/components/recently-viewed-properties';
import { QuickViewModal } from '@/components/quick-view-modal';
import { PropertyAiChat } from '@/components/property-ai-chat';
import { useSavedSearches } from '@/hooks/use-saved-searches';

// Hook personalizado para debounce (sem bibliotecas externas)
const useDebouncedCallback = (fn: (...args: any[]) => void, wait = 350) => {
  const timer = useRef<number | null>(null);
  return useCallback((...args: any[]) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      fn(...args);
      timer.current = null;
    }, wait);
  }, [fn, wait]);
};

// Função para formatar número com separador de milhar
const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não é número
  const numbersOnly = value.replace(/\D/g, '');

  // Se estiver vazio, retorna vazio
  if (!numbersOnly) return '';

  // Formata com separador de milhar
  return new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(numbersOnly));
};

// Função para remover a formatação e retornar apenas números
const parseCurrencyInput = (formattedValue: string): string => {
  return formattedValue.replace(/\D/g, '');
};

// Configurações de transição
const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20
};

const fastSpringTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 10
};

// Variantes de animação
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
};

const filterItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

const mobileFilterVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.4,
      staggerChildren: 0.05
    }
  }
};

const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

const buttonVariants: Variants = {
  rest: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95
  }
};

// Componente FilterInput com React.memo para evitar re-renders desnecessários
const FilterInput = React.memo(({
  Icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  className = ''
}: {
  Icon: LucideIcon;
  placeholder: string;
  value: string | number;
  onChange: (e: any) => void;
  type?: string;
  className?: string;
}) => (
  <motion.div
    variants={filterItemVariants}
    className="relative group"
    whileHover={{ y: -2 }}
    transition={springTransition}
  >
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-purple-600">
      <Icon size={16} className="text-gray-400 group-focus-within:text-purple-600" />
    </div>
    <motion.input
      type={type}
      placeholder={placeholder}
      className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-sm shadow-sm hover:shadow-md group-hover:border-purple-300 ${value ? 'border-purple-200 bg-purple-50' : ''
        } ${className}`}
      value={value}
      onChange={onChange}
      whileFocus={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    />
  </motion.div>
));

FilterInput.displayName = 'FilterInput';

// Componente FilterSelect com React.memo
const FilterSelect = React.memo(({
  Icon,
  value,
  onChange,
  children,
  className = ''
}: {
  Icon: LucideIcon;
  value: string | number;
  onChange: (e: any) => void;
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={filterItemVariants}
    className="relative group"
    whileHover={{ y: -2 }}
    transition={springTransition}
  >
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-purple-600">
      <Icon size={16} className="text-gray-400 group-focus-within:text-purple-600" />
    </div>
    <motion.select
      className={`w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none bg-white text-sm shadow-sm hover:shadow-md group-hover:border-purple-300 ${value ? 'border-purple-200 bg-purple-50' : ''
        } ${className}`}
      value={value}
      onChange={onChange}
      whileFocus={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.select>
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <motion.div
        animate={{ rotate: 0 }}
        whileHover={{ rotate: 180 }}
        transition={springTransition}
      >
        <ChevronDown size={14} className="text-gray-400" />
      </motion.div>
    </div>
  </motion.div>
));

FilterSelect.displayName = 'FilterSelect';

const PropertyListing = () => {
  const searchParamsStr = useSearchParams().toString();
  const [filters, setFilters] = useState({
    status: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    garagens: '',
    tipo: '',
    sortBy: 'recent',
    q: '',
  });

  // Estados locais para inputs com debounce
  const [localLocation, setLocalLocation] = useState(filters.location || '');
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');

  // Estados para os valores formatados (com máscara)
  const [formattedMinPrice, setFormattedMinPrice] = useState('');
  const [formattedMaxPrice, setFormattedMaxPrice] = useState('');

  const [isSticky, setIsSticky] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [quickViewProperty, setQuickViewProperty] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(9);
  const ITEMS_PER_PAGE = 6;
  const [saveSearchName, setSaveSearchName] = useState('');
  const { searches: savedSearches, save: saveSearch, remove: removeSearch } = useSavedSearches();

  // Sincroniza estados locais quando filters muda externamente (ex: clearFilters)
  useEffect(() => {
    setLocalLocation(filters.location || '');

    // Atualiza os valores formatados quando os filtros são limpos
    if (filters.minPrice === '') {
      setFormattedMinPrice('');
    } else {
      setFormattedMinPrice(formatCurrencyInput(filters.minPrice));
    }

    if (filters.maxPrice === '') {
      setFormattedMaxPrice('');
    } else {
      setFormattedMaxPrice(formatCurrencyInput(filters.maxPrice));
    }
  }, [filters.location, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [searchBanner, setSearchBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParamsStr) return;
    const params = new URLSearchParams(searchParamsStr);
    const tipo = params.get('tipo');
    const cidade = params.get('cidade');
    const preco_max = params.get('preco_max');
    const quartos = params.get('quartos');
    const banheiros = params.get('banheiros');
    const garagensParam = params.get('garagens');
    const status = params.get('status');
    const q = params.get('q');

    const newFilters: Record<string, string> = {};
    if (tipo) newFilters.tipo = tipo;
    if (cidade) newFilters.location = cidade;
    if (preco_max) newFilters.maxPrice = preco_max;
    if (quartos) newFilters.bedrooms = quartos;
    if (banheiros) newFilters.bathrooms = banheiros;
    if (garagensParam) newFilters.garagens = garagensParam;
    if (status) newFilters.status = status;
    if (q) newFilters.q = q;

    if (Object.keys(newFilters).length === 0) return;

    setFilters(prev => {
      const hasChanges = Object.entries(newFilters).some(([k, v]) => (prev as any)[k] !== v);
      if (!hasChanges) return prev;
      return { ...prev, ...newFilters };
    });

    const parts: string[] = [];
    if (tipo) parts.push(tipo);
    if (quartos) parts.push(`T${quartos}`);
    if (cidade) parts.push(`em ${cidade}`);
    if (preco_max) parts.push(`até Kz ${Number(preco_max).toLocaleString()}`);
    if (parts.length > 0) setSearchBanner(parts.join(' '));
  }, [searchParamsStr]);

  const clearFilters = () => {
    setFilters({
      status: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      garagens: '',
      tipo: '',
      sortBy: 'recent',
      q: '',
    });
    setVisibleCount(9);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'recent');

  // Properties from supabase
  const properties = useQuery({
    queryKey: ['properties', 'mixed'],
    queryFn: async () => {
      const response = await getMixedProperties();
      return response.properties;
    },
    staleTime: 60000,
    refetchOnMount: false,
  });

  // Ã°Å¸â€Â Funções de debounce para localização e preços
  const updateFilterLocation = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, location: value }));
    setVisibleCount(9);
  }, 350);

  const updateFilterMinPrice = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, minPrice: value }));
    setVisibleCount(9);
  }, 350);

  const updateFilterMaxPrice = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, maxPrice: value }));
    setVisibleCount(9);
  }, 350);

  // Ã°Å¸Å½Â¯ Handlers para inputs com debounce - useCallback para manter referência estável
  const handleLocalLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalLocation(value);
    updateFilterLocation(value);
  }, [updateFilterLocation]);

  // Handler para preço mínimo com formatação
  const handleLocalMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Aplica a máscara de formatação
    const formattedValue = formatCurrencyInput(inputValue);
    setFormattedMinPrice(formattedValue);

    // Atualiza o estado local com o valor numérico (sem formatação)
    const numericValue = parseCurrencyInput(formattedValue);
    setLocalMinPrice(numericValue);
    updateFilterMinPrice(numericValue);
  }, [updateFilterMinPrice]);

  // Handler para preço máximo com formatação
  const handleLocalMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Aplica a máscara de formatação
    const formattedValue = formatCurrencyInput(inputValue);
    setFormattedMaxPrice(formattedValue);

    // Atualiza o estado local com o valor numérico (sem formatação)
    const numericValue = parseCurrencyInput(formattedValue);
    setLocalMaxPrice(numericValue);
    updateFilterMaxPrice(numericValue);
  }, [updateFilterMaxPrice]);

  // Handlers para selects sem debounce - useCallback para manter referência estável
  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
    setVisibleCount(9);
  }, []);

  const handleTipoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, tipo: e.target.value }));
    setVisibleCount(9);
  }, []);

  const handleBedroomsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, bedrooms: e.target.value }));
    setVisibleCount(9);
  }, []);

  const handleBathroomsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, bathrooms: e.target.value }));
    setVisibleCount(9);
  }, []);

  const handleGaragensChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, garagens: e.target.value }));
    setVisibleCount(9);
  }, []);

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
    setVisibleCount(9);
  }, []);

  // Ã°Å¸â€Â FILTRAGEM NO FRONTEND
  const filteredProperties = properties?.data?.filter((property: any) => {
    const {
      status,
      minPrice,
      maxPrice,
      location,
      bedrooms,
      bathrooms,
      garagens,
      tipo,
      q,
    } = filters;

    const matchesStatus = !status || property.status === status;
    const matchesTipo = !tipo || property.tipo?.toLowerCase() === tipo.toLowerCase();
    const matchesLocation = !location || (
      property.endereco?.toLowerCase().includes(location.toLowerCase()) ||
      property.cidade?.toLowerCase().includes(location.toLowerCase())
    );
    const matchesBedrooms = !bedrooms || property.bedrooms >= Number(bedrooms);
    const matchesBathrooms = !bathrooms || property.bathrooms >= Number(bathrooms);
    const matchesGaragens = !garagens || property.garagens >= Number(garagens);
    const matchesMinPrice = !minPrice || property.price >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || property.price <= Number(maxPrice);
    const matchesQ = !q || (() => {
      const keywords = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (keywords.length === 0) return true;
      const text = `${property.title?.toLowerCase() || ''} ${property.description?.toLowerCase() || ''}`;
      return keywords.some(kw => text.includes(kw));
    })();

    return (
      matchesStatus &&
      matchesTipo &&
      matchesLocation &&
      matchesBedrooms &&
      matchesBathrooms &&
      matchesGaragens &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesQ
    );
  });

  // Ã°Å¸Å½Â¯ ORDENAÃ‡ÃƒÆ’O
  const sortedProperties = React.useMemo(() => {
    if (!filteredProperties) return [];

    const sorted = [...filteredProperties];

    switch (filters.sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price! - b.price!);
      case 'price_desc':
        return sorted.sort((a, b) => b.price! - a.price!);
      case 'area':
        return sorted.sort((a, b) => (b.area_terreno || 0) - (a.area_terreno || 0));
      case 'recent':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [filteredProperties, filters.sortBy]);

  const displayedProperties = React.useMemo(
    () => sortedProperties.slice(0, visibleCount),
    [sortedProperties, visibleCount]
  );
  const hasMore = sortedProperties.length > visibleCount;

  const FilterGrid = ({ isModal = false }) => (
    <div className={`grid grid-cols-1 ${isModal ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
      <FilterInput
        Icon={MapPin}
        placeholder="Localização (ex: Luanda)"
        value={localLocation}
        onChange={handleLocalLocationChange}
        className="bg-gray-50 border-gray-100 focus:bg-white"
      />

      <FilterSelect Icon={Building} value={filters.tipo} onChange={handleTipoChange} className="bg-gray-50 border-gray-100">
        <option value="">Tipo de Imóvel</option>
        <option value="casa">Casa</option>
        <option value="apartamento">Apartamento</option>
        <option value="studio">Studio</option>
      </FilterSelect>

      <FilterSelect Icon={TrendingUp} value={filters.status} onChange={handleStatusChange} className="bg-gray-50 border-gray-100">
        <option value="">Status (Todos)</option>
        <option value="comprar">Comprar</option>
        <option value="arrendar">Arrendar</option>
      </FilterSelect>

      <div className="flex gap-2">
        <FilterInput
          Icon={DollarSign}
          type="text"
          placeholder="Mín"
          value={formattedMinPrice}
          onChange={handleLocalMinPriceChange}
          className="bg-gray-50 border-gray-100"
        />
        <FilterInput
          Icon={DollarSign}
          type="text"
          placeholder="Máx"
          value={formattedMaxPrice}
          onChange={handleLocalMaxPriceChange}
          className="bg-gray-50 border-gray-100"
        />
      </div>

      <FilterSelect Icon={Bed} value={filters.bedrooms} onChange={handleBedroomsChange} className="bg-gray-50 border-gray-100">
        <option value="">Quartos</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </FilterSelect>

      <FilterSelect Icon={Bath} value={filters.bathrooms} onChange={handleBathroomsChange} className="bg-gray-50 border-gray-100">
        <option value="">Banheiros</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
      </FilterSelect>

      <FilterSelect Icon={Car} value={filters.garagens} onChange={handleGaragensChange} className="bg-gray-50 border-gray-100">
        <option value="">Garagens</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
      </FilterSelect>

      <FilterSelect Icon={SlidersHorizontal} value={filters.sortBy} onChange={handleSortByChange} className="bg-gray-50 border-gray-100">
        <option value="recent">Mais Recentes</option>
        <option value="price_asc">Preço: Menor</option>
        <option value="price_desc">Preço: Maior</option>
        <option value="area">Maior Ãrea</option>
      </FilterSelect>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      <motion.div
        className="max-w-7xl mx-auto px-4 w-full pb-20 pt-20"
      >
        <div className="w-full">
          {properties.isLoading ? (
            <LoadingState.LoadingGrid viewMode="grid" />
          ) : (
            <PropertyComparison properties={sortedProperties || []}>
                  <RecentlyViewedProperties allProperties={sortedProperties || []} />
                  <div className="flex flex-col items-center md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedProperties?.map((property, index) => (
                  <PropertyCardItem key={property.id} property={property} index={index} onQuickView={setQuickViewProperty} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
                  >
                    Carregar Mais ({sortedProperties.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </PropertyComparison>
          )}
        </div>

        {/* Empty State */}
        <AnimatePresence>
          {sortedProperties?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Tente ajustar seus filtros de busca ou remover algumas restrições para encontrar o que procura.
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-medium shadow-lg hover:shadow-orange-500/20"
              >
                Limpar todos os filtros
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Botão Flutuante (Abre o Painel) */}
      <AnimatePresence>
        {(isSticky || (typeof window !== 'undefined' && window.innerWidth < 768)) && !showFilterModal && (
          <motion.button
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilterModal(true)}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-40 p-4 bg-orange-600 text-white rounded-2xl shadow-2xl backdrop-blur-md hover:bg-orange-700 transition-all flex flex-col items-center gap-2 cursor-pointer border border-white/20"
          >
            <SlidersHorizontal size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider writing-mode-vertical">Filtros</span>
            {sortedProperties?.length > 0 && (
              <span className="absolute -top-2 -left-2 bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                {sortedProperties?.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* PAINEL LATERAL DE FILTROS (SEM OVERLAY) */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-[320px] max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header do Painel */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100/50 bg-white/50">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                  <SlidersHorizontal size={18} />
                </div>
                <span>Filtros</span>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo Scrollavel */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pesquisas Salvas</h4>
                  <div className="space-y-1">
                    {savedSearches.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                        <button
                          onClick={() => {
                            setFilters(prev => ({ ...prev, ...s.filters }));
                            setShowFilterModal(false);
                          }}
                          className="text-xs font-medium text-purple-700 hover:text-purple-900 text-left"
                        >
                          {s.name}
                        </button>
                        <button
                          onClick={() => removeSearch(s.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="border-b border-gray-100 my-3" />
                </div>
              )}
              <FilterGrid isModal={true} />
            </div>

            {/* Footer Compacto */}
            <div className="p-4 border-t border-gray-100/50 bg-gray-50/50 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={saveSearchName}
                  onChange={e => setSaveSearchName(e.target.value)}
                  placeholder="Nome da pesquisa..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
                <button
                  onClick={() => {
                    if (saveSearchName.trim()) {
                      const activeFilters: Record<string, string> = {};
                      Object.entries(filters).forEach(([k, v]) => {
                        if (v && v !== 'recent') activeFilters[k] = v;
                      });
                      saveSearch(saveSearchName.trim(), activeFilters);
                      setSaveSearchName('');
                    }
                  }}
                  disabled={!saveSearchName.trim()}
                  className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                  Limpar
                </button>
                <div className="text-xs font-medium text-gray-500">
                  <strong className="text-gray-900 text-sm">{sortedProperties?.length}</strong> imóveis
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {quickViewProperty && (
        <QuickViewModal property={quickViewProperty} onClose={() => setQuickViewProperty(null)} />
      )}
    </div>
  );
};

function PropertyCardItem({ property, index, onQuickView }: { property: any; index: number; onQuickView?: (p: any) => void }) {
  const { selectionMode, selectedIds, toggleSelect } = useCompare();
  const isSelected = selectedIds.includes(property.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: selectionMode ? -4 : -8 }}
      onClick={(e) => {
        if (selectionMode) {
          e.preventDefault();
          e.stopPropagation();
          toggleSelect(property.id);
        }
      }}
      className={`w-full flex justify-center relative cursor-pointer transition-all ${selectionMode ? (isSelected ? 'ring-2 ring-purple-500 rounded-[24px] ring-offset-2' : 'ring-1 ring-gray-200 rounded-[24px] ring-offset-1 hover:ring-purple-300') : ''}`}
    >
      {selectionMode && (
        <div className="absolute top-3 left-3 z-10">
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors ${isSelected ? 'bg-purple-700 border-purple-700' : 'bg-white/90 border-gray-300'}`}>
            {isSelected && <Check size={16} className="text-white" />}
          </div>
        </div>
      )}
      <PropertyCard property={property} isClickable={!selectionMode} onQuickView={onQuickView ? () => onQuickView(property) : undefined} footerAction={
        <div className="flex flex-col gap-2">
          <PropertyAiChat property={property} className="w-full h-10 rounded-xl text-xs" />
          {!selectionMode ? (
            <Link
              href={property.slug ? `/propriedades/${property.slug}` : `/propriedades/${property.id}`}
              className="w-full bg-white border-2 border-[#820AD1] text-[#820AD1] hover:bg-purple-50 font-bold py-3 px-4 rounded-button text-center transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm text-sm"
            >
              <span>Ver Detalhes</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          ) : (
            <div className="w-full bg-gray-50 border-2 border-gray-200 text-gray-400 font-bold py-3 px-4 rounded-button text-center flex items-center justify-center gap-2 cursor-default">
              <span>Ver Detalhes</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>
      } />
    </motion.div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <PropertyListing />
    </Suspense>
  );
}




