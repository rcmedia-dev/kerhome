'use client';

import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface LocationTabProps {
  register: UseFormRegister<any>;
}

export const LocationTab = ({ register }: LocationTabProps) => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Localização</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Endereço Completo
          </label>
          <input
            {...register('endereco')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              País
            </label>
            <input
              {...register('pais')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Província
            </label>
            <input
              {...register('provincia')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Cidade
            </label>
            <input
              {...register('cidade')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Bairro
          </label>
          <input
            {...register('bairro')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
          />
        </div>
      </div>
    </div>
  );
};
