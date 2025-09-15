import { supabase } from "../supabase";

//create conversation actions
export async function createConversation(propertyId: string, agentId: string, clientId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .insert([{ property_id: propertyId, agent_id: agentId, client_id: clientId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

//get conversations actions - CORRIGIDA
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

  const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const [property, agent, client] = await Promise.all([
        conv.property_id
          ? supabase.from("properties").select("id, title").eq("id", conv.property_id).single()
          : Promise.resolve({ data: null }),

        conv.agent_id
          ? supabase
              .from("profiles")
              .select("id, primeiro_nome, ultimo_nome, email, avatar_url")
              .eq("id", conv.agent_id)
              .single()
          : Promise.resolve({ data: null }),

        conv.client_id
          ? supabase
              .from("profiles")
              .select("id, primeiro_nome, ultimo_nome, email, avatar_url")
              .eq("id", conv.client_id)
              .single()
          : Promise.resolve({ data: null }),
      ]);

      return {
        ...conv,
        property: property.data,
        agent: agent.data,
        client: client.data,
      };
    })
  );

  return enrichedConversations;
}

//send message action
export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ conversation_id: conversationId, sender_id: senderId, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

//get messages action - CORRIGIDA
export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      conversation_id,
      sender_id,
      profiles!inner (id, email)
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

// subscribe to messages with unread counter logic
export function subscribeMessages(
  conversationId: string,
  userId: string,
  callback: (message: any, incrementUnread: boolean) => void
) {
  return supabase
    .channel("messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      async (payload) => {
        const message = payload.new;

        // só incrementa contador se NÃO for mensagem do próprio usuário
        const incrementUnread = message.sender_id !== userId;

        callback(message, incrementUnread);
      }
    )
    .subscribe();
}
