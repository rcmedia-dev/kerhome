import { supabase } from "../supabase";

type ToggleFavoriteResult = {
  success: boolean;
  action?: "added" | "removed" | "already_added" | "none";
  isFavorited: boolean;
  error?: string;
};

export async function toggleFavoritoProperty(
  userId: string,
  propertyId: string
): Promise<ToggleFavoriteResult> {
  if (!userId || !propertyId) {
    return { success: false, error: "Parâmetros inválidos", isFavorited: false };
  }

  try {
    // Verifica se já existe
    const { data: existingFavorite, error: selectError } = await supabase
      .from("favoritos")
      .select("*")
      .eq("user_id", userId)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (selectError) throw selectError;

    const isCurrentlyFavorited = !!existingFavorite;

    // Se já existe, remove usando a chave composta
    if (isCurrentlyFavorited) {
      const { error: deleteError } = await supabase
        .from("favoritos")
        .delete()
        .eq("user_id", userId)
        .eq("property_id", propertyId);

      if (deleteError) throw deleteError;

      return { success: true, action: "removed", isFavorited: false };
    }

    // Se não existe, insere
    const { error: insertError } = await supabase
      .from("favoritos")
      .insert([{ user_id: userId, property_id: propertyId }]);

    if (insertError) {
      // Tratamento de duplicata (race condition)
      if (/duplicate key/i.test(insertError.message)) {
        return { success: true, action: "already_added", isFavorited: true };
      }
      throw insertError;
    }

    return { success: true, action: "added", isFavorited: true };
  } catch (error) {
    console.error("Erro no toggleFavoritoProperty:", error);
    const message = error instanceof Error ? error.message : "Erro interno ao processar favorito";
    return { success: false, error: message, isFavorited: false };
  }
}
