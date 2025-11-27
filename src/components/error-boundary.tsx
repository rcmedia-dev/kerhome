'use client';

import React, { ReactNode, ReactElement } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactElement;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar erros em componentes React
 * 
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error) => (
 *     <div>Erro: {error.message}</div>
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado por ErrorBoundary:', error);
    console.error('Info do erro:', errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Algo deu errado
            </h1>

            <p className="text-gray-600 text-center mb-6">
              Desculpe, encontramos um erro. Tente recarregar a página ou contacte o suporte.
            </p>

            <details className="mb-6">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Detalhes do erro
              </summary>
              <pre className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40 text-red-600">
                {this.state.error.message}
              </pre>
            </details>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Recarregar Página
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full mt-3 text-purple-600 hover:text-purple-700 font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
