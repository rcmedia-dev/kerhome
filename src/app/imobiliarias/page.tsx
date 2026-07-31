'use client';

import { useState, useEffect, useCallback } from 'react';
import { ImobiliariaFilters } from '@/components/imobiliarias/imobiliaria-filters';
import { ImobiliariaCard } from '@/components/imobiliarias/imobiliaria-card';
import { fetchImobiliarias } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import { Imobiliaria } from '@/lib/types/imobiliaria';
import { Building2, Search, MapPin, SlidersHorizontal, X, ArrowRight, CheckCircle2, Shield, Star } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImobiliariasPage() {
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const pageSize = 6;

  const loadData = useCallback(async (currentFilters: any, page: number) => {
    setLoading(true);
    try {
      const { data, count } = await fetchImobiliarias({ ...currentFilters, page, limit: pageSize });
      setImobiliarias(data);
      setTotalItems(count);
    } catch (error) {
      console.error("Erro ao carregar imobiliárias:", error);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    loadData(filters, currentPage);
  }, [filters, currentPage, loadData]);

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = useCallback((newFilters: any) => {
    // Only update if filters actually changed (shallow comparison)
    setFilters((prev: any) => {
      const isSame = JSON.stringify(prev) === JSON.stringify(newFilters);
      if (isSame) return prev;
      return newFilters;
    });
    setCurrentPage(1);
  }, []);

  const handleCityTab = useCallback((city: string) => {
    setFilters((prev: any) => ({ ...prev, cidade: city }));
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="pb-20 flex-col">
        {/* Hero Section Premium - Aurora & Glassmorphism */}
        <section className="relative bg-[#05020B] overflow-hidden pt-20 pb-16 lg:pt-24 lg:pb-20">
          {/* Ambient Backgrounds / Aurora Effect */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#820AD1]/30 blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[#F97316]/20 blur-[120px] pointer-events-none mix-blend-screen" />
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-lg shadow-purple-900/20">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-medium tracking-wide text-gray-300">O Mercado Angolano</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
              As Melhores <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-[#820AD1]">
                Imobiliárias Parceiras
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-light leading-relaxed mb-10">
              Conectamos você às agências mais prestigiadas e confiáveis do mercado. Explore o nosso portfólio de parceiros e faça negócios com segurança.
            </p>

            {/* Trust Indicators / Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <CheckCircle2 size={16} className="text-purple-400" />
                <span>Agências Verificadas</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Shield size={16} className="text-purple-400" />
                <span>Transparência Total</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Star size={16} className="text-orange-400" />
                <span>Avaliações Reais</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pt-14">
          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : imobiliarias.length > 0 ? (
              <div className="flex flex-col mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {imobiliarias.map(imobiliaria => (
                    <ImobiliariaCard key={imobiliaria.id} imobiliaria={imobiliaria as any} />
                  ))}
                </div>

                {/* Pagination */}
                {totalItems > pageSize && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Anterior
                    </button>

                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.ceil(totalItems / pageSize) }).map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                            currentPage === i + 1
                              ? 'bg-purple-700 text-white shadow-md'
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, Math.ceil(totalItems / pageSize)))}
                      disabled={currentPage === Math.ceil(totalItems / pageSize)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma imobiliária encontrada</h3>
              <p className="text-gray-500">Tente ajustar os seus filtros de busca.</p>
              <button
                onClick={() => setFilters({})}
                className="mt-6 text-purple-700 font-bold hover:underline"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}

          {/* CTA Section — Consistente com "Fique à frente no mercado" (Noticias) */}
          <div className="mt-20 relative bg-purple-900 rounded-3xl p-10 md:p-20 overflow-hidden mb-4 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">É uma imobiliária?</h2>
              <p className="text-purple-100 mb-10 text-lg leading-relaxed">
                Junte-se à maior plataforma imobiliária de Angola e alcance milhares de potenciais clientes todos os dias.
              </p>
              <Link
                href="/imobiliarias/registar"
                className="bg-white text-purple-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg inline-flex items-center gap-3 group"
              >
                <span>Torne a sua agência parceira</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (Mobile Only) */}
      <AnimatePresence>
        {(isSticky || (typeof window !== 'undefined' && window.innerWidth < 768)) && !showFilterModal && (
          <motion.button
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilterModal(true)}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-40 p-4 bg-orange-600 text-white rounded-2xl shadow-2xl backdrop-blur-md hover:bg-orange-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border border-white/20 min-w-[70px] min-h-[70px]"
          >
            <SlidersHorizontal size={24} className="mb-1" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-center leading-none">Filtros</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -left-2 bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border-2 border-white shadow-lg">
                {totalItems}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* PAINEL LATERAL DE FILTROS */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-[60] bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-[320px] max-h-[85vh] flex flex-col overflow-visible"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100/50 bg-white/50 rounded-t-3xl">
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

            {/* Conteúdo */}
            <div className="p-5 flex-1 space-y-4">
              <ImobiliariaFilters 
                onFilterChange={handleFilterChange} 
                onApply={() => setShowFilterModal(false)}
                isMobileModal={true} 
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100/50 bg-gray-50/50 flex justify-between items-center gap-4 rounded-b-3xl">
              <button
                onClick={() => {
                  setFilters({});
                  setShowFilterModal(false);
                }}
                className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                Limpar
              </button>
              <div className="text-xs font-medium text-gray-500">
                <strong className="text-gray-900 text-sm">{totalItems}</strong> imobiliárias
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

