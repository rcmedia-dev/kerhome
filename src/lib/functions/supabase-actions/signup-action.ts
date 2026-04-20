'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface SignUpResponse {
  success: boolean
  user?: {
    id: string
    email: string
    primeiro_nome: string
    ultimo_nome: string
  }
  error?: string
}

function translateSignUpError(errorMsg: string | undefined): string {
  if (!errorMsg) return 'Falha ao criar usuário.';
  if (errorMsg.includes('fetch failed')) return 'Erro de conexão com o servidor. Verifique a sua internet e tente novamente.';
  if (errorMsg.includes('User already registered')) return 'Este email já está registado.';
  if (errorMsg.includes('Password should be at least 6 characters')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (errorMsg.includes('Email rate limit exceeded')) return 'Muitas tentativas de registo com este email. Tente novamente mais tarde.';
  return 'Ocorreu um erro ao criar a conta. Tente novamente.';
}

export async function signUp(formData: FormData): Promise<SignUpResponse> {
  const supabase = await createClient();

  // Extração segura dos dados do formulário
  const email = formData.get('email')?.toString()?.trim()
  const password = formData.get('password')?.toString()
  const primeiro_nome = formData.get('primeiro_nome')?.toString()?.trim()
  const ultimo_nome = formData.get('ultimo_nome')?.toString()?.trim()

  // Validação completa dos campos
  if (!email || !password || !primeiro_nome || !ultimo_nome) {
    return {
      success: false,
      error: 'Todos os campos são obrigatórios'
    }
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'A senha deve ter pelo menos 6 caracteres'
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: 'Por favor, insira um email válido'
    }
  }

  try {
    // 1. Registrar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: primeiro_nome,
          last_name: ultimo_nome,
        },
      },
    })

    if (authError) {
      console.error('Erro no Supabase Auth:', authError)
      return {
        success: false,
        error: translateSignUpError(authError.message)
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Falha ao criar usuário: nenhum dado retornado'
      }
    }

   // 2. Buscar o plano FREE (já criado no banco)
    const { data: planoData, error: planoError } = await supabase
      .from('planos_agente')
      .select('id')
      .eq('nome', 'FREE')
      .single();

    if (planoError || !planoData) {
      console.error('Erro ao buscar pacote FREE:', planoError);
      return {
        success: false,
        error: 'Falha ao atribuir plano inicial'
      };
    }

    // 3. Atualizar o profile do usuário com o plano FREE
    const { error: profilePlanError } = await supabase
      .from('profiles')
      .update({ pacote_agente_id: planoData.id })
      .eq('id', authData.user.id);

    if (profilePlanError) {
      console.error('Erro ao atualizar profile com plano FREE:', profilePlanError);
      return {
        success: false,
        error: 'Falha ao associar plano inicial ao usuário'
      };
    }

    // 4. Criar perfil do usuário (Note: if you have a trigger on auth.users for profile creation, this might be redundant or needed depending on its implementation)
    // Here we update/insert the remaining info. 
    // Usually it's better to update since triggers might have created it already.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        primeiro_nome: primeiro_nome,
        ultimo_nome: ultimo_nome,
        role: formData.get('role') || 'user',
        status: 'active',
        pacote_agente_id: planoData.id
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      return {
        success: false,
        error: 'Falha ao criar perfil do usuário'
      }
    }

    // Login automático
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (sessionError || !sessionData.session) {
      console.error('Erro no login automático:', sessionError)
      return {
        success: false,
        error: 'Conta criada, mas falha no login automático'
      }
    }

    // Armazenar sessão
    const { access_token, refresh_token } = sessionData.session
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

    return {
      success: true,
      user: {
        id: authData.user.id,
        email,
        primeiro_nome,
        ultimo_nome
      }
    }

  } catch (error) {
    console.error('Erro inesperado no cadastro:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado durante o cadastro'
    }
  }
}
