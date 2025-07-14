'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from './auth-context';
import { signup } from '@/lib/actions/signup-action';

interface Props {
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export function CustomSignUpForm({ onSuccess, onSwitchToSignIn }: Props) {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { setUser } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signup(formData);

    setLoading(false);

    if (result && result.success && result.user) {
      setUser(result.user);
      onSuccess(); // Fecha o modal
    } else {
      setError(result?.error || 'Erro ao criar conta');
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg w-full max-w-md">
      <div className="flex justify-center mb-4">
        <Image src="/kerhome_logo.png" alt="Kerhome Logo" width={100} height={100} />
      </div>

      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
        <p className="text-gray-500 text-sm">Preencha seus dados para continuar</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="relative w-1/2">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              placeholder=" "
              className="peer w-full px-4 py-4 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
            />
            <label htmlFor="firstName"
              className="absolute left-4 -top-3 bg-white px-1 text-gray-500 text-sm transition-all duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-purple-700"
            >
              Primeiro nome
            </label>
          </div>

          <div className="relative w-1/2">
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder=" "
              className="peer w-full px-4 py-4 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
            />
            <label htmlFor="lastName"
              className="absolute left-4 -top-3 bg-white px-1 text-gray-500 text-sm transition-all duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-purple-700"
            >
              Último nome
            </label>
          </div>
        </div>

        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder=" "
            className="peer w-full px-4 py-4 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
          />
          <label htmlFor="email"
            className="absolute left-4 -top-3 bg-white px-1 text-gray-500 text-sm transition-all duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-purple-700"
          >
            Email
          </label>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder=" "
            className="peer w-full px-4 py-4 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
          />
          <label htmlFor="password"
            className="absolute left-4 -top-3 bg-white px-1 text-gray-500 text-sm transition-all duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-purple-700"
          >
            Palavra‑passe
          </label>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white rounded-lg py-4 flex justify-center items-center transition ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'}`}
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {loading ? 'Criando...' : 'Criar Conta'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-sm text-gray-600 hover:text-purple-700 hover:underline"
        >
          Já tem uma conta? <span className="text-purple-700 font-semibold">Entrar agora</span>
        </button>

        <button
          type="button"
          onClick={() => {/* ação de ajuda futura */}}
          className="block text-sm text-gray-500 hover:underline w-full text-center"
        >
          Precisa de ajuda? <span className="text-orange-500">Fale conosco</span>
        </button>
      </div>
    </div>
  );
}
