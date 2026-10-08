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
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getMixedProperties, getProperties } from '@/lib/functions/get-properties';
import { motion, Variants, Transition, AnimatePresence } from 'framer-motion';
import LoadingState from './components/loading-state';
import { RecentlyViewedProperties } from '@/components/recently-viewed-properties';
import { QuickViewModal } from '@/components/quick-view-modal';
import { PropertyAiChat } from '@/components/property-ai-chat';
import { useSavedSearches } from '@/hooks/use-saved-searches';
import { useTrackEvent } from '@/hooks/use-track-event';
import { formatPriceWithDots } from '@/lib/format-price';

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
  return formatPriceWithDots(Number(numbersOnly)).replace(/\.00$/, '');
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
      <Icon size={16} className="text-gray-500 group-focus-within:text-purple-600" />
    </div>
    <motion.input
      type={type}
      placeholder={placeholder}
      className={`w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white text-sm shadow-sm hover:shadow-md hover:border-gray-400 ${value ? 'border-purple-400 bg-purple-50' : ''
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
      <Icon size={16} className="text-gray-500 group-focus-within:text-purple-600" />
    </div>
    <motion.select
      className={`w-full pl-10 pr-8 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 appearance-none bg-white text-sm shadow-sm hover:shadow-md hover:border-gray-400 ${value ? 'border-purple-400 bg-purple-50' : ''
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
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();
  const pathname = usePathname();
  const isSyncingFromUrl = useRef(false);
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
  const [localQ, setLocalQ] = useState(filters.q || '');

  // Estados para os valores formatados (com máscara)
  const [formattedMinPrice, setFormattedMinPrice] = useState('');
  const [formattedMaxPrice, setFormattedMaxPrice] = useState('');

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [quickViewProperty, setQuickViewProperty] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(9);
  const ITEMS_PER_PAGE = 6;
  const { searches: savedSearches, remove: removeSearch } = useSavedSearches();
  const { track } = useTrackEvent();
  const lastTrackedFilters = useRef('');

  // Funil: pesquisa / filtros aplicados (debounced pelo efeito abaixo)

  // Sincroniza estados locais quando filters muda externamente (ex: clearFilters)
  useEffect(() => {
    setLocalLocation(filters.location || '');
    setLocalQ(filters.q || '');

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
  }, [filters.location, filters.minPrice, filters.maxPrice, filters.q]);

  const [searchBanner, setSearchBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParamsStr) return;
    const params = new URLSearchParams(searchParamsStr);
    const tipo = params.get('tipo');
    const cidade = params.get('cidade');
    const location = params.get('location') || cidade;
    const preco_max = params.get('preco_max') || params.get('maxPrice');
    const preco_min = params.get('preco_min') || params.get('minPrice');
    const quartos = params.get('quartos') || params.get('bedrooms');
    const banheiros = params.get('banheiros') || params.get('bathrooms');
    const garagensParam = params.get('garagens');
    const status = params.get('status');
    const sortBy = params.get('sort');
    const q = params.get('q');

    const newFilters: Record<string, string> = {};
    if (tipo) newFilters.tipo = tipo;
    if (location) newFilters.location = location;
    if (preco_max) newFilters.maxPrice = preco_max;
    if (preco_min) newFilters.minPrice = preco_min;
    if (quartos) newFilters.bedrooms = quartos;
    if (banheiros) newFilters.bathrooms = banheiros;
    if (garagensParam) newFilters.garagens = garagensParam;
    if (status) newFilters.status = status;
    if (sortBy) newFilters.sortBy = sortBy;
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
    if (location) parts.push(`em ${location}`);
    if (preco_max) parts.push(`até Kz ${formatPriceWithDots(Number(preco_max)).replace(/\.00$/, '')}`);
    if (parts.length > 0) setSearchBanner(parts.join(' '));
    isSyncingFromUrl.current = true;
    const t = window.setTimeout(() => { isSyncingFromUrl.current = false; }, 500);
    return () => window.clearTimeout(t);
  }, [searchParamsStr]);

  // Preserva pesquisa e filtros na URL para partilha (não inclui valores padrão)
  useEffect(() => {
    if (isSyncingFromUrl.current) return;
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.tipo) params.set('tipo', filters.tipo);
    if (filters.location) params.set('location', filters.location);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (filters.bathrooms) params.set('bathrooms', filters.bathrooms);
    if (filters.garagens) params.set('garagens', filters.garagens);
    if (filters.q) params.set('q', filters.q);
    if (filters.sortBy && filters.sortBy !== 'recent') params.set('sort', filters.sortBy);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.tipo, filters.location, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.bathrooms, filters.garagens, filters.q, filters.sortBy]);

  useEffect(() => {
    const key = JSON.stringify(filters);
    if (key === lastTrackedFilters.current) return;
    lastTrackedFilters.current = key;
    const t = window.setTimeout(() => {
      track({ event_type: 'search', entity_type: 'pesquisa', entity_id: 'listing', metadata: { ...filters } as any });
    }, 800);
    return () => window.clearTimeout(t);
  }, [filters, track]);

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
    setSearchBanner(null);
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'recent');
  const activeFiltersCount = React.useMemo(() => {
    return Object.entries(filters).filter(([key, val]) => {
      if (key === 'sortBy') return false;
      return Boolean(val);
    }).length;
  }, [filters]);

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

  // Funções de debounce para pesquisa, localização e preços
  const updateFilterQ = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, q: value }));
    setVisibleCount(9);
  }, 350);

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

  // Handlers para inputs com debounce - useCallback para manter referência estável
  const handleLocalQChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQ(value);
    updateFilterQ(value);
  }, [updateFilterQ]);

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

  // FILTRAGEM NO FRONTEND
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

    // Status: flexível com variações comuns (comprar/venda, arrendar/alugar)
    const matchesStatus = !status || (() => {
      const pStatus = (property.status || '').toLowerCase().trim();
      const s = status.toLowerCase().trim();
      if (s === 'comprar' || s === 'venda') {
        return pStatus.includes('comprar') || pStatus.includes('venda');
      }
      if (s === 'arrendar' || s === 'alugar' || s === 'arrendamento' || s === 'aluguel') {
        return pStatus.includes('arrend') || pStatus.includes('alug');
      }
      return pStatus === s || pStatus.includes(s) || s.includes(pStatus);
    })();

    // Tipo: flexível (casa abrange vivenda e moradia; apartamento abrange studio/flat/t1..t4)
    const matchesTipo = !tipo || (() => {
      const pTipo = (property.tipo || '').toLowerCase().trim();
      const t = tipo.toLowerCase().trim();
      if (t === 'casa') {
        return pTipo.includes('casa') || pTipo.includes('vivenda') || pTipo.includes('moradia');
      }
      if (t === 'apartamento') {
        return pTipo.includes('apart') || pTipo.startsWith('t') || pTipo.includes('flat') || pTipo.includes('duplex');
      }
      return pTipo.includes(t) || t.includes(pTipo);
    })();

    // Localização: busca em endereço, bairro, cidade, município e província
    const matchesLocation = !location || (() => {
      const loc = location.toLowerCase().trim();
      const fullLoc = [
        property.endereco,
        property.bairro,
        property.cidade,
        property.municipio,
        property.provincia,
        property.pais,
        property.localizacao
      ].filter(Boolean).join(' ').toLowerCase();
      return fullLoc.includes(loc);
    })();

    const matchesBedrooms = !bedrooms || Number(property.bedrooms || 0) >= Number(bedrooms);
    const matchesBathrooms = !bathrooms || Number(property.bathrooms || 0) >= Number(bathrooms);
    const matchesGaragens = !garagens || Number(property.garagens || 0) >= Number(garagens);

    const propPrice = property.price != null ? Number(property.price) : 0;
    const matchesMinPrice = !minPrice || propPrice >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || (propPrice > 0 && propPrice <= Number(maxPrice));

    const matchesQ = !q || (() => {
      const keywords = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (keywords.length === 0) return true;
      const text = `${property.title || ''} ${property.description || ''} ${property.tipo || ''} ${property.bairro || ''} ${property.cidade || ''}`.toLowerCase();
      return keywords.every(kw => text.includes(kw));
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

  // ORDENAÇÃO
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
        className="bg-white border-gray-300 focus:bg-white"
      />

      <FilterSelect Icon={Building} value={filters.tipo} onChange={handleTipoChange} className="bg-white border-gray-300">
        <option value="">Tipo de Imóvel (Todos)</option>
        <option value="casa">Casa / Vivenda</option>
        <option value="apartamento">Apartamento</option>
        <option value="terreno">Terreno</option>
        <option value="escritorio">Escritório</option>
        <option value="studio">Studio</option>
      </FilterSelect>

      <FilterSelect Icon={TrendingUp} value={filters.status} onChange={handleStatusChange} className="bg-white border-gray-300">
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
          className="bg-white border-gray-300"
        />
        <FilterInput
          Icon={DollarSign}
          type="text"
          placeholder="Máx"
          value={formattedMaxPrice}
          onChange={handleLocalMaxPriceChange}
          className="bg-white border-gray-300"
        />
      </div>

      <FilterSelect Icon={Bed} value={filters.bedrooms} onChange={handleBedroomsChange} className="bg-white border-gray-300">
        <option value="">Quartos</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </FilterSelect>

      <FilterSelect Icon={Bath} value={filters.bathrooms} onChange={handleBathroomsChange} className="bg-white border-gray-300">
        <option value="">Banheiros</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
      </FilterSelect>

      <FilterSelect Icon={Car} value={filters.garagens} onChange={handleGaragensChange} className="bg-white border-gray-300">
        <option value="">Garagens</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
      </FilterSelect>

      <FilterSelect Icon={SlidersHorizontal} value={filters.sortBy} onChange={handleSortByChange} className="bg-white border-gray-300">
        <option value="recent">Mais Recentes</option>
        <option value="price_asc">Preço: Menor</option>
        <option value="price_desc">Preço: Maior</option>
        <option value="area">Maior Área</option>
      </FilterSelect>
    </div>
  );

  // Corpo partilhado do painel de filtros (sidebar desktop + bottom-sheet mobile)
  const FilterPanelBody = ({ onApply }: { onApply?: () => void }) => (
    <div className="space-y-4">
      {/* Pesquisa livre: tipo, título, descrição, bairro, cidade */}
      <FilterInput
        Icon={Search}
        placeholder="Pesquisar (ex: vivenda, Kilamba...)"
        value={localQ}
        onChange={handleLocalQChange}
        className="bg-white border-gray-300"
      />
      {savedSearches.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pesquisas Salvas</h4>
          <div className="space-y-1">
            {savedSearches.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-orange-50/60 rounded-lg px-3 py-2">
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, ...s.filters }));
                    onApply?.();
                  }}
                  className="text-xs font-medium text-orange-700 hover:text-orange-900 text-left"
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
      {/* NOTA: invocado como função (não como <Componente />) para preservar o foco dos inputs —
          como é redefinido a cada render, usá-lo como componente faria o React desmontar/remontar os campos a cada tecla */}
      {FilterGrid({ isModal: true })}

      <div className="flex justify-between items-center pt-1">
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          Limpar filtros
        </button>
        <div className="text-xs font-medium text-gray-500">
          <strong className="text-gray-900 text-sm">{sortedProperties?.length}</strong> imóveis encontrados
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      <motion.div
        className="max-w-[1440px] mx-auto px-4 w-full pb-20 pt-4 lg:pt-20"
      >
        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 lg:items-start">
          {/* Sidebar de filtros fixa (desktop) */}
          <aside className="hidden lg:block sticky top-24 h-fit max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar bg-white rounded-2xl border-2 border-gray-400 shadow-md">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-gray-200 bg-gray-50/80 sticky top-0 z-10 rounded-t-2xl">
                <div className="flex items-center gap-2 font-bold text-gray-800">
                  <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                    <SlidersHorizontal size={18} />
                  </div>
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                      {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                {FilterPanelBody({})}
              </div>
          </aside>

          {/* Coluna de resultados */}
          <div className="w-full min-w-0">
            {/* Barra de ferramentas fixa e colada ao topo do viewport (mobile / tablet) */}
            <div className="lg:hidden sticky top-0 z-50 -mx-4 px-4 py-2 bg-gray-50/95 backdrop-blur-sm flex items-center gap-2 mb-4 border-b border-gray-200">
              <button
                onClick={() => setShowFilterModal(true)}
                aria-label={`Abrir filtros de busca (${sortedProperties?.length || 0} imóveis)`}
                className="relative flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-gray-300 rounded-xl font-bold text-sm text-gray-800 shadow-md active:scale-[0.98] transition-all"
              >
                <SlidersHorizontal size={16} className="text-orange-600" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-orange-600 text-white min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="text-xs font-medium text-gray-600 bg-white border-2 border-gray-300 rounded-xl px-3 py-3 whitespace-nowrap shadow-md">
                <strong className="text-gray-900">{sortedProperties?.length || 0}</strong> imóveis
              </div>
            </div>

            {searchBanner && (
              <div className="flex items-center justify-between gap-2 mb-4 px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-xl text-sm text-purple-800">
                <span className="font-medium truncate">{searchBanner}</span>
                <button
                  onClick={() => { clearFilters(); setSearchBanner(null); }}
                  aria-label="Limpar pesquisa"
                  className="p-1 hover:bg-purple-100 rounded-full transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          {properties.isLoading ? (
            <LoadingState.LoadingGrid viewMode="grid" />
          ) : (
            <PropertyComparison properties={sortedProperties || []}>
                  <RecentlyViewedProperties allProperties={sortedProperties || []} />
                  <div className="flex flex-col items-center sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
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

        {/* Empty State */}
        <AnimatePresence>
          {sortedProperties?.length === 0 && !properties.isLoading && (
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
          </div>
        </div>
      </motion.div>

      {/* Bottom-sheet de filtros (mobile / tablet — no desktop usa a sidebar) */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="lg:hidden">
            <motion.button
              type="button"
              aria-label="Fechar filtros"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 z-[70] bg-white border-t border-gray-100 rounded-t-3xl shadow-2xl w-full max-h-[88vh] flex flex-col overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-gray-200" />
            {/* Header do Painel */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100/50 bg-white/80">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                  <SlidersHorizontal size={18} />
                </div>
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                    {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo Scrollavel */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              {FilterPanelBody({ onApply: () => setShowFilterModal(false) })}
            </div>

            {/* Footer com Botão de Ação */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/80">
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/25 transition-all flex items-center justify-center gap-2"
              >
                <SlidersHorizontal size={16} />
                <span>Ver {sortedProperties?.length || 0} {sortedProperties?.length === 1 ? 'imóvel' : 'imóveis'}</span>
              </button>
            </div>
            </motion.div>
          </div>
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
      className={`w-full flex justify-center relative cursor-pointer transition-all ${selectionMode ? (isSelected ? 'ring-2 ring-purple-500 rounded-3xl ring-offset-2' : 'ring-1 ring-gray-200 ring-offset-1 hover:ring-purple-300') : ''}`}
    >
      {selectionMode && (
        <div className="absolute top-3 left-3 z-10">
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors ${isSelected ? 'bg-purple-700 border-purple-700' : 'bg-white/90 border-gray-300'}`}>
            {isSelected && <Check size={16} className="text-white" />}
          </div>
        </div>
      )}
      <PropertyCard property={property} isClickable={!selectionMode} onQuickView={onQuickView ? () => onQuickView(property) : undefined} footerAction={
        <div className="flex gap-2">
          <div className="w-[80%]">
            {!selectionMode ? (
              <Link
                href={property.slug ? `/propriedades/${property.slug}` : `/propriedades/${property.id}`}
                className="w-full bg-[#820AD1] hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-button text-center transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm text-sm cursor-pointer"
              >
                <span>Ver Detalhes</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            ) : (
              <div className="w-full bg-gray-100 text-gray-400 font-bold py-3 px-4 rounded-button text-center flex items-center justify-center gap-2 cursor-default">
                <span>Ver Detalhes</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="w-[20%]">
            <PropertyAiChat property={property} variant="bubble" className="w-full h-full rounded-xl text-xs px-0" />
          </div>
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




