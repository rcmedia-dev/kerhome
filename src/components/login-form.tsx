'use client'

import React from 'react'
import Image from 'next/image'
import { useAuth } from './auth-context'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/actions/supabase-actions/login-action'

interface Props {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
}

export function CustomSignInForm({ onSuccess, onSwitchToSignUp }: Props) {
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const { setUser } = useAuth()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await login(formData)

      if (result.success && result.user) {
        handleLoginSuccess(result.user)
      } else {
        setError(result.error || 'Erro ao fazer login')
      }
    } catch (err) {
      handleLoginError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (userData: any) => {
    // Salvando usuário no contexto
    setUser({
      id: userData.id,
      email: userData.email || '',
      primeiro_nome: userData.primeiro_nome || '',
      ultimo_nome: userData.ultimo_nome || '',
      username: userData.username || undefined,
      telefone: userData.telefone || undefined,
      empresa: userData.empresa || undefined,
      licenca: userData.licenca || undefined,
      website: userData.website || undefined,
      facebook: userData.facebook || undefined,
      linkedin: userData.linkedin || undefined,
      instagram: userData.instagram || undefined,
      youtube: userData.youtube || undefined,
      sobre_mim: userData.sobre_mim || undefined,
      role: userData.role || 'user', // <- adicionando role
      ...(userData.pacote_agente && {
        pacote_agente: {
          id: userData.pacote_agente.id || '',
          nome: userData.pacote_agente.nome || '',
          limite: userData.pacote_agente.limite || 0,
          restante: userData.pacote_agente.restante || 0,
          destaques: userData.pacote_agente.destaques || false,
          destaques_permitidos: userData.pacote_agente.destaques_permitidos || 0,
          created_at: userData.pacote_agente.created_at || '',
          updated_at: userData.pacote_agente.updated_at || ''
        }
      })
    })

    // Redirecionamento baseado na role
    if (userData.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }

    onSuccess?.()
  }

  const handleLoginError = (error: any) => {
    setError('Erro ao processar o formulário')
    console.error('Login error:', error)
  }

  return (
    <div className="p-6 bg-white rounded-lg w-full max-w-md">
      <div className="flex justify-center mb-4">
        <Image 
          src="/kerhome_logo.png" 
          alt="Kerhome Logo" 
          width={100} 
          height={100}
          priority
        />
      </div>
      
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
        <p className="text-gray-500 text-sm">Acesse sua conta para continuar</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormInput 
          id="email"
          name="email"
          type="email"
          required
          label="Email"
        />
        
        <FormInput 
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          label="Senha"
        />

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <SubmitButton loading={loading} />
      </form>

      <div className="mt-6 text-center space-y-2">
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-sm text-gray-600 hover:text-purple-700 hover:underline"
        >
          Não tem uma conta? <span className="text-purple-700 font-semibold">Criar agora</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/forgot-password')}
          className="block text-sm text-gray-500 hover:underline w-full text-center"
        >
          Esqueceu a senha? <span className="text-orange-500">Recuperar senha</span>
        </button>
      </div>
    </div>
  )
}

const FormInput = ({ id, name, type, required, label, minLength }: {
  id: string
  name: string
  type: string
  required?: boolean
  label: string
  minLength?: number
}) => (
  <div className="relative">
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      minLength={minLength}
      placeholder=" "
      className="peer w-full px-4 py-4 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700"
    />
    <label
      htmlFor={id}
      className="absolute left-4 -top-3 bg-white px-1 text-gray-500 text-sm transition-all duration-150 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-purple-700"
    >
      {label}
    </label>
  </div>
)

const SubmitButton = ({ loading }: { loading: boolean }) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full text-white rounded-lg py-4 flex justify-center items-center transition ${
      loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'
    }`}
  >
    {loading ? (
      <>
        <Spinner />
        Entrando...
      </>
    ) : (
      'Entrar'
    )}
  </button>
)

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 mr-3 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)
