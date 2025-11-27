'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Home } from 'lucide-react';
import { PROPERTY_FEATURES } from '@/lib/constants/app';

export function DetailsTab() {
  const { control } = useFormContext();

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Home className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold">Detalhes da Propriedade</h2>
      </div>

      <div className="space-y-4">
        {/* Quartos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quartos
          </label>
          <Controller
            name="bedrooms"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </>
            )}
          />
        </div>

        {/* Banheiros */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banheiros
          </label>
          <Controller
            name="bathrooms"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </>
            )}
          />
        </div>

        {/* Tamanho */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tamanho (m²)
          </label>
          <Controller
            name="size"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </>
            )}
          />
        </div>

        {/* Garagens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Garagens
          </label>
          <Controller
            name="garagens"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          />
        </div>

        {/* Ano de Construção */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ano de Construção
          </label>
          <Controller
            name="ano_construcao"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder={new Date().getFullYear().toString()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          />
        </div>

        {/* Características */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Características
          </label>
          <Controller
            name="caracteristicas"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROPERTY_FEATURES.map((feature) => (
                  <label key={feature} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value?.includes(feature) || false}
                      onChange={(e) => {
                        const current = field.value || [];
                        if (e.target.checked) {
                          field.onChange([...current, feature]);
                        } else {
                          field.onChange(current.filter((f: string) => f !== feature));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
