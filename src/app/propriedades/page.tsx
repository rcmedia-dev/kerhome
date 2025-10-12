'use client'

import React, { useState, useEffect, ReactNode } from 'react';
import { 
  Search, 
  Home, 
  Building2, 
  Bed, 
  Bath, 
  Car, 
  MapPin, 
  ChevronDown, 
  SlidersHorizontal,
  DollarSign,
  Filter,
  X,
  Building,
  TrendingUp,
  Sparkles,
  LucideIcon
} from 'lucide-react';
import { PropertyCard } from '@/components/property-card';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/lib/actions/get-properties';

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
  
  const [isSticky, setIsSticky] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== '' && value !== 'recent');

  //properties from supabase
  const properties = useQuery({
    queryKey: ['properties'],
    queryFn: async() => {
      const response = await getProperties()
      return response
    }
  })

  console.log({properties})

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(price);
  };

  type FilterInputProps = {
    Icon: LucideIcon;
    placeholder: string;
    value: string | number;
    onChange: (e: any) => void;
    type?: string;
    className?: string;
  }

  const FilterInput = ({ Icon, placeholder, value, onChange, type = 'text', className = '' }: FilterInputProps ) => (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-purple-600">
        <Icon size={16} className="text-gray-400 group-focus-within:text-purple-600" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white text-sm shadow-sm hover:shadow-md group-hover:border-purple-300 ${
          value ? 'border-purple-200 bg-purple-50' : ''
        } ${className}`}
        value={value}
        onChange={onChange}
      />
    </div>
  );

  type SelectFilterProps = {
    Icon: LucideIcon;
    value: string | number;
    onChange: (e: any) => void;
    children: ReactNode;
    className?: string;
  }

  const FilterSelect = ({ Icon, value, onChange, children, className = '' }: SelectFilterProps) => (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-purple-600">
        <Icon size={16} className="text-gray-400 group-focus-within:text-purple-600" />
      </div>
      <select
        className={`w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none bg-white text-sm shadow-sm hover:shadow-md group-hover:border-purple-300 ${
          value ? 'border-purple-200 bg-purple-50' : ''
        } ${className}`}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDown size={14} className="text-gray-400 transition-transform duration-200 group-hover:scale-110" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Filtros - Desktop - Refinados */}
      <div className={`${isSticky ? 'fixed top-0 left-0 right-0 z-40 shadow-lg bg-white/95 backdrop-blur-md border-b border-purple-100' : 'bg-white border-b border-gray-100'} transition-all duration-500 hidden lg:block`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-full shadow-lg">
                <Sparkles size={16} className="text-yellow-200" />
                <span className="font-semibold text-sm">Filtros</span>
              </div>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105 border border-red-200"
                >
                  <X size={14} />
                  Limpar Filtros
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-semibold text-sm shadow-inner">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
              {properties?.data?.length} imóveis encontrados
            </div>
          </div>

          {/* Filtros em linha compacta - Melhorados */}
          <div className="grid grid-cols-6 gap-3 mb-3">
            <FilterSelect 
              Icon={Building}
              value={filters.tipo}
              onChange={(e) => setFilters({...filters, tipo: e.target.value})}
            >
              <option value="">Tipo de Imóvel</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="studio">Studio</option>
            </FilterSelect>

            <FilterSelect 
              Icon={TrendingUp}
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Status</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </FilterSelect>

            <FilterInput 
              Icon={MapPin}
              placeholder="Localização..."
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />

            <FilterSelect 
              Icon={Bed}
              value={filters.bedrooms}
              onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
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
              onChange={(e) => setFilters({...filters, bathrooms: e.target.value})}
            >
              <option value="">Banheiros</option>
              <option value="1">1+ Banheiro</option>
              <option value="2">2+ Banheiros</option>
              <option value="3">3+ Banheiros</option>
            </FilterSelect>

            <FilterSelect 
              Icon={Car}
              value={filters.garagens}
              onChange={(e) => setFilters({...filters, garagens: e.target.value})}
            >
              <option value="">Garagens</option>
              <option value="1">1+ Vaga</option>
              <option value="2">2+ Vagas</option>
              <option value="3">3+ Vagas</option>
            </FilterSelect>
          </div>

          {/* Filtros de preço em segunda linha - Melhorados */}
          <div className="grid grid-cols-3 gap-3">
            <FilterInput 
              Icon={DollarSign}
              type="number"
              placeholder="Preço mínimo"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            />
            <FilterInput 
              Icon={DollarSign}
              type="number"
              placeholder="Preço máximo"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
            <FilterSelect 
              Icon={SlidersHorizontal}
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="recent">Mais Recentes</option>
              <option value="price_asc">Preço: Menor → Maior</option>
              <option value="price_desc">Preço: Maior → Menor</option>
              <option value="area">Maior Área</option>
            </FilterSelect>
          </div>
        </div>
      </div>

      {/* Filtros - Mobile - Refinados */}
      <div className="lg:hidden bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium text-sm"
            >
              <SlidersHorizontal size={16} />
              <span>Filtros</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 border border-red-200"
                >
                  <X size={16} />
                </button>
              )}
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-semibold text-xs shadow-inner">
                {properties?.data?.length}
              </span>
            </div>
          </div>

          {showMobileFilters && (
            <div className="pt-4 space-y-3 animate-in fade-in duration-300 border-t border-gray-200 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <FilterSelect 
                  Icon={Building}
                  value={filters.tipo}
                  onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                >
                  <option value="">Tipo</option>
                  <option value="casa">Casa</option>
                  <option value="apartamento">Apto</option>
                  <option value="studio">Studio</option>
                </FilterSelect>

                <FilterSelect 
                  Icon={TrendingUp}
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">Status</option>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </FilterSelect>
              </div>

              <FilterInput 
                Icon={MapPin}
                placeholder="Onde buscar?"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />

              <div className="grid grid-cols-3 gap-3">
                <FilterSelect 
                  Icon={Bed}
                  value={filters.bedrooms}
                  onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                >
                  <option value="">Quartos</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </FilterSelect>

                <FilterSelect 
                  Icon={Bath}
                  value={filters.bathrooms}
                  onChange={(e) => setFilters({...filters, bathrooms: e.target.value})}
                >
                  <option value="">Banhos</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </FilterSelect>

                <FilterSelect 
                  Icon={Car}
                  value={filters.garagens}
                  onChange={(e) => setFilters({...filters, garagens: e.target.value})}
                >
                  <option value="">Garagens</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </FilterSelect>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FilterInput 
                  Icon={DollarSign}
                  type="number"
                  placeholder="Preço mínimo"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                />
                <FilterInput 
                  Icon={DollarSign}
                  type="number"
                  placeholder="Preço máximo"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Espaço para quando os filtros ficam fixos */}
      {isSticky && <div className="h-28 lg:h-32"></div>}

      {/* Grid de Propriedades - Refinado */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.data?.map((property) => (
            <PropertyCard key={property.id} property={property}/>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyListing;