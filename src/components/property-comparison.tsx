'use client';

import { useState, useCallback, useMemo, createContext, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, Check, BarChart3, Sparkles, Loader2, ArrowRight, Ruler, BedDouble, Car, Building, ShieldCheck, MapPin, Users, DollarSign, Award } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CompareContextType {
  selectionMode: boolean;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
}

const CompareContext = createContext<CompareContextType>({ selectionMode: false, selectedIds: [], toggleSelect: () => {} });
export const useCompare = () => useContext(CompareContext);

interface PropertyComparisonProps {
  properties: Record<string, unknown>[];
  children?: React.ReactNode;
}

interface TableRow {
  field: string;
  label: string;
  values: unknown[];
  allSame: boolean;
}

interface ComparisonResult {
  table: TableRow[];
  summary: string;
}

const LABELS: Record<string, string> = {
  title: 'Título', price: 'Preço', tipo: 'Tipo', cidade: 'Cidade',
  bairro: 'Bairro', bedrooms: 'Quartos', bathrooms: 'Banheiros',
  garagens: 'Garagens', size: 'Área', status: 'Status',
};

// === COMPONENTE AUXILIAR: GALERIA DE IMAGENS PREMIUM COM ARREDONDAMENTO KERCASA ===
interface PropertyGalleryProps {
  images: string[];
  title: string;
  aspectClassName?: string;
}

function PropertyGallery({ images, title, aspectClassName }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5500 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * 10, y: y * 10 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className={`relative rounded-card overflow-hidden cursor-pointer shadow-md bg-gray-50 border border-gray-100 select-none group ${aspectClassName || 'aspect-[4/3]'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'}
          alt={title}
          className="w-full h-full object-cover select-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            scale: isHovered ? 1.05 : 1,
            x: mousePosition.x,
            y: mousePosition.y
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 0.3 },
            x: { type: 'tween', ease: 'easeOut', duration: 0.2 },
            y: { type: 'tween', ease: 'easeOut', duration: 0.2 }
          }}
        />
      </AnimatePresence>

      <div className="absolute top-4 left-4 bg-black/45 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-button border border-white/10">
        {currentIndex + 1}/{images.length}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-350 ${
                i === currentIndex ? 'bg-white w-3.5 shadow-sm' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// === COMPONENTE AUXILIAR: ESPECIFICAÇÃO SIMPLES (um imóvel por card) ===
interface SimpleSpecProps {
  icon: React.ReactNode;
  label: string;
  value: number | string | null | undefined;
  compareValue?: number | string | null | undefined;
  isPrice?: boolean;
  unit?: string;
}

function SimpleSpec({ icon, label, value, compareValue, isPrice = false, unit = '' }: SimpleSpecProps) {
  const parseNum = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(/[^\d.-]/g, '');
    return parseFloat(clean) || 0;
  };

  const num = parseNum(value);
  const numCompare = parseNum(compareValue);

  const formatted = (() => {
    if (value === null || value === undefined || value === '') return '-';
    if (isPrice) return `Kz ${num.toLocaleString()}`;
    return `${value}${unit ? ` ${unit}` : ''}`;
  })();

  let badge = '';
  if (compareValue !== undefined && num !== numCompare) {
    if (isPrice) {
      if (num < numCompare) badge = 'melhor preço';
    } else if (num > numCompare) {
      const label2 = label === 'Área Útil' || label === 'Área'
        ? `+${Math.round(((num - numCompare) / numCompare) * 100)}%`
        : `+${num - numCompare}`;
      badge = label2;
    }
  }

  const hasCompare = compareValue !== undefined && !isPrice && (label === 'Quartos' || label === 'Garagens' || label === 'Área');
  
  const progressPercent = (() => {
    if (!hasCompare) return 0;
    const maxVal = Math.max(num, numCompare);
    return maxVal > 0 ? (num / maxVal) * 100 : 0;
  })();

  return (
    <div className={`flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-xl border select-none transition-all duration-200 hover:shadow-sm ${
      badge
        ? 'bg-purple-50/60 border-purple-200/50 shadow-xs'
        : 'bg-gray-50/50 border-gray-100'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`shrink-0 ${ badge ? 'text-[#820AD1]' : 'text-gray-400' }`}>
          {icon}
        </span>
        <div className="flex flex-col leading-tight min-w-0 flex-1">
          <span className="text-[9px] uppercase tracking-widest font-extrabold opacity-55 text-gray-500">{label}</span>
          <span className={`font-extrabold text-[12px] truncate ${ badge ? 'text-[#820AD1] font-black' : 'text-gray-800' }`}>
            {formatted}
          </span>
        </div>
        {badge && (
          <span className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full font-extrabold whitespace-nowrap ${
            badge === 'melhor preço' ? 'bg-[#820AD1] text-white shadow-xs' : 'bg-emerald-500 text-white shadow-xs'
          }`}>
            {badge}
          </span>
        )}
      </div>

      {hasCompare && (
        <div className="w-full bg-gray-200/60 h-1.5 rounded-full overflow-hidden mt-1 shrink-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className={`h-full rounded-full ${
              badge ? 'bg-gradient-to-r from-purple-500 to-[#820AD1]' : 'bg-gradient-to-r from-orange-400 to-[#F97316]'
            }`}
          />
        </div>
      )}
    </div>
  );
}

export function PropertyComparison({ properties, children }: PropertyComparisonProps) {
  const pathname = usePathname();
  const isPropriedades = pathname === '/propriedades';

  const [showTutorial, setShowTutorial] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedProperties = useMemo(
    () => (properties.filter(p => selectedIds.includes(String(p.id))) as any[]),
    [properties, selectedIds]
  );
  const [showSidebar, setShowSidebar] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [activeTab, setActiveTab] = useState('resumo');



  const toggleSelect = useCallback((id: string) => {
    if (!selectionMode) return;
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  }, [selectionMode]);



  const handleFabClick = useCallback(() => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedIds([]);
      return;
    }
    if (!tutorialDismissed) {
      setShowTutorial(true);
    } else {
      setSelectionMode(true);
      setSelectedIds([]);
    }
  }, [tutorialDismissed, selectionMode]);

  const handleStartSelection = useCallback(() => {
    setShowTutorial(false);
    setTutorialDismissed(true);
    setSelectionMode(true);
    setSelectedIds([]);
  }, []);

  const formatCell = (field: string, value: unknown, allValues: unknown[]): string => {
    if (field === 'price') return `Kz ${Number(value).toLocaleString()}`;
    if (field === 'bedrooms' || field === 'bathrooms' || field === 'garagens')
      return String(value ?? '-');
    return String(value || '-');
  };

  const handleCompare = useCallback(() => {
    if (selectedIds.length < 2) return;

    const selected = properties.filter(p => selectedIds.includes(String(p.id)));

    const fields = ['title', 'price', 'tipo', 'cidade', 'bairro', 'bedrooms', 'bathrooms', 'garagens', 'size', 'status'];
    const rows = fields.map(f => {
      const vals = selected.map(p => p[f]);
      const allSame = vals.every(v => String(v) === String(vals[0]));
      return {
        field: f,
        label: LABELS[f] || f,
        values: vals,
        allSame,
      };
    });

    setComparisonResult({ table: rows, summary: '' });
    setAiSummary('');
    setShowSidebar(true);
    setAiLoading(true);
    // auto-generate AI summary
    fetch('/api/mywai/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        properties: selected.map(p => ({
          title: p.title, price: p.price, tipo: p.tipo, cidade: p.cidade,
          bairro: p.bairro, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
          garagens: p.garagens, size: p.size, status: p.status,
        }))
      }),
    }).then(res => res.ok ? res.json() : { summary: '' })
      .then(data => setAiSummary(data.summary || 'Não foi possível gerar a análise inteligente neste momento. Tente novamente.'))
      .catch(() => setAiSummary('Erro ao gerar a análise. Verifique sua conexão e tente novamente.'))
      .finally(() => setAiLoading(false));
  }, [selectedIds, properties]);

  const handleClose = useCallback(() => {
    setShowSidebar(false);
    setSelectionMode(false);
    setSelectedIds([]);
    setComparisonResult(null);
    setAiSummary('');
    setAiLoading(false);
    setActiveTab('resumo');
  }, []);

  const getPropertyImages = useCallback((p: any): string[] => {
    if (Array.isArray(p.gallery) && p.gallery.length > 0) return p.gallery;
    if (p.image) return [p.image];
    return ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'];
  }, []);

  const ctx = useMemo(() => ({ selectionMode, selectedIds, toggleSelect }), [selectionMode, selectedIds, toggleSelect]);

  if (!isPropriedades) return null;

  return (
    <CompareContext.Provider value={ctx}>
      {/* Tutorial */}
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowTutorial(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-card max-w-sm w-full p-6 shadow-floating border border-purple-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#820AD1] to-purple-600 flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-800 mb-2">Comparar Imóveis</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Seleciona dois ou mais imóveis para comparar características lado a lado.
              O MYWAI vai resumir as diferenças para te ajudar a escolher!
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowTutorial(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-button hover:bg-gray-200 transition-colors">
                Agora não
              </button>
              <button onClick={handleStartSelection}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#820AD1] to-[#F97316] rounded-button transition-all">
                Começar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Floating Selection Bar */}
      {selectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9997]">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-full shadow-floating border border-purple-100 px-5 py-3 flex items-center gap-4"
          >
            <span className="text-sm text-gray-600 whitespace-nowrap select-none">
              {selectedIds.length === 0
                ? 'Clica nos imóveis para selecionar'
                : `${selectedIds.length} selecionado${selectedIds.length !== 1 ? 's' : ''} — mínimo 2`}
            </span>
            <button
              onClick={handleCompare}
              disabled={selectedIds.length < 2 || comparing}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-white bg-[#820AD1] rounded-button hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {comparing ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}
              Comparar
            </button>
            <button onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-[#820AD1] rounded-full hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}

      {/* OVERLAY DE COMPARAÇÃO */}
      <AnimatePresence>
        {showSidebar && comparisonResult && (
          selectedProperties.length === 2 ? (
            // ============================================
            // MODO 1: VERSUS DUAL PREMIUM (TELA CHEIA)
            // ============================================
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              className="fixed inset-0 z-[9999] bg-[#faf9f7] overflow-y-auto px-4 py-8 md:p-12 flex flex-col justify-start items-center select-none"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse at 20% 50%, rgba(130, 10, 209, 0.03) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 20%, rgba(249, 115, 22, 0.03) 0%, transparent 50%)
                `
              }}
            >
              {/* Header */}
              <div className="w-full max-w-6xl flex justify-between items-center mb-8 shrink-0">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#820AD1] bg-[#F3E8FF] px-3.5 py-1 rounded-button uppercase tracking-wider w-fit mb-2 border border-purple-105 select-none">
                    Compare e Escolha
                  </span>
                  <h2 className="text-2xl md:text-3xl font-light text-[#1A1A1A] select-none">
                    Qual imóvel <span className="font-bold bg-gradient-to-r from-[#820AD1] to-[#F97316] bg-clip-text text-transparent">combina mais</span> com você?
                  </h2>
                </div>
                <button onClick={handleClose} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 hover:bg-white transition-colors text-gray-400 hover:text-gray-600 shrink-0">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="w-full max-w-6xl flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none">
                {[
                  { id: 'resumo', label: 'Resumo MYWAI', icon: <Sparkles size={14} /> },
                  { id: 'preco', label: 'Preço', icon: <Ruler size={14} /> },
                  { id: 'detalhes', label: 'Detalhes', icon: <BedDouble size={14} /> },
                  { id: 'localizacao', label: 'Localização', icon: <MapPin size={14} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-button transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[#820AD1] text-white shadow-sm'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-purple-200 hover:text-[#820AD1]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Versus Grid with Tabbed Content */}
              <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative">
                {selectedProperties.slice(0, 2).map((prop, index) => {
                  const images = getPropertyImages(prop);
                  const otherProp = selectedProperties[index === 0 ? 1 : 0];
                  const specs: { icon: React.ReactNode; label: string; value: any; compareValue?: any; isPrice?: boolean; unit?: string; }[] = [];
                  const tab = activeTab;

                  if (tab === 'resumo') {
                    specs.push({
                      icon: <Ruler size={14} />, label: 'Preço',
                      value: Number(prop.price || 0),
                      compareValue: Number(otherProp?.price || 0),
                      isPrice: true,
                    });
                    specs.push({
                      icon: <BedDouble size={14} />, label: 'Quartos',
                      value: prop.bedrooms || '-',
                      compareValue: otherProp?.bedrooms || '-',
                    });
                    specs.push({
                      icon: <Ruler size={14} />, label: 'Área',
                      value: prop.size || '-',
                      compareValue: otherProp?.size || '-',
                      unit: 'm²',
                    });
                  }

                  if (tab === 'preco') {
                    specs.push({
                      icon: <Ruler size={14} />, label: 'Preço',
                      value: Number(prop.price || 0),
                      compareValue: Number(otherProp?.price || 0),
                      isPrice: true,
                    });
                    specs.push({
                      icon: <ShieldCheck size={14} />, label: 'Tipo',
                      value: `${prop.tipo || '-'}`,
                    });
                    specs.push({
                      icon: <ArrowRight size={14} />, label: 'Status',
                      value: `${prop.status || '-'}`,
                    });
                  }

                  if (tab === 'detalhes') {
                    specs.push({
                      icon: <Ruler size={14} />, label: 'Área',
                      value: prop.size || '-',
                      compareValue: otherProp?.size || '-',
                      unit: 'm²',
                    });
                    specs.push({
                      icon: <BedDouble size={14} />, label: 'Quartos',
                      value: prop.bedrooms || '-',
                      compareValue: otherProp?.bedrooms || '-',
                    });
                    specs.push({
                      icon: <Building size={14} />, label: 'Banheiros',
                      value: prop.bathrooms || '-',
                      compareValue: otherProp?.bathrooms || '-',
                    });
                    specs.push({
                      icon: <Car size={14} />, label: 'Garagens',
                      value: prop.garagens || '-',
                      compareValue: otherProp?.garagens || '-',
                    });
                  }

                  if (tab === 'localizacao') {
                    specs.push({
                      icon: <MapPin size={14} />, label: 'Cidade',
                      value: `${prop.cidade || '-'}`,
                    });
                    specs.push({
                      icon: <MapPin size={14} />, label: 'Bairro',
                      value: `${prop.bairro || '-'}`,
                    });
                    specs.push({
                      icon: <Building size={14} />, label: 'Tipo',
                      value: `${prop.tipo || '-'}`,
                    });
                    specs.push({
                      icon: <ShieldCheck size={14} />, label: 'Status',
                      value: `${prop.status || '-'}`,
                    });
                  }

                  return (
                    <div
                      key={String(prop.id)}
                      className="bg-white rounded-card shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <PropertyGallery images={images} title={String(prop.title || '')} aspectClassName="aspect-[16/9]" />
                      <div className="p-3">
                        <h3 className="text-xs font-bold text-gray-800 mb-2">{String(prop.title || '')}</h3>
                        <div className="flex flex-col gap-2">
                          {specs.map(s => (
                            <SimpleSpec
                              key={s.label}
                              icon={s.icon}
                              label={s.label}
                              value={s.value}
                              compareValue={s.compareValue}
                              isPrice={s.isPrice}
                              unit={s.unit}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* VS Divider */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#820AD1] to-[#F97316] shadow-lg flex items-center justify-center border-4 border-white">
                    <span className="text-white font-black text-sm tracking-wider">VS</span>
                  </div>
                </div>
              </div>

              {/* Resumo MYWAI Full Width */}
              {activeTab === 'resumo' && (
                <div className="w-full max-w-6xl mt-6">
                  <div className="bg-white rounded-card border border-purple-100 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#820AD1]/10 to-[#F97316]/10 text-[#820AD1] border border-[#820AD1]/15">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-black text-[#820AD1]">Análise MYWAI</span>
                          <h3 className="font-extrabold text-sm text-gray-800">Comparativo Inteligente</h3>
                        </div>
                      </div>

                      {!aiSummary && !aiLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                          <Sparkles size={32} className="text-purple-200" />
                          <p className="text-xs text-gray-400 text-center max-w-md">
                            Carrega em <span className="font-bold text-[#820AD1]">Comparar</span> para a MYWAI analisar as diferenças.
                          </p>
                        </div>
                      ) : aiLoading ? (
                        <div className="flex items-center justify-center py-8 gap-3">
                          <Loader2 size={24} className="animate-spin text-[#820AD1]" />
                          <span className="text-sm text-gray-500 font-medium">MYWAI está a analisar os imóveis...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          {/* Property Cards Side by Side */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedProperties.slice(0, 2).map((prop, index) => {
                              const images = getPropertyImages(prop);
                              const isA = index === 0;
                              return (
                                <div key={String(prop.id)} className="rounded-card overflow-hidden border border-gray-200 bg-white shadow-sm">
                                  <div className={`h-1.5 ${isA ? 'bg-gradient-to-r from-[#820AD1] to-purple-500' : 'bg-gradient-to-r from-[#F97316] to-orange-500'}`} />
                                  <div className="p-4">
                                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isA ? 'text-purple-600' : 'text-orange-600'}`}>Imóvel {String.fromCharCode(65 + index)}</span>
                                    <h3 className="text-base font-bold text-gray-900 mt-1">{String(prop.title || '')}</h3>
                                    <span className="text-xl font-extrabold text-amber-600">Kz {Number(prop.price || 0).toLocaleString()}</span>
                                    <div className="mt-3 space-y-1.5">
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <BedDouble size={14} className={isA ? 'text-purple-400' : 'text-orange-400'} />
                                        {prop.bedrooms || '-'} quartos
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building size={14} className={isA ? 'text-purple-400' : 'text-orange-400'} />
                                        {prop.bathrooms || '-'} banheiros
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Car size={14} className={isA ? 'text-purple-400' : 'text-orange-400'} />
                                        {prop.garagens || '-'} garagens
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Ruler size={14} className={isA ? 'text-purple-400' : 'text-orange-400'} />
                                        {prop.size || '-'} m²
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin size={14} className={isA ? 'text-purple-400' : 'text-orange-400'} />
                                        {prop.cidade || '-'}{prop.bairro ? `, ${prop.bairro}` : ''}
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold ${
                                        isA ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                      }`}>
                                        {isA ? 'ALTO PADRÃO' : 'CUSTO-BENEFÍCIO'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Analysis by Scenario */}
                          <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-3">Análise por Cenário</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              {(() => {
                                const sentences = aiSummary.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
                                const scenarios = [
                                  { icon: Users, label: 'Família', desc: 'Melhor para famílias', winner: 1 },
                                  { icon: DollarSign, label: 'Custo-Benefício', desc: 'Melhor custo-benefício', winner: 1 },
                                  { icon: MapPin, label: 'Localização', desc: 'Localização ampla', winner: 0 },
                                  { icon: Building, label: 'Investimento', desc: 'Para investidores/grupos', winner: 0 },
                                ];
                                return scenarios.map((scenario, i) => {
                                  const ScenarioIcon = scenario.icon;
                                  const sentence = sentences[i] || `${scenario.desc} com base nos dados disponíveis.`;
                                  return (
                                    <div key={scenario.label} className="p-4 rounded-card bg-gradient-to-br from-purple-50 to-amber-50 border border-purple-100 flex flex-col">
                                      <div className="p-2 rounded-lg bg-purple-100/50 text-[#820AD1] w-fit">
                                        <ScenarioIcon size={18} />
                                      </div>
                                      <h4 className="text-sm font-bold text-gray-800 mt-3">{scenario.label}</h4>
                                      <p className="text-xs text-gray-600 mt-1 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: sentence.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<strong>$1</strong>') }} />
                                      <span className="mt-3 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full w-fit">
                                        Vencedor: Imóvel {String.fromCharCode(65 + scenario.winner)}
                                      </span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* Recommendation */}
                          {(() => {
                            const aPrice = Number(selectedProperties[0]?.price || 0);
                            const bPrice = Number(selectedProperties[1]?.price || 0);
                            const aRooms = Number(selectedProperties[0]?.bedrooms || 0);
                            const bRooms = Number(selectedProperties[1]?.bedrooms || 0);
                            const cheaper = aPrice <= bPrice ? 0 : 1;
                            const bigger = aRooms >= bRooms ? 0 : 1;
                            return (
                              <div className="p-5 rounded-card border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
                                <div className="flex items-center gap-2 mb-3">
                                  <Award size={20} className="text-amber-600" />
                                  <span className="text-sm font-extrabold text-amber-800 uppercase tracking-wider">Recomendação MYWAI</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  <strong>Para famílias e melhor custo-benefício → Imóvel {String.fromCharCode(65 + cheaper)}</strong> ({String(selectedProperties[cheaper]?.title || '')})<br />
                                  <strong>Para investidores, grupos grandes ou localização ampla → Imóvel {String.fromCharCode(65 + bigger)}</strong> ({String(selectedProperties[bigger]?.title || '')})
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            // ============================================
            // MODO 2: MÚLTIPLOS IMÓVEIS (SIDEBAR)
            // ============================================
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              className="fixed right-0 top-0 h-full w-1/2 z-[9999] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto select-none"
            >
              <div className="sticky top-0 bg-white z-10 p-4 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-gradient-to-br from-[#820AD1]/10 to-[#F97316]/10 text-[#820AD1] border border-[#820AD1]/15">
                      <BarChart3 size={14} />
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-black text-[#820AD1]">Comparação</span>
                      <h3 className="font-extrabold text-xs text-gray-800">{selectedProperties.length} Imóveis</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {comparisonResult.summary && (
                <div className="mx-4 mt-4 p-3 bg-gradient-to-br from-purple-50 to-amber-50 rounded-card border border-purple-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={12} className="text-[#820AD1]" />
                    <span className="text-[8px] font-extrabold text-[#820AD1] uppercase tracking-wider">Resumo MYWAI</span>
                  </div>
                                      <p className="text-[10px] text-gray-700 leading-relaxed">
                      {comparisonResult.summary.split(/(?<=[.!?])\s+/).map((sentence: string, i: number) => (
                        <span key={i} className="block mb-1 pl-2 border-l-2 border-purple-200" dangerouslySetInnerHTML={{
                          __html: sentence.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<strong>$1</strong>')
                        }} />
                      ))}
                    </p>
                  </div>
              )}

              <div className="p-4">
                <div className="overflow-x-auto rounded-card border border-gray-150 bg-white shadow-sm">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky top-0 bg-gray-50 h-[60px] px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 select-none min-w-[140px]">
                          Característica
                        </th>
                        {selectedProperties.map((prop, i) => (
                          <th key={i} className="sticky top-0 bg-gray-50 h-[60px] px-4 text-left border-b border-gray-200 border-l border-gray-100 min-w-[150px]">
                            <div className="flex flex-col items-center gap-2 py-2">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                  src={String(prop.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80')}
                                  alt={String(prop.title)}
                                  className="w-full h-full object-cover select-none"
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-gray-500 select-none">Imóvel {i + 1}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonResult.table.map((row, i) => {
                        const isDiff = !row.allSame;
                        return (
                          <tr key={row.field} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${isDiff ? 'bg-amber-50/30' : ''} transition-colors`}>
                            <td className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 select-none">
                              {row.label}
                            </td>
                            {row.values.map((val: unknown, j: number) => {
                              const formatted = formatCell(row.field, val, row.values);
                              const isBestPrice = row.field === 'price' && val === Math.min(...row.values.map(v => Number(v) || Infinity));
                              const isBiggest = (row.field === 'size' || row.field === 'bedrooms' || row.field === 'bathrooms' || row.field === 'garagens') && val === Math.max(...row.values.map(v => Number(v) || -Infinity));

                              return (
                                <td key={j} className={`px-4 py-3 text-xs border-b border-gray-100 border-l border-gray-50 ${
                                  isBestPrice ? 'font-semibold text-purple-700' : ''
                                } ${
                                  isBiggest ? 'font-semibold text-amber-700' : 'text-gray-600'
                                }`}>
                                  <div className="flex items-center gap-1.5 w-full">
                                    <span className="truncate">{formatted}</span>
                                    {isBestPrice && (
                                      <span className="text-[8px] px-1.5 py-0.5 rounded-button bg-purple-100 text-purple-700 font-bold whitespace-nowrap select-none">
                                        melhor preço
                                      </span>
                                    )}
                                    {isBiggest && (
                                      <span className="text-[8px] px-1.5 py-0.5 rounded-button bg-amber-100 text-amber-700 font-bold whitespace-nowrap select-none">
                                        maior
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>


      {/* Floating FAB Button */}
      <motion.button
        onClick={handleFabClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 z-[9997] w-14 h-14 rounded-full bg-gradient-to-br from-[#820AD1] to-purple-800 text-white shadow-lg border-2 border-white flex items-center justify-center hover:shadow-xl hover:from-purple-600 hover:to-[#820AD1] transition-all duration-300"
        title="Comparar imóveis"
      >
        {selectionMode ? <X size={22} /> : <BarChart3 size={22} />}
      </motion.button>
      {children}
    </CompareContext.Provider>
  );
}