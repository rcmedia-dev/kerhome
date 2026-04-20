import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pusher } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { conversation_id, sender_id, content, attachment_url, attachment_type, sender_type, sender_agency_id } = await req.json();

    if (!conversation_id || !sender_id || !content) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    let finalContent = content;
    if (attachment_url) {
      finalContent = `${content}|||${attachment_type}|${attachment_url}`;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([{
        conversation_id,
        sender_id,
        content: finalContent,
        sender_type: sender_type || 'personal',
        sender_agency_id: sender_agency_id || null
      }])
      .select(`
        id,
        content,
        created_at,
        conversation_id,
        sender_id,
        sender_type,
        sender_agency_id,
        profiles (
          id,
          primeiro_nome,
          ultimo_nome,
          email,
          avatar_url
        ),
        agency:imobiliarias(nome, logo)
      `)
      .single();

    if (error) throw error;

    // Supabase can return profiles as an array depending on the relationship config
    const rawData = data as any;
    const message = {
      ...rawData,
      profiles: Array.isArray(rawData.profiles) ? rawData.profiles[0] : rawData.profiles,
      agency: Array.isArray(rawData.agency) ? rawData.agency[0] : rawData.agency
    };

    console.log("✅ Mensagem salva no Supabase:", message);

    // 📢 2️⃣ Disparar evento via Pusher (tempo real) para o Chat Específico
    await pusher.trigger(`chat-${conversation_id}`, "new-message", message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("❌ Erro ao processar mensagem:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Erro desconhecido",
      details: "Falha ao processar mensagem (provavelmente Pusher/Realtime)"
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const conversation_id = searchParams.get('conversation_id');

  if (!conversation_id) {
    return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
  }

  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        conversation_id,
        sender_id,
        sender_type,
        sender_agency_id,
        profiles (
          id,
          primeiro_nome,
          ultimo_nome,
          email,
          avatar_url
        ),
        agency:imobiliarias(nome, logo)
      `)
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Flatten profiles and agency for each message
    const formattedMessages = (messages || []).map(m => {
      const rawMsg = m as any;
      return {
        ...rawMsg,
        profiles: Array.isArray(rawMsg.profiles) ? rawMsg.profiles[0] : rawMsg.profiles,
        agency: Array.isArray(rawMsg.agency) ? rawMsg.agency[0] : rawMsg.agency
      };
    });

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error("❌ Erro ao buscar mensagens:", error);
    return NextResponse.json({ error: "Erro ao buscar mensagens" }, { status: 500 });
  }
}
