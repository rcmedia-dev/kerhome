import { supabase } from "../supabase";

export async function toggleFavoritoProperty(userId: string, propertyId: string) {
  if (!userId || !propertyId) {
    return { 
      success: false, 
      error: 'Parâmetros inválidos',
      isFavorited: false 
    };
  }

  try {
    // 1. Verifica o estado atual
    const { data: existingFavorite, error: selectError } = await supabase
      .from('favoritos')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle();

    if (selectError) throw selectError;

    const isCurrentlyFavorited = !!existingFavorite;

    // 2. Executa a ação oposta
    if (isCurrentlyFavorited) {
      // Remove
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
    } else {
      // Adiciona
      const { error: insertError } = await supabase
        .from('favoritos')
        .insert({
          user_id: userId,
          property_id: propertyId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        // Se for erro de duplicação, trata como sucesso (já está favoritado)
        if (insertError.code === '23505') {
          return { 
            success: true, 
            action: 'already_added', 
            isFavorited: true 
          };
        }
        throw insertError;
      }
      
      return { 
        success: true, 
        action: 'added', 
        isFavorited: true 
      };
    }

  } catch (error) {
    console.error('Erro no toggleFavoritoProperty:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro interno ao processar favorito';
    
    return { 
      success: false, 
      error: errorMessage,
      isFavorited: false 
    };
  }
}