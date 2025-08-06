import { supabase } from "@/lib/supabase";

export async function getUserMessagesList(userId: string) {
  // Buscar mensagens enviadas por este usuário
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, content, receiver_id, created_at')
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });

  if (error || !messages) {
    console.error('Erro ao buscar mensagens:', error);
    return [];
  }

  const receiverIds = messages.map(msg => msg.receiver_id);
  
  // Buscar perfis dos destinatários
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', receiverIds);

  if (profileError || !profiles) {
    console.error('Erro ao buscar perfis:', profileError);
    return messages; // retorna só as mensagens mesmo
  }

  // Mapear o perfil correspondente a cada mensagem
  const profileMap = new Map(profiles.map(profile => [profile.id, profile]));

  const messagesWithReceiver = messages.map(msg => ({
    ...msg,
    receiver: profileMap.get(msg.receiver_id) || null
  }));

  return messagesWithReceiver;
}
