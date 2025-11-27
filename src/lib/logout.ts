'use server'

import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function logout() {
  try {
    // 1. Encerrar sessão no Supabase
    const { error } = await supabase.auth.signOut()
    const cookie = await cookies()
    
    if (error) {
      console.error('Erro ao fazer logout:', error)
      return { success: false, error: error.message }
    }

    // 2. Remover cookies de autenticação
    cookie.delete('sb-access-token')
    cookie.delete('sb-refresh-token')

    // 3. Retornar sucesso (o redirecionamento deve ser tratado no cliente)
    return { success: true }
    
  } catch (error) {
    console.error('Erro durante o logout:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}