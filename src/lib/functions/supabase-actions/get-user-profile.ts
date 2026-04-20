'use server';

import { createClient } from '@/lib/supabase/server';

// Interface completa com todos os campos do perfil
export interface UserProfile {
  id?: string;
  primeiro_nome?: string ;
  ultimo_nome?: string;
  username?: string ;
  email?: string;
  telefone?: string;
  empresa?: string;
  licenca?: string;
  facebook?: string ;
  linkedin?: string ;
  website?: string;
  instagram?: string;
  youtube?: string ;
  sobre_mim?: string ;
  avatar_url?: string;
  pacote_agente_id?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getUserProfile(id?: string): Promise<UserProfile> {
  if (!id || typeof id !== 'string') {
    console.error("❌ ID inválido:", id);
    throw new Error('ID do usuário inválido');
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        primeiro_nome,
        ultimo_nome,
        email,
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
        avatar_url,
        pacote_agente_id,
        role,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      throw error;
    }

    if (!data) {
      console.error('⚠️ Nenhum perfil encontrado para ID:', id);
      throw new Error('Perfil não encontrado');
    }

    return data as UserProfile;

  } catch (error) {
    console.error('💥 Falha ao buscar perfil:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao buscar perfil'
    );
  }
}
