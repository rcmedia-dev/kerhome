import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

// Loading Grid Skeleton with Shimmer Effect
export const LoadingGrid = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
  <div className={cn(
    "grid gap-8",
    viewMode === 'grid' 
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
      : 'grid-cols-1'
  )}>
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-card shadow-card relative overflow-hidden group border border-border flex flex-col"
        style={{ animationDelay: `${i * 0.05}s` }}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer z-10" />
        
        {/* Image skeleton */}
        <div className="bg-gray-100 h-[180px] sm:h-[250px] w-full shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          {/* Badge skeletons */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <div className="h-6 w-20 bg-gray-300/60 rounded-badge animate-pulse" />
            <div className="h-5 w-24 bg-gray-300/40 rounded-md animate-pulse" />
          </div>
          {/* Heart button skeleton */}
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-gray-200 rounded-badge animate-pulse" />
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 px-3 sm:px-5 pt-3 sm:pt-5 pb-3 sm:pb-4 flex flex-col">
          {/* Location */}
          <div className="h-3 sm:h-4 bg-gray-100 rounded-button w-3/4 mb-1 sm:mb-1.5 animate-pulse" />
          
          {/* Title */}
          <div className="h-5 sm:h-7 bg-gray-200 rounded-button w-full mb-1 animate-pulse" />
          <div className="h-5 sm:h-7 bg-gray-200 rounded-button w-2/3 mb-2 sm:mb-3 animate-pulse" />
          
          {/* Bedrooms & Size */}
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2 border-b border-gray-50 pb-1.5 sm:pb-2">
            <div className="h-4 sm:h-5 w-16 bg-gray-100 rounded-button animate-pulse" />
            <div className="h-4 sm:h-5 w-20 bg-gray-100 rounded-button animate-pulse" />
          </div>
          
          {/* Type & Bathrooms */}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="h-3 sm:h-4 w-24 bg-gray-100 rounded-button animate-pulse" />
            <div className="h-3 sm:h-4 w-20 bg-gray-100 rounded-button animate-pulse" />
          </div>
          
          {/* Price */}
          <div className="h-6 sm:h-8 w-40 bg-gray-200 rounded-button mb-2 sm:mb-4 animate-pulse" />
          
          {/* Footer button */}
          <div className="pt-2 sm:pt-4 mt-auto border-t border-gray-100">
            <div className="h-10 sm:h-12 bg-gray-100 rounded-button animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Loading List Skeleton for Table-like views
export const LoadingList = ({ count = 5 }) => (
  <div className="space-y-4 w-full">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-card shadow-card p-5 relative overflow-hidden border border-border flex items-center gap-4"
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer z-10" />
        
        <div className="w-12 h-12 bg-gray-100 rounded-button shrink-0 animate-pulse"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded-button w-1/3 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded-button w-1/4 animate-pulse"></div>
        </div>
        <div className="hidden sm:block space-y-2">
          <div className="h-4 bg-gray-100 rounded-button w-24 animate-pulse"></div>
        </div>
        <div className="w-20 h-8 bg-gray-100 rounded-button animate-pulse"></div>
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
            ðŸŽ‰ Você encontrou todos os imóveis disponíveis!
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
  LoadingList,
  EmptyState,
  LoadMoreState
};
