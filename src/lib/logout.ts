'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  try {
    const supabase = await createClient();
    
    // 1. Encerrar sessão no Supabase
    const { error } = await supabase.auth.signOut()
    const cookie = await cookies()
    
    if (error) {
      console.error('Erro ao fazer logout:', error)
      return { success: false, error: error.message }
    }

    // 2. Remover cookies de autenticação (supostamente cuidados pelo @supabase/ssr, mas aqui está manual)
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
