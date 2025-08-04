import { supabase } from "../supabase";

export async function toggleFavoritoProperty(userId: string, propertyId: string) {
  if (!userId || !propertyId) {
    return { success: false, error: 'Parâmetros inválidos' };
  }

  try {
    // 1. Verificar se já está favoritado
    const { data: existingFavorite, error: selectError } = await supabase
      .from('favoritos')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (selectError) throw selectError;

    // 2. Se já existe, remover o favorito
    if (existingFavorite) {
      const { error: deleteError } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', userId)
        .eq('property_id', propertyId);

      if (deleteError) throw deleteError;
      
      return { 
        success: true, 
        action: 'removed', 
        isFavorited: false 
      };
    } 
    // 3. Se não existe, adicionar como favorito
    else {
      const { error: insertError } = await supabase
        .from('favoritos')
        .insert({
          user_id: userId,
          property_id: propertyId,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
      
      return { 
        success: true, 
        action: 'added', 
        isFavorited: true 
      };
    }
  } catch (error) {
    console.error('Erro ao favoritar/desfavoritar:', error);
    return { 
      success: false, 
      error: 'Erro interno ao processar favorito' 
    };
  }
}