'use server';

import { createClient } from '@/lib/supabase/server';
import { TPropertyResponseSchema } from '@/lib/types/property';

export async function getImoveisFavoritos(userId: string): Promise<TPropertyResponseSchema[]> {
  if (!userId) return [];
  
  const supabase = await createClient();
  
  try {
    // 1. Buscar todos os favoritos do usuário
    const { data: favoritos, error: errorFavoritos } = await supabase
      .from('favoritos')
      .select('property_id')
      .eq('user_id', userId);

    if (errorFavoritos) {
      console.error('Erro ao buscar favoritos:', errorFavoritos);
      return [];
    }

    const idsFavoritos = favoritos.map(f => f.property_id);

    if (idsFavoritos.length === 0) return [];

    // 2. Buscar os detalhes completos dos imóveis favoritados
    const { data: imoveis, error: errorImoveis } = await supabase
      .from('properties')
      .select('*')
      .in('id', idsFavoritos);

    if (errorImoveis) {
      console.error('Erro ao buscar imóveis favoritados:', errorImoveis);
      return [];
    }

    return imoveis as TPropertyResponseSchema[];
  } catch (error) {
    console.error("Erro ao buscar imóveis favoritos:", error);
    return [];
  }
}
