// lib/actions/get-imoveis-favoritos.ts
'use server';

import { supabase } from '../supabase';
import { TFavoritedPropertyResponseSchema } from '../types/user';

export async function getImoveisFavoritos(
  userId?: string
): Promise<TFavoritedPropertyResponseSchema[]> {
  if (!userId) return [];

  try {
    // 1. Buscar todos os favoritos do usuário (não usar maybeSingle pois pode ter vários)
    const { data: favorites, error: favoritesError } = await supabase
      .from('favoritos')
      .select('property_id')
      .eq('user_id', userId);

    if (favoritesError) throw favoritesError;
    if (!favorites || favorites.length === 0) return [];

    // 2. Extrair apenas os IDs dos imóveis favoritos
    const propertyIds = favorites.map(fav => fav.property_id);

    // 3. Buscar os detalhes completos dos imóveis favoritados
    const { data: properties, error: propertiesError } = await supabase
      .from('properties') // Verifique se o nome da tabela está correto (no seu código tinha um espaço)
      .select('*')
      .in('id', propertyIds);

    if (propertiesError) throw propertiesError;
    if (!properties) return [];

    // 4. Validar os dados com o schema

    return properties;
  } catch (error) {
    console.error("Erro ao buscar imóveis favoritos:", error);
    return [];
  }
}