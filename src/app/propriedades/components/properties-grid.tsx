'use client';

import { motion, AnimatePresence, easeIn, easeOut } from 'framer-motion';
import { PropertyCard } from '@/components/property-card';
import { TPropertyResponseSchema } from '@/lib/types/property';
import { EmptyState, LoadingGrid, LoadMoreState } from './loading-state';

interface PropertiesGridProps {
  loading: boolean;
  filteredProperties: TPropertyResponseSchema[];
  viewMode: 'grid';
  loadingMore: boolean;
  hasMore: boolean;
  resetFilters: () => void;
}

// Animação otimizada
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: easeIn },
  },
};

export default function PropertiesGrid({
  loading,
  filteredProperties,
  viewMode,
  loadingMore,
  hasMore,
  resetFilters,
}: PropertiesGridProps) {
  if (loading) return <LoadingGrid viewMode={viewMode} />;
  if (filteredProperties.length === 0) return <EmptyState resetFilters={resetFilters} />;

  return (
    <>
      <motion.div
        layout="position"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="
          grid gap-6 w-full mx-auto
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
      >
        <AnimatePresence mode="popLayout">
          {filteredProperties.map((property) => (
            <motion.div
              key={property.id}
              variants={cardVariants}
              layout="position"
              className="transform hover:scale-[1.01] transition-transform duration-200"
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <LoadMoreState
        loadingMore={loadingMore}
        hasMore={hasMore}
        filteredProperties={filteredProperties}
      />
    </>
  );
}
