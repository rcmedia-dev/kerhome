'use client';

import React from 'react';
import { UseFormRegister } from 'react-hook-form';

interface NotesTabProps {
  register: UseFormRegister<any>;
}

export const NotesTab = ({ register }: NotesTabProps) => {
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
      </div>
    </div>
  );
};
