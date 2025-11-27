'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { MapPin } from 'lucide-react';

export function LocationTab() {
  const { control } = useFormContext();

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold">Localização</h2>
      </div>

      <div className="space-y-4">
        {/* Endereço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço *
          </label>
          <Controller
            name="endereco"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="Ex: Rua Principal, 123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </>
            )}
          />
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <Controller
            name="bairro"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ex: Miramar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          />
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade
          </label>
          <Controller
            name="cidade"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ex: Luanda"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          />
        </div>

        {/* Província */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Província
          </label>
          <Controller
            name="provincia"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ex: Luanda"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          />
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            País
          </label>
          <Controller
            name="pais"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Ex: Angola"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
