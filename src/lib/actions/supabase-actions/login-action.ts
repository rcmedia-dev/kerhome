'use server'

import { supabase } from '@/lib/supabase'
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

export async function login(formData: FormData): Promise<LoginResponse> {
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
        error: authError?.message || 'Credenciais inválidas' 
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

    return {
        success: true,
        user: {
            id: profile?.id,
            email: profile?.email,
            primeiro_nome: profile?.primeiro_nome,
            ultimo_nome: profile?.ultimo_nome,
            ...(profile?.username && { username: profile.username }),
            ...(profile?.telefone && { telefone: profile.telefone }),
            ...(profile?.empresa && { empresa: profile.empresa }),
            ...(profile?.licenca && { licenca: profile.licenca }),
            ...(profile?.website && { website: profile.website }),
            ...(profile?.facebook && { facebook: profile.facebook }),
            ...(profile?.linkedin && { linkedin: profile.linkedin }),
            ...(profile?.instagram && { instagram: profile.instagram }),
            ...(profile?.youtube && { youtube: profile.youtube }),
            ...(profile?.sobre_mim && { sobre_mim: profile.sobre_mim }),
            ...(profile?.created_at && { created_at: profile.created_at }),
            ...(profile?.updated_at && { updated_at: profile.updated_at }),
            ...(pacoteAgente && {
            pacote_agente: {
                id: pacoteAgente.id,
                nome: pacoteAgente.nome,
                limite: pacoteAgente.limite,
                restante: pacoteAgente.restante,
                destaques: pacoteAgente.destaques,
                destaques_permitidos: pacoteAgente.destaques_permitidos,
                created_at: pacoteAgente.created_at,
                updated_at: pacoteAgente.updated_at
            }
            })
        }
    }

  } catch (error) {
    console.error('Erro inesperado no login:', error)
    return { 
      success: false, 
      error: 'Ocorreu um erro durante o login' 
    }
  }
}