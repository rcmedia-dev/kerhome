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
  LucideIcon
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
      className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-sm shadow-sm hover:shadow-md group-hover:border-purple-300 ${
        value ? 'border-purple-200 bg-purple-50' : ''
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
      className={`w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none bg-white text-sm shadow-sm hover:shadow-md group-hover:border-purple-300 ${
        value ? 'border-purple-200 bg-purple-50' : ''
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  console.log('Propriedades carregadas:', properties.data);

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

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30"
    >
      {/* Filtros - Desktop - Refinados */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springTransition}
        className={`${isSticky ? 'fixed top-0 left-0 right-0 z-40 shadow-lg bg-white/95 backdrop-blur-md border-b border-purple-100' : 'bg-white border-b border-gray-100'} transition-all duration-500 hidden lg:block`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <motion.div 
            className="flex items-center justify-between mb-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                variants={badgeVariants}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-full shadow-lg"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={16} className="text-yellow-200" />
                </motion.div>
                <span className="font-semibold text-sm">Filtros</span>
              </motion.div>
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={clearFilters}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200"
                  >
                    <X size={14} />
                    Limpar Filtros
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <motion.div 
              variants={badgeVariants}
              className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-semibold text-sm shadow-inner"
            >
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-purple-600 rounded-full"
              ></motion.span>
              {sortedProperties?.length} imóveis encontrados
            </motion.div>
          </motion.div>

          {/* Filtros em linha compacta - Melhorados */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-6 gap-3 mb-3"
          >
            <FilterSelect 
              Icon={Building}
              value={filters.tipo}
              onChange={handleTipoChange}
            >
              <option value="">Tipo de Imóvel</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="studio">Studio</option>
            </FilterSelect>

            <FilterSelect 
              Icon={TrendingUp}
              value={filters.status}
              onChange={handleStatusChange}
            >
              <option value="">Status</option>
              <option value="comprar">Venda</option>
              <option value="arrendar">Aluguel</option>
            </FilterSelect>

            {/* 🔄 INPUT DE LOCALIZAÇÃO COM DEBOUNCE - AGORA MANTÉM FOCO */}
            <FilterInput 
              Icon={MapPin}
              placeholder="Localização..."
              value={localLocation}
              onChange={handleLocalLocationChange}
            />

            <FilterSelect 
              Icon={Bed}
              value={filters.bedrooms}
              onChange={handleBedroomsChange}
            >
              <option value="">Quartos</option>
              <option value="1">1+ Quarto</option>
              <option value="2">2+ Quartos</option>
              <option value="3">3+ Quartos</option>
              <option value="4">4+ Quartos</option>
            </FilterSelect>

            <FilterSelect 
              Icon={Bath}
              value={filters.bathrooms}
              onChange={handleBathroomsChange}
            >
              <option value="">Banheiros</option>
              <option value="1">1+ Banheiro</option>
              <option value="2">2+ Banheiros</option>
              <option value="3">3+ Banheiros</option>
            </FilterSelect>

            <FilterSelect 
              Icon={Car}
              value={filters.garagens}
              onChange={handleGaragensChange}
            >
              <option value="">Garagens</option>
              <option value="1">1+ Vaga</option>
              <option value="2">2+ Vagas</option>
              <option value="3">3+ Vagas</option>
            </FilterSelect>
          </motion.div>

          {/* Filtros de preço em segunda linha - Melhorados */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.1 }}
            className="grid grid-cols-3 gap-3"
          >
            {/* 🔄 INPUT DE PREÇO MÍNIMO COM MÁSCARA DE MILHAR */}
            <FilterInput 
              Icon={DollarSign}
              type="text" // Mudei para text para aceitar a formatação
              placeholder="Preço mínimo"
              value={formattedMinPrice}
              onChange={handleLocalMinPriceChange}
            />
            
            {/* 🔄 INPUT DE PREÇO MÁXIMO COM MÁSCARA DE MILHAR */}
            <FilterInput 
              Icon={DollarSign}
              type="text" // Mudei para text para aceitar a formatação
              placeholder="Preço máximo"
              value={formattedMaxPrice}
              onChange={handleLocalMaxPriceChange}
            />
            
            <FilterSelect 
              Icon={SlidersHorizontal}
              value={filters.sortBy}
              onChange={handleSortByChange}
            >
              <option value="recent">Mais Recentes</option>
              <option value="price_asc">Preço: Menor → Maior</option>
              <option value="price_desc">Preço: Maior → Menor</option>
              <option value="area">Maior Área</option>
            </FilterSelect>
          </motion.div>
        </div>
      </motion.div>

      {/* Filtros - Mobile - Refinados */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={springTransition}
        className="lg:hidden bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.button 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm"
            >
              <SlidersHorizontal size={16} />
              <span>Filtros</span>
              <motion.div
                animate={{ rotate: showMobileFilters ? 180 : 0 }}
                transition={springTransition}
              >
                <ChevronDown size={14} />
              </motion.div>
            </motion.button>
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={clearFilters}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200"
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
              <motion.span 
                variants={badgeVariants}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-semibold text-xs shadow-inner"
              >
                {sortedProperties?.length}
              </motion.span>
            </div>
          </div>

          <AnimatePresence>
            {showMobileFilters && (
              <motion.div 
                variants={mobileFilterVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="pt-4 space-y-3 border-t border-gray-200 mt-3 overflow-hidden"
              >
                <motion.div 
                  variants={containerVariants}
                  className="grid grid-cols-2 gap-3"
                >
                  <FilterSelect 
                    Icon={Building}
                    value={filters.tipo}
                    onChange={handleTipoChange}
                  >
                    <option value="">Tipo</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apto</option>
                    <option value="studio">Studio</option>
                  </FilterSelect>

                  <FilterSelect 
                    Icon={TrendingUp}
                    value={filters.status}
                    onChange={handleStatusChange}
                  >
                    <option value="">Status</option>
                    <option value="comprar">Venda</option>
                    <option value="arrendar">Aluguel</option>
                  </FilterSelect>
                </motion.div>

                {/* 🔄 INPUT DE LOCALIZAÇÃO MOBILE COM DEBOUNCE - AGORA MANTÉM FOCO */}
                <FilterInput 
                  Icon={MapPin}
                  placeholder="Onde buscar?"
                  value={localLocation}
                  onChange={handleLocalLocationChange}
                />

                <motion.div 
                  variants={containerVariants}
                  className="grid grid-cols-3 gap-3"
                >
                  <FilterSelect 
                    Icon={Bed}
                    value={filters.bedrooms}
                    onChange={handleBedroomsChange}
                  >
                    <option value="">Quartos</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </FilterSelect>

                  <FilterSelect 
                    Icon={Bath}
                    value={filters.bathrooms}
                    onChange={handleBathroomsChange}
                  >
                    <option value="">Banhos</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </FilterSelect>

                  <FilterSelect 
                    Icon={Car}
                    value={filters.garagens}
                    onChange={handleGaragensChange}
                  >
                    <option value="">Garagens</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </FilterSelect>
                </motion.div>

                <motion.div 
                  variants={containerVariants}
                  className="grid grid-cols-2 gap-3"
                >
                  {/* 🔄 INPUT DE PREÇO MÍNIMO MOBILE COM MÁSCARA DE MILHAR */}
                  <FilterInput 
                    Icon={DollarSign}
                    type="text"
                    placeholder="Preço mínimo"
                    value={formattedMinPrice}
                    onChange={handleLocalMinPriceChange}
                  />
                  
                  {/* 🔄 INPUT DE PREÇO MÁXIMO MOBILE COM MÁSCARA DE MILHAR */}
                  <FilterInput 
                    Icon={DollarSign}
                    type="text"
                    placeholder="Preço máximo"
                    value={formattedMaxPrice}
                    onChange={handleLocalMaxPriceChange}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Espaço para quando os filtros ficam fixos */}
      {isSticky && <div className="h-28 lg:h-32"></div>}

      {/* Grid de Propriedades - Refinado */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <motion.div 
          variants={containerVariants}
          className="flex flex-col items-center md:grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sortedProperties?.map((property, index) => (
            <motion.div
              key={property.id}
              variants={itemVariants}
              transition={{
                ...springTransition,
                delay: index * 0.1
              }}
              whileHover={{ 
                y: -5,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }
              }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mensagem quando não há resultados */}
        <AnimatePresence>
          {sortedProperties?.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-lg font-medium mb-4">
                Nenhum imóvel encontrado com os filtros atuais
              </div>
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={clearFilters}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Limpar Filtros
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PropertyListing;