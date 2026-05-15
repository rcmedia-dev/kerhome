'use client';

import { Search, MapPin, Building, Filter } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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

export const ImobiliariaFilters: React.FC<ImobiliariaFiltersProps> = ({ onFilterChange, onApply, isMobileModal = false }) => {
  const [locations, setLocations] = useState<{ cidades: string[], bairros: string[] }>({ cidades: [], bairros: [] });
  const [selectedCidade, setSelectedCidade] = useState('');
  const [selectedBairro, setSelectedBairro] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedOrdem, setSelectedOrdem] = useState('destaque');
  const [verificadasOnly, setVerificadasOnly] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load locations on mount
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

  const handleApply = useCallback((shouldClose: boolean = false) => {
    onFilterChange({
      cidade: selectedCidade || undefined,
      bairro: selectedBairro || undefined,
      q: searchQuery || undefined,
      tipo_imovel: selectedTipo || undefined,
      ordem: selectedOrdem,
      verificada: verificadasOnly ? true : undefined
    });
    
    // Crucial: Only close if explicitly requested (e.g. by the Filtrar button)
    if (shouldClose && onApply) {
      onApply();
    }
  }, [selectedCidade, selectedBairro, searchQuery, selectedTipo, selectedOrdem, verificadasOnly, onFilterChange, onApply]);

  // Real-time updates with debounce, but WITHOUT closing the modal
  useEffect(() => {
    if (!isMounted) return;
    
    const timer = setTimeout(() => {
      handleApply(false); // false = don't close the modal
    }, 400); 

    return () => clearTimeout(timer);
  }, [selectedOrdem, verificadasOnly, selectedTipo, selectedCidade, selectedBairro, isMounted, handleApply]);

  const containerClasses = isMobileModal 
    ? "space-y-6" 
    : "bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-purple-100/20 p-8 mb-16 border border-white/50 relative overflow-hidden";

  return (
    <div className={containerClasses}>
      {!isMobileModal && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-orange-500 to-purple-500 opacity-30"></div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Busca por Nome */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Nome da imobiliária..."
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none text-gray-700 font-medium shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Cidade */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none text-gray-700 appearance-none cursor-pointer font-medium shadow-sm"
            value={selectedCidade}
            onChange={(e) => setSelectedCidade(e.target.value)}
          >
            <option value="">Todas as Províncias</option>
            {PROVINCIAS_ANGOLA.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Bairro */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none text-gray-700 appearance-none cursor-pointer font-medium shadow-sm"
            value={selectedBairro}
            onChange={(e) => setSelectedBairro(e.target.value)}
          >
            <option value="">Todos os Bairros</option>
            {locations.bairros.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Imóvel */}
        <div className="relative">
          <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none text-gray-700 appearance-none cursor-pointer font-medium shadow-sm"
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
          >
            <option value="">Tipo de Imóvel</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Vivenda">Vivenda</option>
            <option value="Terreno">Terreno</option>
            <option value="Escritório">Escritório</option>
            <option value="Loja">Loja</option>
          </select>
        </div>

        {/* Botão Buscar (Fecha o modal explicitamente) */}
        <button
          onClick={() => handleApply(true)}
          className="bg-[#820AD1] text-white rounded-2xl py-4 px-8 font-semibold hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-purple-200/50 transform hover:-translate-y-1 active:scale-95 group w-full md:w-auto"
        >
          <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span>Filtrar</span>
        </button>
      </div>

      {/* Row 2: Sort and Switch */}
      <div className={`mt-6 flex flex-col md:flex-row items-center justify-between border-t border-gray-100 pt-6 gap-4 ${isMobileModal ? 'border-none !mt-0' : ''}`}>
        {/* Ordenação */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Ordenar por:</span>
          <select
            value={selectedOrdem}
            onChange={(e) => setSelectedOrdem(e.target.value)}
            className="bg-purple-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-purple-500 text-sm font-black text-purple-700 cursor-pointer shadow-sm flex-1 md:flex-none"
          >
            <option value="destaque">Destaque</option>
            <option value="mais_imoveis">Mais Imóveis</option>
            <option value="recentes">Mais Recentes</option>
          </select>
        </div>

        {/* Switch: Imobiliárias Verificadas */}
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
    </div>
  );
};
