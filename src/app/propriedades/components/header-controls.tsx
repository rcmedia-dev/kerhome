"use client";

import { motion } from "framer-motion";
import { TPropertyResponseSchema } from "@/lib/types/property";

interface HeaderControlsProps {
  filteredProperties: TPropertyResponseSchema[];
}

export default function HeaderControls({
  filteredProperties
}: HeaderControlsProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-200"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {filteredProperties.length} Imóveis Encontrados
          </h2>
        </div>

        {/* Right - Dropdown moderno */}
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-700">Ordenar por:</span>
          <div className="relative">
            <select
              value=""
              className="appearance-none px-5 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-700 font-semibold shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all pr-10"
            >
              <option value="recent">Mais Recente</option>
              <option value="price-low">Menor Preço</option>
              <option value="price-high">Maior Preço</option>
              <option value="size">Maior Área</option>
              <option value="bedrooms">Mais Quartos</option>
            </select>
            {/* Ícone da seta */}
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
              ▼
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
