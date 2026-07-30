'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Algo deu errado
        </h1>

        <p className="text-gray-600 mb-6">
          Desculpe, encontramos um erro inesperado. 
          Tente recarregar a página ou volte ao início.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
        >
          Recarregar Página
        </button>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full mt-3 flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-semibold py-3 rounded-lg transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
