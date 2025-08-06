import { supabase } from "@/lib/supabase";

export async function getOrCreateChat(userId: string, agentId: string, propertyId: string) {
  // 1. Buscar chat existente
  const { data: existingChat, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_id', agentId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (existingChat) return existingChat;

  // 2. Criar novo chat
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert([{ user_id: userId, agent_id: agentId, property_id: propertyId }])
    .select()
    .single();

  if (createError) throw new Error(createError.message);
  return newChat;
}
