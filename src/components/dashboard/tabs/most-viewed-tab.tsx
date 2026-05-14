import React from 'react';
import { Eye, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PropertyCard } from '@/components/property-card';
import LoadingState from '@/app/propriedades/components/loading-state';
import { TMyPropertiesWithViews } from '@/lib/functions/supabase-actions/property-views-actions';

import {
  SectionHeader,
  EmptyState,
  AnimatedGrid
} from '@/components/dashboard/shared-ui';

type MostViewedProps = {
  mostViewedProperties: TMyPropertiesWithViews | null;
};

export function PropriedadesMaisVisualizadas({ mostViewedProperties }: MostViewedProps) {
  if (!mostViewedProperties) return <LoadingState.LoadingGrid viewMode="grid" />;
  const hasProperties = mostViewedProperties?.properties?.length > 0;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6 px-2">
        <SectionHeader
          title="Top Visualizações"
          icon={Eye}
          description="Imóveis que mais atraíram o interesse do público"
          className="mb-0"
        />

        <motion.div
          whileHover={{ y: -4 }}
          className="flex items-center gap-4 bg-white p-3 pr-6 rounded-card border border-border shadow-card"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-500 rounded-button flex items-center justify-center shadow-card shadow-purple-600/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visualizações Totais</p>
            <p className="text-2xl font-black bg-gradient-to-r from-purple-700 to-orange-500 bg-clip-text text-transparent">
              {mostViewedProperties.total_views_all.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!hasProperties ? (
          <EmptyState message="Nenhuma propriedade visualizada ainda." icon={Eye} />
        ) : (
          <AnimatedGrid>
            <AnimatePresence mode="popLayout">
              {mostViewedProperties.properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <PropertyCard property={property} />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-button text-xs font-bold shadow-card flex items-center gap-1.5 border border-white/50 ring-1 ring-black/5">
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    <span>{property.total_views}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </AnimatedGrid>
        )}
      </AnimatePresence>
    </div>
  );
}
