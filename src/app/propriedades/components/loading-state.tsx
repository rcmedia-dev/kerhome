import { motion } from 'framer-motion';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-3 border-purple-200 border-t-purple-600 animate-spin"></div>
      <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-3 border-transparent border-t-orange-500 animate-spin" 
           style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
    </div>
  </div>
);

// Loading Grid Skeleton
export const LoadingGrid = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <div className={`grid gap-8 ${
    viewMode === 'grid' 
      ? 'grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3' 
      : 'grid-cols-1'
  }`}>
    {[...Array(9)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
      >
        <div className="bg-gray-300 h-64 rounded-xl mb-4"></div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="flex gap-3">
            <div className="h-8 bg-gray-300 rounded w-20"></div>
            <div className="h-8 bg-gray-300 rounded w-20"></div>
            <div className="h-8 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
export const EmptyState = ({ resetFilters }: { resetFilters: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="text-center py-20 bg-white rounded-2xl shadow-xl border border-gray-200"
  >
    <div className="w-32 h-32 mx-auto mb-6 text-gray-400">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
    <h3 className="text-3xl font-bold text-gray-800 mb-4">
      Nenhum imóvel encontrado
    </h3>
    <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
      Não encontramos propriedades que correspondam aos seus critérios de busca. 
      Tente ajustar os filtros para ver mais resultados.
    </p>
    <button
      onClick={resetFilters}
      className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 duration-200"
    >
      Limpar Todos os Filtros
    </button>
  </motion.div>
);

// Load More State Component
export const LoadMoreState = ({ 
  loadingMore, 
  hasMore, 
  filteredProperties 
}: { 
  loadingMore: boolean;
  hasMore: boolean;
  filteredProperties: any[];
}) => (
  <>
    {loadingMore && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-16"
      >
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-6 text-xl font-semibold">
            Carregando mais imóveis...
          </p>
        </div>
      </motion.div>
    )}

    {!hasMore && filteredProperties.length > 0 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center py-16"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 py-12">
          <p className="text-gray-600 text-2xl font-bold mb-4">
            🎉 Você encontrou todos os imóveis disponíveis!
          </p>
          <p className="text-gray-400 text-lg">
            Volte em breve para novas oportunidades
          </p>
        </div>
      </motion.div>
    )}
  </>
);

// Export all loading states as a namespace
export default {
  LoadingSpinner,
  LoadingGrid,
  EmptyState,
  LoadMoreState
};