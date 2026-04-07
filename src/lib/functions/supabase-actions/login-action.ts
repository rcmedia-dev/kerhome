'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export type PlanoAgente = {
  id: string
  nome: string
  limite: number
  restante: number
  destaques: boolean
  destaques_permitidos: number
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  email: string
  primeiro_nome: string
  ultimo_nome: string
  username?: string
  telefone?: string
  empresa?: string
  licenca?: string
  website?: string
  facebook?: string
  linkedin?: string
  instagram?: string
  youtube?: string
  sobre_mim?: string
  pacote_agente?: PlanoAgente
  created_at?: string
  updated_at?: string
}

interface LoginResponse {
  success: boolean
  error?: string
  user?: UserProfile
}

function translateAuthError(errorMsg: string | undefined): string {
  if (!errorMsg) return 'Credenciais inválidas.';
  if (errorMsg.includes('fetch failed')) return 'Erro de conexão com o servidor. Verifique a sua internet e tente novamente.';
  if (errorMsg.includes('Invalid login credentials')) return 'Email ou senha incorretos. Por favor, tente novamente.';
  if (errorMsg.includes('Email not confirmed')) return 'Por favor, confirme o seu email antes de entrar.';
  if (errorMsg.includes('User not found')) return 'Usuário não encontrado.';
  return 'Ocorreu um erro ao fazer login. Tente novamente.';
}

export async function login(formData: FormData): Promise<LoginResponse> {
  const supabase = await createClient()

  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { success: false, error: 'Email e senha são obrigatórios' }
  }

  try {
    // 1. Autenticar com Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      console.error('Erro de autenticação:', authError)
      return { 
        success: false, 
        error: translateAuthError(authError?.message)
      }
    }

    // 2. Buscar perfil completo do usuário
   const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
        id,
        email,
        primeiro_nome,
        ultimo_nome,
        username,
        telefone,
        empresa,
        licenca,
        website,
        facebook,
        linkedin,
        instagram,
        youtube,
        role,
        sobre_mim,
        created_at,
        updated_at,
        pacote_agente:planos_agente(*)
    `)
    .eq('id', authData.user.id)
    .maybeSingle()

    if (profileError || !profile) {
      console.error('Erro ao buscar perfil:', profileError)
      await supabase.auth.signOut()
      return { 
        success: false, 
        error: 'Erro ao carregar perfil do usuário' 
      }
    }

    // 3. Armazenar sessão
    const { access_token, refresh_token } = authData.session!
    const cookie = await cookies()
    cookie.set('sb-access-token', access_token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 semana
    })
    cookie.set('sb-refresh-token', refresh_token, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 semana
    })

    const pacoteAgente = profile?.pacote_agente?.[0]

    // Create normalized user profile removing nulls
    const normalizedUser: any = { ...profile };
    if (pacoteAgente) normalizedUser.pacote_agente = pacoteAgente;

    Object.keys(normalizedUser).forEach(key => {
      if (normalizedUser[key] == null) {
        delete normalizedUser[key];
      }
    });

    return {
        success: true,
        user: normalizedUser as UserProfile
    }

  } catch (error) {
    console.error('Erro inesperado no login:', error)
    return { 
      success: false, 
      error: 'Ocorreu um erro durante o login' 
    }
  }
}
