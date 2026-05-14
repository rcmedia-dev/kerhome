'use client';

import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, useFormContext } from 'react-hook-form';
import { formatarPreco, unidadesPreco, opcoesPrecoChamada } from './constants';

interface PriceTabProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export const PriceTab = ({ register, setValue, watch }: PriceTabProps) => {
  const { formState: { errors } } = useFormContext();
  const precoValue = watch('price') || '';
  
  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarPreco(e.target.value);
    const valorNumerico = valorFormatado.replace(/\D/g, '');
    setValue('price', valorNumerico ? Number(valorNumerico) : null, { shouldValidate: true });
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Preço e Dimensões</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Preço
            </label>
            <input
              value={precoValue ? formatarPreco(precoValue) : ''}
              onChange={handlePrecoChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700 ${
                errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price.message as string}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Unidade de Preço
            </label>
            <select
              {...register('unidade_preco')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            >
              <option value="">Selecione</option>
              {unidadesPreco.map(unidade => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Preço por Chamada
            </label>
            <select
              {...register('preco_chamada')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            >
              <option value="">Selecione</option>
              {opcoesPrecoChamada.map(opcao => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Quartos
            </label>
            <input
              type="number"
              {...register('bedrooms')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Banheiros
            </label>
            <input
              type="number"
              {...register('bathrooms')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Área (m²)
            </label>
            <input
              {...register('size')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tamanho da Garagem
            </label>
            <input
              {...register('garagem_tamanho')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-700 focus:border-purple-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
