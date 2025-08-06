import { supabase } from '@/lib/supabase';

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
  instagram?: string;
  youtube?: string ;
  sobre_mim?: string ;
  created_at?: string; // Adicionado como opcional
  updated_at?: string; // Adicionado como opcional
}

export async function getUserProfile(userId?: string): Promise<UserProfile> {
  // Validação robusta do userId
  if (!userId || typeof userId !== 'string') {
    throw new Error('ID do usuário inválido');
  }

  // Campos a serem selecionados (organizados por categoria)
  const profileFields = `
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
    created_at,
    updated_at
  `;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(profileFields)
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Perfil não encontrado');
    }

    // Retorna os dados tipados
    return {
      id: data.id,
      primeiro_nome: data.primeiro_nome ?? null,
      ultimo_nome: data.ultimo_nome ?? null,
      email: data.email ?? null,
      username: data.username ?? null,
      telefone: data.telefone ?? null,
      empresa: data.empresa ?? null,
      licenca: data.licenca ?? null,
      website: data.website ?? null,
      facebook: data.facebook ?? null,
      linkedin: data.linkedin ?? null,
      instagram: data.instagram ?? null,
      youtube: data.youtube ?? null,
      sobre_mim: data.sobre_mim ?? null,
      created_at: data.created_at,
      updated_at: data.updated_at
    } as UserProfile;

  } catch (error) {
    console.error('Falha ao buscar perfil:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao buscar perfil'
    );
  }
}