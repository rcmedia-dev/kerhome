'use client';

import { useState, useEffect } from 'react';
import { ImobiliariaFilters } from '@/components/imobiliarias/imobiliaria-filters';
import { ImobiliariaCard } from '@/components/imobiliarias/imobiliaria-card';
import { fetchImobiliarias } from '@/lib/functions/supabase-actions/imobiliaria-actions';
import { Imobiliaria } from '@/lib/types/imobiliaria';
import { Building2, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ImobiliariasPage() {
  const [imobiliarias, setImobiliarias] = useState<Imobiliaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6;

  const loadData = async (currentFilters: any, page: number) => {
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
  };

  useEffect(() => {
    loadData(filters, currentPage);
  }, [filters, currentPage]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCityTab = (city: string) => {
    setFilters({ ...filters, cidade: city });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-100 mb-12">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              Imobiliárias <span className="bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">Parceiras</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
              Conectamos você às empresas mais confiáveis do mercado angolano. Qualidade e transparência em cada transação.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <ImobiliariaFilters onFilterChange={handleFilterChange} />

          {/* City Quick Tabs (Inspired by screenshot) */}
          <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
            <button
              onClick={() => handleCityTab('')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!filters.cidade ? 'bg-orange-100 text-orange-700 shadow-sm border border-orange-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              Todas
            </button>
            {['Luanda', 'Benguela', 'Huila', 'Cabinda', 'Huambo'].map(city => (
              <button
                key={city}
                onClick={() => handleCityTab(city)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filters.cidade === city ? 'bg-orange-100 text-orange-700 shadow-sm border border-orange-200' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                {city}
              </button>
            ))}
          </div>

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
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / pageSize)))}
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

          {/* CTA Section */}
          <div className="mt-20 bg-gradient-to-br from-purple-800 to-indigo-900 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">É uma imobiliária?</h2>
            <p className="text-purple-100 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
              Junte-se à maior plataforma imobiliária de Angola e alcance milhares de potenciais clientes todos os dias.
            </p>
            <Link
              href="/imobiliarias/registar"
              className="bg-orange-500 text-white px-12 py-6 rounded-xl font-black hover:bg-white hover:text-purple-900 transition-all duration-500 transform hover:scale-110 inline-flex items-center gap-3 shadow-2xl shadow-orange-500/40 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Torne a sua agência parceira</span>
              <ArrowRight className="w-7 h-7 relative z-10 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

