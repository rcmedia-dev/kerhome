'use client';

import { Search, MapPin, Building, Filter, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchImobiliariaLocations } from '@/lib/functions/supabase-actions/imobiliaria-actions';

interface ImobiliariaFiltersProps {
  onFilterChange: (filters: any) => void;
  onApply?: () => void;
  isMobileModal?: boolean;
}

const PROVINCIAS_ANGOLA = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte', 
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire', 
  'Icolo e Bengo', 'Cassai-Zambeze', 'Cuango'
].sort();

const ORDEM_OPTIONS = [
  { value: 'destaque', label: 'Destaque' },
  { value: 'mais_imoveis', label: 'Mais Imóveis' },
  { value: 'recentes', label: 'Mais Recentes' },
];

const TIPO_OPTIONS = [
  { value: 'Apartamento', label: 'Apartamento' },
  { value: 'Vivenda', label: 'Vivenda' },
  { value: 'Terreno', label: 'Terreno' },
  { value: 'Escritório', label: 'Escritório' },
  { value: 'Loja', label: 'Loja' },
];

interface CustomSelectProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  isActive?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ icon, label, value, options, onChange, isActive = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find(o => o.value === value)?.label || label;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative group">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 border rounded-xl text-sm text-left transition-all duration-300 shadow-sm hover:shadow-md ${
          isActive || value
            ? 'border-gray-200 bg-gray-50 text-gray-700' 
            : 'border-gray-200 bg-gray-50 text-gray-500'
        } hover:border-purple-300 outline-none`}
      >
        <span className="text-gray-400">{icon}</span>
        <span className="flex-1 truncate">{selectedLabel}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-[#1a1530] rounded-xl shadow-2xl shadow-purple-900/50 overflow-hidden z-[99999] animate-in fade-in slide-in-from-top-1 duration-150 max-h-[240px] overflow-y-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
              !value
                ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                : 'text-gray-300 hover:bg-purple-800/50 hover:text-white'
            }`}
          >
            <span>{label}</span>
            {!value && <Check size={14} />}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                value === option.value
                  ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                  : 'text-gray-300 hover:bg-purple-800/50 hover:text-white'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ImobiliariaFilters: React.FC<ImobiliariaFiltersProps> = ({ onFilterChange, onApply, isMobileModal = false }) => {
  const [locations, setLocations] = useState<{ cidades: string[], bairros: string[] }>({ cidades: [], bairros: [] });
  const [selectedCidade, setSelectedCidade] = useState('');
  const [selectedBairro, setSelectedBairro] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedOrdem, setSelectedOrdem] = useState('destaque');
  const [verificadasOnly, setVerificadasOnly] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function loadLocations() {
      try {
        const locs = await fetchImobiliariaLocations();
        setLocations(locs);
      } catch (error) {
        console.error("Erro ao carregar localizações:", error);
      }
    }
    loadLocations();
  }, []);

  const handleFilterUpdate = useCallback(() => {
    onFilterChange({
      cidade: selectedCidade || undefined,
      bairro: selectedBairro || undefined,
      q: searchQuery || undefined,
      tipo_imovel: selectedTipo || undefined,
      ordem: selectedOrdem,
      verificada: verificadasOnly ? true : undefined
    });
  }, [selectedCidade, selectedBairro, searchQuery, selectedTipo, selectedOrdem, verificadasOnly, onFilterChange]);

  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      handleFilterUpdate();
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedOrdem, verificadasOnly, selectedTipo, selectedCidade, selectedBairro, searchQuery, isMounted, handleFilterUpdate]);

  const containerClasses = isMobileModal 
    ? "space-y-6" 
    : "bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-purple-100/20 p-8 mb-16 border border-white/50 relative";

  const selectedOrdemLabel = ORDEM_OPTIONS.find(o => o.value === selectedOrdem)?.label || 'Destaque';

  const bairroOptions = locations.bairros.map(b => ({ value: b, label: b }));

  return (
    <div className={containerClasses}>
      {!isMobileModal && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-orange-500 to-purple-500 opacity-30"></div>
      )}

      {/* Mobile Modal Filters */}
      {isMobileModal && (
        <div className="grid grid-cols-1 gap-4">
          <CustomSelect
            icon={<MapPin size={16} />}
            label="Localização (ex: Luanda)"
            value={selectedCidade}
            options={PROVINCIAS_ANGOLA.map(p => ({ value: p, label: p }))}
            onChange={setSelectedCidade}
          />

          <CustomSelect
            icon={<Building size={16} />}
            label="Tipo de Imóvel"
            value={selectedTipo}
            options={TIPO_OPTIONS}
            onChange={setSelectedTipo}
          />

          <CustomSelect
            icon={<Filter size={16} />}
            label="Todos os Bairros"
            value={selectedBairro}
            options={bairroOptions}
            onChange={setSelectedBairro}
          />

          <CustomSelect
            icon={<SlidersHorizontal size={16} />}
            label="Ordenar por"
            value={selectedOrdem}
            options={ORDEM_OPTIONS}
            onChange={setSelectedOrdem}
          />

          {/* Toggle: Apenas Verificadas */}
          <button
            type="button"
            onClick={() => setVerificadasOnly(!verificadasOnly)}
            className="flex items-center justify-between py-3 px-4 border border-gray-200 bg-gray-50 rounded-xl shadow-sm transition-all duration-300 hover:border-purple-300"
          >
            <span className="text-sm text-gray-700 font-medium">Apenas Imobiliárias Verificadas</span>
            <div className="relative">
              <div className={`block w-10 h-6 rounded-full transition-colors ${verificadasOnly ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${verificadasOnly ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </button>

          {/* Search por Nome */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 group-focus-within:text-purple-600" />
            </div>
            <input
              type="text"
              placeholder="Nome da imobiliária..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm text-gray-700 transition-all duration-300 shadow-sm hover:shadow-md outline-none hover:border-purple-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Desktop: Sort and Switch */}
      {!isMobileModal && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Ordenar por:</span>
            <CustomSelect
              icon={<SlidersHorizontal size={16} />}
              label="Ordenar por"
              value={selectedOrdem}
              options={ORDEM_OPTIONS}
              onChange={setSelectedOrdem}
            />
          </div>

          <div className="flex items-center justify-between w-full md:w-auto">
            <label className="flex items-center justify-between w-full md:w-auto gap-3 cursor-pointer group">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">
                Apenas Imobiliárias Verificadas
              </span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={verificadasOnly}
                  onChange={(e) => setVerificadasOnly(e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${verificadasOnly ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${verificadasOnly ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
