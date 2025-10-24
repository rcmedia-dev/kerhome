'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validar email
      if (!email) {
        throw new Error('Por favor, digite seu email');
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Por favor, digite um email válido');
      }

      // Reset de senha com Supabase
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Erro no reset de senha:', err);
      
      // Mensagens de erro mais amigáveis
      if (err instanceof Error) {
        switch (err.message) {
          case 'User not found':
            setError('Nenhuma conta encontrada com este email');
            break;
          case 'Email rate limit exceeded':
            setError('Muitas tentativas. Tente novamente em alguns minutos');
            break;
          default:
            setError(err.message || 'Erro ao enviar email de recuperação');
        }
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-orange-500" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Email Enviado!
            </h1>
            <p className="text-gray-600 mb-2">
              Enviamos um link de recuperação para:
            </p>
            <p className="text-purple-700 font-semibold mb-6 break-all">{email}</p>
            <p className="text-gray-500 text-sm mb-8">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              O link expira em 1 hora.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full bg-purple-700 text-white py-3 px-4 rounded-xl hover:bg-purple-800 transition-colors font-medium"
              >
                Enviar para outro email
              </button>
              
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não recebeu o email?{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-purple-700 hover:text-purple-800 font-medium"
              >
                Reenviar
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            
            <div className="w-16 h-16 bg-gradient-to-br from-purple-700 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Recuperar Senha
            </h1>
            <p className="text-gray-600">
              Digite seu email para receber um link de recuperação
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-700 focus:border-purple-700 transition-all duration-200 bg-white placeholder-gray-400"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-700 to-orange-500 text-white py-3 px-4 rounded-xl hover:from-purple-800 hover:to-orange-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-700/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Enviar Link de Recuperação
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500">
                O link de recuperação expira em 1 hora
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Precisa de ajuda?{' '}
            <Link
              href="/contato"
              className="text-purple-700 hover:text-purple-800 font-medium"
            >
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}