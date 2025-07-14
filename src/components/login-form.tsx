'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from './auth-context';
import { login } from '@/lib/actions/login-action';

interface Props {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export function CustomSignInForm({ onSuccess, onSwitchToSignUp }: Props) {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { setUser } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    setLoading(false);

    if (result.success && result.user) {
      setUser({
        id: result.user.id,
        email: result.user.email,
        primeiro_nome: result.user.primeiro_nome,
        ultimo_nome: result.user.ultimo_nome,
        username: result.user.username,
        telefone: result.user.telefone,
        empresa: result.user.empresa,
        licenca: result.user.licenca,
        website: result.user.website,
        facebook: result.user.facebook,
        linkedin: result.user.linkedin,
        instagram: result.user.instagram,
        youtube: result.user.youtube,
        sobre_mim: result.user.sobre_mim,
        pacote_agente: result.user.pacote_agente,
      });
      onSuccess(); // Fecha o modal ou redireciona
    } else {
      setError(result.error || 'Erro ao fazer login');
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg w-full max-w-md">
      <div className="flex justify-center mb-4">
        <Image src="/kerhome_logo.png" alt="Kerhome Logo" width={100} height={100} />
      </div>

      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bem‑vindo de volta</h2>
        <p className="text-gray-500 text-sm">Acesse sua conta para continuar</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder=" "
            className="peer w-full px-4 py-4 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
          />
          <label
            htmlFor="email"
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
          <label
            htmlFor="password"
            className="absolute left-4 -top-3 bg-white px-1 text-gray-500 text-sm transition-all duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-purple-700"
          >
            Palavra‑passe
          </label>
        </div>

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
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <button
          onClick={onSwitchToSignUp}
          className="text-sm text-gray-600 hover:text-purple-700 hover:underline"
        >
          Não tem uma conta? <span className="text-purple-700 font-semibold">Criar agora</span>
        </button>

        <a href="#" className="block text-sm text-gray-500 hover:underline">
          Esqueceu a senha? <span className="text-orange-500">Recuperar senha</span>
        </a>
      </div>
    </div>
  );
}
