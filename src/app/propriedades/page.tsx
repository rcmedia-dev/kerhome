'use client'

import React, { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  Search
} from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { useQuery } from '@tanstack/react-query';
import { getMixedProperties, getProperties } from '@/lib/functions/get-properties';
import { motion, Variants, Transition, AnimatePresence } from 'framer-motion';

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
  const [filters, setFilters] = useState({
    status: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    garagens: '',
    tipo: '',
    sortBy: 'recent'
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
      sortBy: 'recent'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'recent');

  // Properties from supabase
  const properties = useQuery({
    queryKey: ['properties', 'mixed'],
    queryFn: async () => {
      const response = await getMixedProperties();
      return response.properties; // ← Retorna array no formato propertyResponseSchema
    }
  });

  // 🔍 Funções de debounce para localização e preços
  const updateFilterLocation = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, location: value }));
  }, 350);

  const updateFilterMinPrice = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, minPrice: value }));
  }, 350);

  const updateFilterMaxPrice = useDebouncedCallback((value: string) => {
    setFilters(prev => ({ ...prev, maxPrice: value }));
  }, 350);

  // 🎯 Handlers para inputs com debounce - useCallback para manter referência estável
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
  }, []);

  const handleTipoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, tipo: e.target.value }));
  }, []);

  const handleBedroomsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, bedrooms: e.target.value }));
  }, []);

  const handleBathroomsChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, bathrooms: e.target.value }));
  }, []);

  const handleGaragensChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, garagens: e.target.value }));
  }, []);

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  }, []);

  // 🔍 FILTRAGEM NO FRONTEND
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
    } = filters;

    const matchesStatus = !status || property.status === status;
    const matchesTipo = !tipo || property.tipo === tipo;
    const matchesLocation = !location ||
      property.endereco?.toLowerCase().includes(location.toLowerCase());
    const matchesBedrooms = !bedrooms || property.bedrooms >= Number(bedrooms);
    const matchesBathrooms = !bathrooms || property.bathrooms >= Number(bathrooms);
    const matchesGaragens = !garagens || property.garagens >= Number(garagens);
    const matchesMinPrice = !minPrice || property.price >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || property.price <= Number(maxPrice);

    return (
      matchesStatus &&
      matchesTipo &&
      matchesLocation &&
      matchesBedrooms &&
      matchesBathrooms &&
      matchesGaragens &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  // 🎯 ORDENAÇÃO
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
        <option value="area">Maior Área</option>
      </FilterSelect>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* 🌟 HERO SECTION MODERNA */}
      <div className="relative bg-[#130f25] text-white pt-20 pb-40 px-4 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Encontre o lugar que <br />
              você pode chamar de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">Lar.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light"
          >
            Explore milhares de imóveis à venda e para arrendar em Angola com a plataforma mais confiável do mercado.
          </motion.p>
        </div>
      </div>

      {/* 🔍 SEARCH CARD (INLINE) - Only visible when NOT scrolled past threshold is logically implied, but here we keep it in DOM */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-24 mb-16 w-full hidden md:block">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-6 md:p-8 backdrop-blur-xl"
        >
          {/* Header do Card de Busca */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-gray-800">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Search size={20} />
              </div>
              <span className="font-semibold text-lg">Filtrar Imóveis</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{sortedProperties?.length || 0}</span> resultados
              </div>
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={clearFilters}
                    className="text-xs font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    <X size={12} /> Limpar
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <FilterGrid />
        </motion.div>
      </div>

      {/* 🏘️ LISTAGEM DE IMÓVEIS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 w-full pb-20 pt-8 md:pt-0"
      >
        <motion.div
          variants={containerVariants}
          className="flex flex-col items-center md:grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {sortedProperties?.map((property, index) => (
            <motion.div
              key={property.id}
              variants={itemVariants}
              transition={{
                ...springTransition,
                delay: index * 0.05
              }}
              whileHover={{ y: -8 }}
              className="w-full flex justify-center"
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </motion.div>

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
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium shadow-lg hover:shadow-purple-500/20"
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
            className="fixed right-6 top-1/2 -translate-y-1/2 z-40 p-4 bg-gray-900/90 text-white rounded-2xl shadow-2xl backdrop-blur-md hover:bg-black transition-all flex flex-col items-center gap-2 cursor-pointer border border-white/10"
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

      {/* 🛑 PAINEL LATERAL DE FILTROS (SEM OVERLAY) 🛑 */}
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
                <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
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
              <FilterGrid isModal={true} />
            </div>

            {/* Footer Compacto */}
            <div className="p-4 border-t border-gray-100/50 bg-gray-50/50 flex justify-between items-center gap-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyListing;