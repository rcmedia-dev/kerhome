import { pusher } from "../pusher";
import { supabase } from "../supabase";

export async function createConversation(
  propertyId: string,
  agentId: string,
  clientId: string
) {
  try {
    // 🔍 1. Verificar se já existe uma conversa usando user_pair
    const { data: existing, error: checkError } = await supabase
      .from("conversations")
      .select("*")
      .eq("property_id", propertyId)
      .or(`user_pair.eq.${agentId}-${clientId},user_pair.eq.${clientId}-${agentId}`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      console.log("💬 Conversa já existente:", existing[0].id);
      return existing[0];
    }

    // 🆕 2. Se não existir, cria uma nova conversa
    const { data, error } = await supabase
      .from("conversations")
      .insert([
        {
          property_id: propertyId,
          agent_id: agentId,
          client_id: clientId,
          user1_id: agentId,
          user2_id: clientId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("🆕 Nova conversa criada:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Erro ao criar/verificar conversa:", error);
    throw error;
  }
}

// Obter conversas - atualizado para nova estrutura
export async function getConversations(userId: string) {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      created_at,
      updated_at,
      property_id,
      agent_id,
      client_id,
      user1_id,
      user2_id,
      user_pair
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId},agent_id.eq.${userId},client_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!conversations) return [];

  const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      // Determinar o outro usuário da conversa
      const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
      
      const [propertyRes, userRes, agentRes, clientRes] = await Promise.all([
        // Property data
        conv.property_id
          ? supabase.from("properties").select("id, title").eq("id", conv.property_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        // Other user data (para conversas diretas)
        otherUserId
          ? supabase
              .from("profiles")
              .select("id, primeiro_nome, ultimo_nome, email, avatar_url, username, telefone, status, last_seen_at")
              .eq("id", otherUserId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        // Agent data (para compatibilidade)
        conv.agent_id
          ? supabase
              .from("profiles")
              .select("id, primeiro_nome, ultimo_nome, email, avatar_url, username, telefone, status, last_seen_at")
              .eq("id", conv.agent_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        // Client data (para compatibilidade)
        conv.client_id
          ? supabase
              .from("profiles")
              .select("id, primeiro_nome, ultimo_nome, email, avatar_url, username, telefone, status, last_seen_at")
              .eq("id", conv.client_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      // Para conversas diretas, usar o outro usuário como cliente/agente
      const otherUser = userRes?.data;
      const displayUser = otherUser || clientRes?.data || agentRes?.data;

      return {
        ...conv,
        property: propertyRes?.data ?? null,
        agent: agentRes?.data ?? null,
        client: displayUser, // Usar o outro usuário como cliente para display
        other_user: otherUser, // Novo campo para o outro usuário
      };
    })
  );

  return enrichedConversations;
}

// Enviar mensagem + Pusher - atualizado para nova estrutura
export async function sendMessage(conversationId: string, senderId: string, content: string) {
  try {
    // 🗄️ Inserir mensagem no Supabase
    const { data, error } = await supabase
      .from("messages")
      .insert([{ 
        conversation_id: conversationId, 
        sender_id: senderId, 
        content 
      }])
      .select(`
        id,
        content,
        created_at,
        updated_at,
        conversation_id,
        sender_id,
        read_by_receiver,
        profiles (
          id,
          email,
          primeiro_nome,
          ultimo_nome,
          username,
          avatar_url,
          status,
          last_seen_at
        )
      `)
      .single();

    if (error) throw error;

    const message = {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      read_by_receiver: data.read_by_receiver,
      sender: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
    };

    console.log("✅ Mensagem salva no banco:", message.id);

    // 🔄 Atualizar updated_at da conversa
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    // 📡 Chamar a API para notificar via Pusher
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: content,
          sender_id: senderId,
          message_id: message.id
        }),
      });

      if (response.ok) {
        console.log("✅ API Pusher chamada com sucesso!");
      } else {
        const errorText = await response.text();
        console.error("❌ Erro na API Pusher:", errorText);
      }
    } catch (apiError) {
      console.error("❌ Erro ao chamar API Pusher:", apiError);
      // Não throw - a mensagem já foi salva no banco
    }

    return message;
    
  } catch (error) {
    console.error("❌ Erro ao enviar mensagem:", error);
    throw error;
  }
}

// Obter mensagens - atualizado para nova estrutura
export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      updated_at,
      conversation_id,
      sender_id,
      read_by_receiver,
      profiles!inner (
        id, 
        email, 
        primeiro_nome, 
        ultimo_nome, 
        avatar_url,
        username,
        status,
        last_seen_at
      )
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    content: item.content,
    created_at: item.created_at,
    updated_at: item.updated_at,
    conversation_id: item.conversation_id,
    sender_id: item.sender_id,
    read_by_receiver: item.read_by_receiver,
    sender: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
  }));
}

// Marcar mensagens como lidas
export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .update({ read_by_receiver: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId) // Marcar apenas mensagens de outros usuários
      .select();

    if (error) throw error;

    console.log(`✅ Mensagens marcadas como lidas na conversa: ${conversationId}`);
    return data;
  } catch (error) {
    console.error("❌ Erro ao marcar mensagens como lidas:", error);
    throw error;
  }
}

// Obter contagem de mensagens não lidas
export async function getUnreadMessagesCount(userId: string) {
  try {
    // Primeiro, buscar todas as conversas do usuário
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId},agent_id.eq.${userId},client_id.eq.${userId}`);

    if (convError) throw convError;
    if (!conversations || conversations.length === 0) return 0;

    const conversationIds = conversations.map(conv => conv.id);

    // Contar mensagens não lidas onde o usuário não é o remetente
    const { count, error: countError } = await supabase
      .from("messages")
      .select("*", { count: 'exact', head: true })
      .in("conversation_id", conversationIds)
      .eq("read_by_receiver", false)
      .neq("sender_id", userId);

    if (countError) throw countError;

    return count || 0;
  } catch (error) {
    console.error("❌ Erro ao obter contagem de mensagens não lidas:", error);
    return 0;
  }
}

// Criar conversa direta (sem property)
export async function createDirectConversation(user1Id: string, user2Id: string) {
  try {
    // Verificar se já existe conversa direta
    const { data: existing, error: checkError } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_pair.eq.${user1Id}-${user2Id},user_pair.eq.${user2Id}-${user1Id}`)
      .is("property_id", null)
      .limit(1);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      console.log("💬 Conversa direta já existente:", existing[0].id);
      return existing[0];
    }

    // Criar nova conversa direta
    const { data, error } = await supabase
      .from("conversations")
      .insert([
        {
          user1_id: user1Id,
          user2_id: user2Id,
          property_id: null,
          agent_id: null,
          client_id: null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("🆕 Nova conversa direta criada:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Erro ao criar conversa direta:", error);
    throw error;
  }
}

// Obter lista de contactos da plataforma com paginação
export async function getContacts(
  userId: string, 
  page: number = 1, 
  limit: number = 10,
  searchTerm: string = ''
) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Query base para buscar utilizadores
    let query = supabase
      .from('profiles')
      .select(`
        id,
        primeiro_nome,
        ultimo_nome,
        email,
        avatar_url,
        username,
        telefone,
        status,
        last_seen_at,
        empresa,
        role
      `, { count: 'exact' })
      .neq('id', userId) // Excluir o próprio utilizador
      .order('created_at', { ascending: false }); // Ordenar por mais recentes primeiro

    // Adicionar filtro de pesquisa se existir
    if (searchTerm.trim()) {
      query = query.or(
        `primeiro_nome.ilike.%${searchTerm}%,ultimo_nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`
      );
    }

    const { data: contacts, error, count } = await query.range(from, to);

    if (error) throw error;

    // Verificar quais contactos já têm conversa com o utilizador
    const contactsWithConversationStatus = await Promise.all(
      (contacts || []).map(async (contact) => {
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .or(`user_pair.eq.${userId}-${contact.id},user_pair.eq.${contact.id}-${userId}`)
          .maybeSingle();

        return {
          ...contact,
          has_existing_conversation: !!existingConversation,
          conversation_id: existingConversation?.id || null,
          display_name: contact.primeiro_nome && contact.ultimo_nome 
            ? `${contact.primeiro_nome} ${contact.ultimo_nome}`
            : contact.username || contact.email
        };
      })
    );

    return {
      contacts: contactsWithConversationStatus,
      totalCount: count || 0,
      hasMore: (count || 0) > to + 1,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
    
  } catch (error) {
    console.error('❌ Erro ao obter contactos:', error);
    throw error;
  }
}

// Buscar contactos com filtro (alias para getContacts com search)
export async function searchContacts(
  userId: string,
  searchTerm: string,
  page: number = 1,
  limit: number = 10
) {
  return getContacts(userId, page, limit, searchTerm);
}

// Obter contactos sugeridos (usuários mais ativos ou populares)
export async function getSuggestedContacts(userId: string, limit: number = 10) {
  try {
    // Buscar usuários mais recentes ou com mais atividade
    const { data: contacts, error } = await supabase
      .from('profiles')
      .select(`
        id,
        primeiro_nome,
        ultimo_nome,
        email,
        avatar_url,
        username,
        telefone,
        status,
        last_seen_at,
        empresa,
        role
      `)
      .neq('id', userId)
      .order('last_seen_at', { ascending: false }) // Usuários mais recentemente ativos primeiro
      .limit(limit);

    if (error) throw error;

    // Adicionar status de conversa existente
    const contactsWithStatus = await Promise.all(
      (contacts || []).map(async (contact) => {
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .or(`user_pair.eq.${userId}-${contact.id},user_pair.eq.${contact.id}-${userId}`)
          .maybeSingle();

        return {
          ...contact,
          has_existing_conversation: !!existingConversation,
          conversation_id: existingConversation?.id || null,
          display_name: contact.primeiro_nome && contact.ultimo_nome 
            ? `${contact.primeiro_nome} ${contact.ultimo_nome}`
            : contact.username || contact.email
        };
      })
    );

    return contactsWithStatus;
  } catch (error) {
    console.error('❌ Erro ao obter contactos sugeridos:', error);
    throw error;
  }
}

// Adicione esta função ao seu message-action.ts
export async function deleteConversation(conversationId: string) {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
    
    console.log('✅ Conversa eliminada:', conversationId);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao eliminar conversa:', error);
    throw error;
  }
}