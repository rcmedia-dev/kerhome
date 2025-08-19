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
  website?: string;
  instagram?: string;
  youtube?: string ;
  sobre_mim?: string ;
  created_at?: string; // Adicionado como opcional
  updated_at?: string; // Adicionado como opcional
}

export async function getUserProfile(userId?: string): Promise<UserProfile> {
  console.log("🔎 Buscando perfil para ID:", userId);

  if (!userId || typeof userId !== 'string') {
    console.error("❌ ID inválido:", userId);
    throw new Error('ID do usuário inválido');
  }

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
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single();

    console.log("📡 Resposta do Supabase:", { data, error });

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error);
      throw error;
    }

    if (!data) {
      console.error('⚠️ Nenhum perfil encontrado para ID:', userId);
      throw new Error('Perfil não encontrado');
    }

    console.log('✅ Perfil encontrado:', data);

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
