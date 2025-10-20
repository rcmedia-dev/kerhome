'use client'

import React from 'react'
import Image from 'next/image'
import { signUp } from '@/lib/actions/supabase-actions/signup-action'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store/user-store'

interface Props {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

export function CustomSignUpForm({ onSuccess, onSwitchToSignIn }: Props) {
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const { setUser, fetchUserProfile } = useUserStore()
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      
      // Validação adicional do lado do cliente
      const password = formData.get('password') as string
      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres')
      }

      const result = await signUp(formData)

      if (result?.success && result.user) {
        // Buscar o perfil completo do usuário após o cadastro
        const userProfile = await fetchUserProfile(result.user.id)
        
        if (userProfile) {
          setUser(userProfile)
        } else {
          // Fallback caso não consiga buscar o perfil completo
          setUser({
            id: result.user.id,
            email: result.user.email,
            primeiro_nome: result.user.primeiro_nome,
            ultimo_nome: result.user.ultimo_nome,
            username: `${result.user.primeiro_nome} ${result.user.ultimo_nome}`,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
        
        onSuccess?.()
        router.push('/dashboard') // Redireciona após cadastro
      } else {
        throw new Error(result?.error || 'Erro ao criar conta')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Componente de spinner reutilizável
  const Spinner = () => (
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
  )

  return (
    <div className="p-6 bg-white rounded-lg w-full max-w-md">
      <div className="flex justify-center mb-4">
        <Image 
          src="/kercasa_logo.png" 
          alt="Kerhome Logo" 
          width={100} 
          height={100} 
          priority
        />
      </div>

      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
        <p className="text-gray-500 text-sm">Preencha seus dados para continuar</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <FloatingInput 
            id="primeiro_nome"
            name="primeiro_nome"
            type="text"
            label="Primeiro nome"
            required
          />
          
          <FloatingInput 
            id="ultimo_nome"
            name="ultimo_nome"
            type="text"
            label="Último nome"
            required
          />
        </div>

        <FloatingInput 
          id="email"
          name="email"
          type="email"
          label="Email"
          required
        />

        <FloatingInput 
          id="password"
          name="password"
          type="password"
          label="Palavra-passe"
          required
          minLength={6}
        />

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white rounded-lg py-4 flex justify-center items-center transition ${
            loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'
          }`}
        >
          {loading && <Spinner />}
          {loading ? 'Criando conta...' : 'Criar Conta'}
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

        <div className="pt-2 text-xs text-gray-500">
          Ao se registrar, você concorda com nossos{' '}
          <a href="/terms" className="text-purple-700 hover:underline">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="/privacy" className="text-purple-700 hover:underline">
            Política de Privacidade
          </a>.
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para inputs com floating labels
const FloatingInput = ({
  id,
  name,
  type,
  label,
  required,
  ...props
}: {
  id: string
  name: string
  type: string
  label: string
  required?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      placeholder=" "
      className="peer w-full px-4 py-4 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
      {...props}
    />
    <label
      htmlFor={id}
      className="absolute left-4 -top-3 bg-white px-1 text-gray-500 text-sm transition-all duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-purple-700"
    >
      {label}
    </label>
  </div>
)