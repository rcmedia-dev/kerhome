'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface QueryErrorProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
}

export function QueryError({
  error,
  onRetry,
  title = 'Erro ao carregar dados',
  message = 'Houve um problema ao carregar os dados. Tente novamente.',
  showDetails = false,
}: QueryErrorProps) {
  if (!error) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>

        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {title}
          </h3>

          <p className="text-red-700 mb-4">
            {message}
          </p>

          {showDetails && (
            <details className="mb-4">
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-700 font-medium">
                Ver detalhes
              </summary>
              <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto max-h-40 text-red-800">
                {error.message}
              </pre>
            </details>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface QueryLoadingProps {
  message?: string;
  showSpinner?: boolean;
}

export function QueryLoading({ message = 'Carregando...', showSpinner = true }: QueryLoadingProps) {
  return (
    <div className="w-full flex items-center justify-center py-12">
      {showSpinner && (
        <div className="mr-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      )}
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  );
}

interface QueryEmptyProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function QueryEmpty({
  title = 'Nenhum dado encontrado',
  message = 'Não há dados disponíveis no momento.',
  action,
}: QueryEmptyProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <span className="text-3xl">📭</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-600 mb-6 max-w-sm">
        {message}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
