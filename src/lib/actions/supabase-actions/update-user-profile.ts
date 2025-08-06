import { supabase } from '@/lib/supabase';

interface UpdateUserProfileParams {
  userId: string;
  profileData: Partial<{
    primeiro_nome: string | null;
    ultimo_nome: string | null;
    email: string | null;
    username: string | null;
    telefone: string | null;
    empresa: string | null;
    licenca: string | null;
    website: string | null;
    facebook: string | null;
    linkedin: string | null;
    instagram: string | null;
    youtube: string | null;
    sobre_mim: string | null;
  }>;
}

export async function updateUserProfile({ userId, profileData }: UpdateUserProfileParams): Promise<boolean> {
  // Validação básica
  if (!userId || typeof userId !== 'string') {
    throw new Error('ID do usuário inválido');
  }

  // Preparar dados para atualização
  const updateData = {
    ...profileData,
    updated_at: new Date().toISOString(), // Atualiza o timestamp
  };

  try {
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error(`Erro ao atualizar perfil: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Falha na atualização do perfil:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao atualizar perfil'
    );
  }
}