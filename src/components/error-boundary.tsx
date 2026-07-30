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

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className="min-h-50 bg-linear-to from-red-50 to-orange-50 flex items-center justify-center p-4 rounded-2xl">
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
              Encontrámos um erro. Podes recarregar a página.
            </p>

            <details className="mb-4">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                Detalhes do erro
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32 text-red-600">
                {this.state.error.message}
              </pre>
            </details>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-linear-to from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-2.5 rounded-lg transition-all text-sm"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
