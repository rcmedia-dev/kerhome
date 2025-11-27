'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { PROPERTY_TYPES, PROPERTY_STATUS, PRICE_CALL_OPTIONS, CURRENCIES } from '@/lib/constants/app';

export function BasicDetailsTab() {
  const { control, watch } = useFormContext();

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Detalhes Básicos</h2>

      <div className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título do Imóvel *
          </label>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="Ex: Apartamento 2 quartos em Luanda"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </>
            )}
          />
        </div>

        {/* Tipo de Propriedade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Propriedade *
          </label>
          <Controller
            name="tipo"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um tipo</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </>
            )}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um status</option>
                  {PROPERTY_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status === 'comprar' ? 'Para Comprar' : 'Para Arrendar'}
                    </option>
                  ))}
                </select>
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </>
            )}
          />
        </div>

        {/* Preço */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço *
            </label>
            <Controller
              name="price"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {error && <span className="text-red-500 text-sm">{error.message}</span>}
                </>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moeda *
            </label>
            <Controller
              name="unidade_preco"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecione</option>
                    {CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  {error && <span className="text-red-500 text-sm">{error.message}</span>}
                </>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Preço *
            </label>
            <Controller
              name="preco_chamada"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecione</option>
                    {PRICE_CALL_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {error && <span className="text-red-500 text-sm">{error.message}</span>}
                </>
              )}
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <textarea
                  {...field}
                  placeholder="Descreva o imóvel..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {error && <span className="text-red-500 text-sm">{error.message}</span>}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
