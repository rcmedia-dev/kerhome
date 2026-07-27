'use client';

import React, { ReactNode, ReactElement } from 'react';
import { AlertTriangle, Flag } from 'lucide-react';
import { getErrorContext } from '@/lib/error-feedback';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactElement;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary:', error);
  }

  handleOpenFeedback = () => {
    if (this.state.error) {
      const errorContext = getErrorContext(this.state.error);
      window.dispatchEvent(
        new CustomEvent('kerhome:error-feedback:open', {
          detail: { errorContext },
        })
      );
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className="min-h-[200px] bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4 rounded-2xl">
          <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
              Algo deu errado
            </h2>

            <p className="text-gray-600 text-center text-sm mb-4">
              Encontrámos um erro. Podes recarregar a página ou reportar o problema.
            </p>

            <details className="mb-4">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                Detalhes do erro
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32 text-red-600">
                {this.state.error.message}
              </pre>
            </details>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-2.5 rounded-lg transition-all text-sm"
              >
                Recarregar Página
              </button>

              <button
                onClick={this.handleOpenFeedback}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-purple-700 font-medium py-2.5 rounded-lg transition-all border border-gray-200 hover:border-purple-300 text-sm"
              >
                <Flag className="h-4 w-4" />
                Reportar Este Erro
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
