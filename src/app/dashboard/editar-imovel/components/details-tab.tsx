'use client';

import React from 'react';
import { UseFormRegister, Control } from 'react-hook-form';
import { Plus, Trash } from 'lucide-react';
import { caracteristicasOptions } from './constants';

interface DetailsTabProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  fields: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
}

export const DetailsTab = ({ register, fields, append, remove }: DetailsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Características</h2>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {caracteristicasOptions.map((caracteristica) => (
            <label key={caracteristica} className="flex items-center p-2 space-x-2 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                value={caracteristica}
                {...register('caracteristicas')}
                className="w-4 h-4 text-purple-700 border-gray-300 rounded focus:ring-purple-700"
              />
              <span className="text-sm text-gray-700">{caracteristica}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Detalhes Adicionais</h2>
          <button
            type="button"
            onClick={() => append({ titulo: '', valor: '' })}
            className="flex items-center px-3 py-1 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-gray-700">Título</label>
                <input
                  {...register(`detalhes_adicionais.${index}.titulo` as const)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium text-gray-700">Valor</label>
                <input
                  {...register(`detalhes_adicionais.${index}.valor` as const)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
