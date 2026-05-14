'use client';

import React from 'react';
import { UseFormRegister, useFormContext } from 'react-hook-form';
import { tiposPropriedade, statusOptions } from './constants';

interface InfoTabProps {
  register: UseFormRegister<any>;
}

export const InfoTab = ({ register }: InfoTabProps) => {
  const { formState: { errors } } = useFormContext();

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Informações Básicas</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Título da Propriedade
          </label>
          <input
            {...register('title')}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 ${
              errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message as string}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tipo de Propriedade
            </label>
            <select
              {...register('tipo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            >
              <option value="">Selecione um tipo</option>
              {tiposPropriedade.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            >
              <option value="">Selecione um status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Rótulo
            </label>
            <input
              {...register('rotulo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Ano de Construção
            </label>
            <input
              type="number"
              {...register('ano_construcao')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Área do Terreno (m²)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('area_terreno')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Garagens
            </label>
            <input
              type="number"
              {...register('garagens')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
