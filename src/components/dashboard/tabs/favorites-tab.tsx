import React from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PropertyFavoritedCard } from '@/components/property-favorite-card';
import LoadingState from '@/app/propriedades/components/loading-state';
import { TPropertyResponseSchema } from '@/lib/types/property';

import {
  SectionHeader,
  EmptyState,
  AnimatedGrid
} from '@/components/dashboard/shared-ui';

type FavoritasProps = {
  userFavoriteProperties: TPropertyResponseSchema[] | null
}

export function Favoritas({ userFavoriteProperties }: FavoritasProps) {
  if (!userFavoriteProperties) return <LoadingState.LoadingGrid viewMode="grid" />;
  const hasFavorites = userFavoriteProperties && userFavoriteProperties.length > 0;

  return (
    <div className="w-full">
      <SectionHeader
        title="Imóveis Guardados"
        icon={Heart}
        description={`${userFavoriteProperties?.length || 0} propriedades salvas na sua lista`}
        className="mb-8 px-2"
      />

      <AnimatePresence mode="wait">
        {!hasFavorites ? (
          <EmptyState message="Nenhum imóvel guardado ainda." icon={Heart} />
        ) : (
          <AnimatedGrid>
            <AnimatePresence mode="popLayout">
              {userFavoriteProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PropertyFavoritedCard
                    property={{
                      ...property,
                      propertyid: property.propertyid || property.id,
                      price: property.price != null ? String(property.price) : null,
                      bedrooms: property.bedrooms ?? 0,
                      bathrooms: property.bathrooms ?? 0,
                      garagens: property.garagens ?? 0,
                      size: property.size ?? '',
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </AnimatedGrid>
        )}
      </AnimatePresence>
    </div>
  );
}
