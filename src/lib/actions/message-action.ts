import { pusher } from "../pusher";
import { supabase } from "../supabase";

// Criar conversa
export async function createConversation(propertyId: string, agentId: string, clientId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .insert([{ property_id: propertyId, agent_id: agentId, client_id: clientId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Obter conversas
export async function getConversations(userId: string) {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      property_id,
      agent_id,
      client_id
    `)
    .or(`agent_id.eq.${userId},client_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!conversations) return [];

  const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const [propertyRes, agentRes, clientRes] = await Promise.all([
        conv.property_id
          ? supabase.from("properties").select("id, title").eq("id", conv.property_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        conv.agent_id
          ? supabase
              .from("profiles")
              .select("id, primeiro_nome, ultimo_nome, email, avatar_url")
              .eq("id", conv.agent_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        conv.client_id
          ? supabase
              .from("profiles")
              .select("id, primeiro_nome, ultimo_nome, email, avatar_url")
              .eq("id", conv.client_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      return {
        ...conv,
        property: propertyRes?.data ?? null,
        agent: agentRes?.data ?? null,
        client: clientRes?.data ?? null,
      };
    })
  );

  return enrichedConversations;
}

// Enviar mensagem + Pusher
export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ conversation_id: conversationId, sender_id: senderId, content }])
    .select(`
      id,
      content,
      created_at,
      conversation_id,
      sender_id,
      profiles!inner (id, email, primeiro_nome, ultimo_nome)
    `)
    .single();

  if (error) throw error;

  const message = {
    id: data.id,
    content: data.content,
    created_at: data.created_at,
    conversation_id: data.conversation_id,
    sender: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
  };

  // Notifica o canal no Pusher
  await pusher.trigger(`chat-${conversationId}`, "new-message", message);

  return message;
}

// Obter mensagens
export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      conversation_id,
      sender_id,
      profiles!inner (id, email, primeiro_nome, ultimo_nome, avatar_url)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    content: item.content,
    created_at: item.created_at,
    conversation_id: item.conversation_id,
    sender: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
  }));
}
