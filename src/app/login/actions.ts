'use server'


import { supabaseServer } from '@/lib/supabase-server';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  if (!email || !password) {
    return { success: false, error: 'Email ou senha não fornecidos' };
  }
  try {
    const { data, error } = await supabaseServer.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    const user = data.user;
    return {
      success: true,
      session: data.session,
      profile: {
        first_name: user?.user_metadata?.first_name || '',
        last_name: user?.user_metadata?.last_name || '',
        avatar_url: user?.user_metadata?.avatar_url || '',
        role: user?.role || 'free',
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao fazer login' };
  }
}

export async function signup(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  if (!firstName || !lastName || !email || !password) {
    return { success: false, error: 'Dados obrigatórios não fornecidos' };
  }
  try {
    const { data, error } = await supabaseServer.auth.signUp({ email, password });
    if (error) return { success: false, error: error.message };
    const user = data.user;
    if (!user) {
      return { success: false, error: 'Usuário não retornado pelo Supabase' };
    }
    // Aqui você pode atualizar metadados se necessário
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: user.user_metadata?.avatar_url || '',
        role: user.role || 'free',
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao criar conta' };
  }
}
