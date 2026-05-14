'use client';

import React from 'react';
import { Controller, UseFormRegister, Control } from 'react-hook-form';

interface NotesTabProps {
  register: UseFormRegister<any>;
  control: Control<any>;
}

export const NotesTab = ({ register, control }: NotesTabProps) => {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Notas Internas</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Anotações privadas sobre a propriedade
          </label>
          <textarea
            {...register('nota_privada')}
            rows={8}
            placeholder="Adicione observações privadas, informações relevantes ou detalhes importantes sobre esta propriedade..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <div className="flex items-center">
          <Controller
            name="is_featured"
            control={control}
            render={({ field }) => (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={field.onChange}
                  className="w-4 h-4 text-purple-700 border-gray-300 rounded focus:ring-purple-700"
                />
                <span className="text-sm text-gray-700">Destacar esta propriedade</span>
              </label>
            )}
          />
        </div>
      </div>
    </div>
  );
};
