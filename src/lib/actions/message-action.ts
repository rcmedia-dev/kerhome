import { supabase } from "../supabase";



//create conversation actions
export async function createConversation(propertyId: string, agentId: string, clientId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .insert([
      { property_id: propertyId, agent_id: agentId, client_id: clientId }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

//get conversations actions
export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      property:properties(title),
      agent:public.profiles(id, email),
      client:public.profiles(id, email),
      created_at
    `)
    .or(`agent_id.eq.${userId},client_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

//send message action
export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      { conversation_id: conversationId, sender_id: senderId, content }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

//get messages action
export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      sender:auth.users(id, email),
      created_at
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}


export function subscribeMessages(conversationId: string, callback: (message: any) => void) {
  return supabase
    .channel("messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
}
