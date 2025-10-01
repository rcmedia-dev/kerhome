'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { getProperties } from '@/lib/actions/get-properties';
import { TPropertyResponseSchema } from '@/lib/types/property';
import {
  X,
  SlidersHorizontal,
  MapPin,
  Home,
  Building,
  Store,
  MapPinHouse,
  BanknoteArrowUp,
  BanknoteArrowDown,
  Banknote,
  Check,
} from "lucide-react";

import HeaderControls from './components/header-controls';
import PropertiesGrid from './components/properties-grid';

export interface Filters {
  status: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  garagens: number;
  tipo: string;
  sortBy: string;
}

export default function PropertiesPageExpanded() {
  const [filteredProperties, setFilteredProperties] = useState<TPropertyResponseSchema[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // React Hook Form
  const methods = useForm<Filters>({
    defaultValues: {
      status: '',
      minPrice: 0,
      maxPrice: 500000000,
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      garagens: 0,
      tipo: '',
      sortBy: 'recent',
    },
  });

  const { watch, reset, control, setValue } = methods;

  // Observa apenas os campos necessários (exceto os que agora têm botão aplicar)
  const status = watch('status');
  const bedrooms = watch('bedrooms');
  const bathrooms = watch('bathrooms');
  const garagens = watch('garagens');
  const tipo = watch('tipo');
  const sortBy = watch('sortBy');
  const filters = watch();

  // Fetch properties
  const { data: properties = [], isLoading } = useQuery<TPropertyResponseSchema[]>({
    queryKey: ['properties'],
    queryFn: getProperties,
  });

  // Aplicar filtros
  useEffect(() => {
    if (!properties) return;

    let filtered = [...properties];

    if (status) filtered = filtered.filter(p => p.status === status);
    if (filters.minPrice > 0) filtered = filtered.filter(p => (p.price ?? 0) >= filters.minPrice);
    if (filters.maxPrice < 500000000) filtered = filtered.filter(p => (p.price ?? 0) <= filters.maxPrice);
    if (filters.location) {
      filtered = filtered.filter(p =>
        (p.cidade ?? '').toLowerCase().includes(filters.location.toLowerCase()) ||
        (p.bairro ?? '').toLowerCase().includes(filters.location.toLowerCase()) ||
        (p.provincia ?? '').toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (bedrooms > 0) filtered = filtered.filter(p => (p.bedrooms ?? 0) >= bedrooms);
    if (bathrooms > 0) filtered = filtered.filter(p => (p.bathrooms ?? 0) >= bathrooms);
    if (garagens > 0) filtered = filtered.filter(p => (p.garagens ?? 0) >= garagens);
    if (tipo) filtered = filtered.filter(p => p.tipo === tipo);

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime());
        break;
      case 'size':
        filtered.sort((a, b) => (Number(b.size) ?? 0) - (Number(a.size) ?? 0));
        break;
      case 'bedrooms':
        filtered.sort((a, b) => (b.bedrooms ?? 0) - (a.bedrooms ?? 0));
        break;
    }

    setFilteredProperties(filtered.slice(0, page * 12));
    setHasMore(filtered.length > page * 12);
  }, [
    status,
    filters.minPrice,
    filters.maxPrice,
    filters.location,
    bedrooms,
    bathrooms,
    garagens,
    tipo,
    sortBy,
    properties,
    page,
  ]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 200 &&
        hasMore && !loadingMore
      ) {
        setLoadingMore(true);
        setTimeout(() => {
          setPage(prev => prev + 1);
          setLoadingMore(false);
        }, 600);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore]);

  // Resetar filtros
  const resetFilters = () => {
    reset({
      status: '',
      minPrice: 0,
      maxPrice: 500000000,
      location: '',
      bedrooms: 0,
      bathrooms: 0,
      garagens: 0,
      tipo: '',
      sortBy: 'recent',
    });
  };

  // Funções auxiliares para formatação de moeda
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-AO", { minimumFractionDigits: 0 }).format(value);
  }

  // Componente para inputs de preço com botão aplicar
  const PriceInputWithApply = ({ 
    name, 
    placeholder, 
    icon 
  }: { 
    name: 'minPrice' | 'maxPrice';
    placeholder: string;
    icon: React.ReactNode;
  }) => {
    const [localValue, setLocalValue] = useState("");
    const currentValue = watch(name);

    const handleApply = () => {
      const numericValue = localValue ? parseInt(localValue.replace(/\D/g, "")) : 0;
      setValue(name, numericValue);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          {icon}
          <input
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");
              setLocalValue(rawValue);
            }}
            onBlur={() => {
              if (localValue) {
                setLocalValue(formatCurrency(parseInt(localValue)));
              }
            }}
            onFocus={() => {
              if (localValue) {
                setLocalValue(localValue.replace(/\D/g, ""));
              }
            }}
            className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-300 
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            placeholder={placeholder}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!localValue}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            localValue 
              ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Check size={16} />
          Aplicar Filtro
        </button>
        {currentValue > 0 && (
          <p className="text-xs text-gray-600 text-center">
            Atual: {formatCurrency(currentValue)} Kz
          </p>
        )}
      </div>
    );
  };

  // Componente para location com botão aplicar
  const LocationInputWithApply = () => {
    const [localValue, setLocalValue] = useState("");
    const currentValue = watch('location');

    const handleApply = () => {
      setValue('location', localValue);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            placeholder="Cidade, bairro ou província..."
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={handleApply}
          disabled={!localValue.trim()}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            localValue.trim() 
              ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Check size={16} />
          Aplicar Filtro
        </button>
        {currentValue && (
          <p className="text-xs text-gray-600 text-center">
            Atual: {currentValue}
          </p>
        )}
      </div>
    );
  };

  // Componente para Mobile Bottom Sheet (versão simplificada)
  const MobilePriceInputWithApply = ({ 
    name, 
    placeholder 
  }: { 
    name: 'minPrice' | 'maxPrice';
    placeholder: string;
  }) => {
    const [localValue, setLocalValue] = useState("");
    const currentValue = watch(name);

    const handleApply = () => {
      const numericValue = localValue ? parseInt(localValue.replace(/\D/g, "")) : 0;
      setValue(name, numericValue);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");
              setLocalValue(rawValue);
            }}
            onBlur={() => {
              if (localValue) {
                setLocalValue(formatCurrency(parseInt(localValue)));
              }
            }}
            onFocus={() => {
              if (localValue) {
                setLocalValue(localValue.replace(/\D/g, ""));
              }
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border-2 border-gray-300 
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            placeholder={placeholder}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!localValue}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
            localValue 
              ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Check size={14} />
          Aplicar
        </button>
        {currentValue > 0 && (
          <p className="text-xs text-gray-600 text-center">
            Atual: {formatCurrency(currentValue)} Kz
          </p>
        )}
      </div>
    );
  };

  // Componente para Mobile Location com botão aplicar
  const MobileLocationInputWithApply = () => {
    const [localValue, setLocalValue] = useState("");
    const currentValue = watch('location');

    const handleApply = () => {
      setValue('location', localValue);
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            placeholder="Cidade, bairro ou província..."
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!localValue.trim()}
          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
            localValue.trim() 
              ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Check size={14} />
          Aplicar
        </button>
        {currentValue && (
          <p className="text-xs text-gray-600 text-center">
            Atual: {currentValue}
          </p>
        )}
      </div>
    );
  };

  // Componente Card wrapper
  const Card = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-gray-50 rounded-2xl p-5 shadow-sm border border-gray-200">
      <h4 className="text-base font-semibold text-gray-800 mb-4">{title}</h4>
      {children}
    </div>
  );

  // Mobile Filters Modal
  const MobileFiltersModal = () => (
    <>
      {/* Botão mobile */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg fixed bottom-6 right-6 z-40"
      >
        <SlidersHorizontal size={18} />
        <span>Filtros</span>
      </button>

      {/* Overlay Mobile */}
      {mobileFiltersOpen && (
        <div
          onClick={() => setMobileFiltersOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Mobile Filters Sidebar */}
      <div
        className={`fixed lg:static top-0 right-0 h-full lg:h-fit w-80 lg:w-full bg-white rounded-l-2xl lg:rounded-2xl shadow-2xl lg:shadow-xl border border-gray-200 p-6 z-50 transform transition-transform duration-300 ${
          mobileFiltersOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl px-4 py-3 shadow">
          <h3 className="text-xl font-bold">Filtros</h3>
          <div className="flex gap-2 items-center">
            <button
              onClick={resetFilters}
              className="text-sm font-medium bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30"
            >
              Limpar
            </button>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="lg:hidden p-2 rounded-full hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[80vh] lg:max-h-none pr-2">
          {/* Localização */}
          <Card title="Localização">
            <LocationInputWithApply />
          </Card>

          {/* Preço */}
          <Card title="Faixa de Preço (Kz)">
            <div className="grid grid-cols-2 gap-4">
              <PriceInputWithApply
                name="minPrice"
                placeholder="Mínimo"
                icon={<BanknoteArrowDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
              />
              <PriceInputWithApply
                name="maxPrice"
                placeholder="Máximo"
                icon={<BanknoteArrowUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
              />
            </div>
          </Card>

          {/* Tipo de Imóvel */}
          <Card title="Tipo de Imóvel">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "casa", label: "Casa", icon: <Home /> },
                { value: "apartamento", label: "Apartamento", icon: <Building /> },
                { value: "terreno", label: "Terreno", icon: <MapPinHouse /> },
                { value: "comercial", label: "Comercial", icon: <Store /> },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setValue("tipo", filters.tipo === type.value ? "" : type.value)
                  }
                  className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                    filters.tipo === type.value
                      ? "border-purple-500 bg-purple-50 text-purple-700 shadow"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="text-2xl">{type.icon}</div>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Status */}
          <Card title="Status">
            <div className="grid grid-cols-2 gap-3">
              {["A Venda", "Alugando"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setValue("status", filters.status === status ? "" : status)
                  }
                  className={`py-3 px-4 rounded-full border-2 transition-all ${
                    filters.status === status
                      ? "border-orange-500 bg-orange-50 text-orange-700 shadow"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </Card>

          {/* Quartos */}
          <Card title="Quartos">
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((beds) => (
                <button
                  key={beds}
                  type="button"
                  onClick={() => setValue("bedrooms", beds)}
                  className={`px-5 py-2 rounded-full border-2 text-sm transition-all ${
                    filters.bedrooms === beds
                      ? "border-purple-500 bg-purple-50 text-purple-700 shadow"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {beds === 0 ? "Todos" : `${beds}+`}
                </button>
              ))}
            </div>
          </Card>

          {/* Banheiros */}
          <Card title="Banheiros">
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4].map((baths) => (
                <button
                  key={baths}
                  type="button"
                  onClick={() => setValue("bathrooms", baths)}
                  className={`px-5 py-2 rounded-full border-2 text-sm transition-all ${
                    filters.bathrooms === baths
                      ? "border-purple-500 bg-purple-50 text-purple-700 shadow"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {baths === 0 ? "Todos" : `${baths}+`}
                </button>
              ))}
            </div>
          </Card>

          {/* Garagens */}
          <Card title="Garagens">
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((garage) => (
                <button
                  key={garage}
                  type="button"
                  onClick={() => setValue("garagens", garage)}
                  className={`px-5 py-2 rounded-full border-2 text-sm transition-all ${
                    filters.garagens === garage
                      ? "border-purple-500 bg-purple-50 text-purple-700 shadow"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {garage === 0 ? "Todos" : `${garage}+`}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );

  // Bottom Sheet Mobile Filters
  const MobileFiltersBottomSheet = () => (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg p-4 z-50 lg:hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Filtros
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Limpar
        </button>
      </div>

      <div className="space-y-5 max-h-[60vh] overflow-y-auto">
        {/* Localização */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Localização
          </label>
          <MobileLocationInputWithApply />
        </div>

        {/* Preço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Faixa de Preço (Kz)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <MobilePriceInputWithApply name="minPrice" placeholder="Mínimo" />
            <MobilePriceInputWithApply name="maxPrice" placeholder="Máximo" />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["A Venda", "Alugando"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setValue("status", filters.status === status ? "" : status)
                }
                className={`py-2 px-4 rounded-lg border-2 text-sm transition-all ${
                  filters.status === status
                    ? "border-orange-500 bg-orange-50 text-orange-700 shadow"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-6 md:py-8">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">

          {/* Mobile Filters */}
          <div className="lg:hidden">
            <MobileFiltersModal />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar Desktop */}
            <div className="hidden lg:block w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Filtros</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    Limpar
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Localização */}
                  <Card title="Localização">
                    <LocationInputWithApply />
                  </Card>

                  {/* Preço */}
                  <Card title="Faixa de Preço (Kz)">
                    <div className="grid grid-cols-2 gap-4">
                      <PriceInputWithApply
                        name="minPrice"
                        placeholder="Mínimo"
                        icon={<BanknoteArrowDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                      />
                      <PriceInputWithApply
                        name="maxPrice"
                        placeholder="Máximo"
                        icon={<BanknoteArrowUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                      />
                    </div>
                  </Card>

                  {/* Tipo de Imóvel */}
                  <Card title="Tipo de Imóvel">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "casa", label: "Casa", icon: <Home /> },
                        { value: "apartamento", label: "Apartamento", icon: <Building /> },
                        { value: "terreno", label: "Terreno", icon: <MapPinHouse /> },
                        { value: "comercial", label: "Comercial", icon: <Store /> },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setValue("tipo", filters.tipo === type.value ? "" : type.value)
                          }
                          className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                            filters.tipo === type.value
                              ? "border-purple-500 bg-purple-50 text-purple-700 shadow"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="text-2xl">{type.icon}</div>
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Status */}
                  <Card title="Status">
                    <div className="grid grid-cols-2 gap-3">
                      {["A Venda", "Alugando"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setValue("status", filters.status === status ? "" : status)
                          }
                          className={`py-3 px-4 rounded-full border-2 transition-all ${
                            filters.status === status
                              ? "border-orange-500 bg-orange-50 text-orange-700 shadow"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Quartos */}
                  <Card title="Quartos">
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5].map((beds) => (
                        <button
                          key={beds}
                          type="button"
                          onClick={() => setValue("bedrooms", beds)}
                          className={`px-5 py-2 rounded-full border-2 text-sm transition-all ${
                            filters.bedrooms === beds
                              ? "border-purple-500 bg-purple-50 text-purple-700 shadow"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {beds === 0 ? "Todos" : `${beds}+`}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Banheiros */}
                  <Card title="Banheiros">
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4].map((baths) => (
                        <button
                          key={baths}
                          type="button"
                          onClick={() => setValue("bathrooms", baths)}
                          className={`px-5 py-2 rounded-full border-2 text-sm transition-all ${
                            filters.bathrooms === baths
                              ? "border-purple-500 bg-purple-50 text-purple-700 shadow"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {baths === 0 ? "Todos" : `${baths}+`}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Garagens */}
                  <Card title="Garagens">
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3].map((garage) => (
                        <button
                          key={garage}
                          type="button"
                          onClick={() => setValue("garagens", garage)}
                          className={`px-5 py-2 rounded-full border-2 text-sm transition-all ${
                            filters.garagens === garage
                              ? "border-purple-500 bg-purple-50 text-purple-700 shadow"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {garage === 0 ? "Todos" : `${garage}+`}
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="hidden md:block">
                <HeaderControls filteredProperties={filteredProperties} />
              </div>

              <PropertiesGrid
                loading={isLoading}
                filteredProperties={filteredProperties}
                viewMode="grid"
                loadingMore={loadingMore}
                hasMore={hasMore}
                resetFilters={resetFilters}
              />
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}