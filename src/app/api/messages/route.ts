import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Pusher from "pusher";

// 🔐 Configuração segura do Pusher
// Tenta ler de várias chaves comuns para evitar erros de undefined
const appId = process.env.PUSHER_APP_ID || process.env.PUSHER_ID || process.env.NEXT_PUBLIC_PUSHER_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_APP_KEY || process.env.PUSHER_KEY;
const secret = process.env.PUSHER_APP_SECRET || process.env.PUSHER_SECRET || process.env.NEXT_PUBLIC_PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_APP_CLUSTER || process.env.PUSHER_CLUSTER;

if (!appId || !key || !secret || !cluster) {
  console.error("❌ Erro Crítico: Variáveis de ambiente do Pusher faltando.", {
    appId: !!appId,
    key: !!key,
    secret: !!secret,
    cluster: !!cluster
  });
}

const pusher = new Pusher({
  appId: appId!,
  key: key!,
  secret: secret!,
  cluster: cluster!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversation_id, sender_id, content, attachment_url, attachment_type } = body;

    if (!conversation_id || !sender_id || !content) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 🗄️ 1️⃣ Salvar mensagem no Supabase
    // Hack: Store attachment in content string if needed because we cannot alter schema
    // Format: "Real content|||type|url"

    let finalContent = content;
    if (attachment_url) {
      finalContent = `${content}|||${attachment_type}|${attachment_url}`;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([{
        conversation_id,
        sender_id,
        content: finalContent
      }])
      .select(`
        id,
        content,
        created_at,
        conversation_id,
        sender_id,
        profiles (
          id,
          primeiro_nome,
          ultimo_nome,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // Parse back for client response if we want clean format, 
    // BUT actually client needs the full string so it can parse it too,
    // OR we transform it here.
    // Let's keep data consistent: return what is in DB?
    // Better: Helper function to parse on frontend.

    const message = {
      id: data.id,
      content: data.content,
      created_at: data.created_at,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      profiles: data.profiles,
    };

    console.log("✅ Mensagem salva no Supabase:", message);

    // 📡 2️⃣ Disparar evento via Pusher (tempo real)
    await pusher.trigger(`chat-${conversation_id}`, "new-message", message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("❌ Erro ao processar mensagem:", error);
    // Se o erro for do Pushermas salvou no Banco, poderíamos retornar sucesso parcial, mas por enquanto vamos manter o erro
    // para o usuário saber que o real-time falhou.
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Erro desconhecido",
      details: "Falha ao processar mensagem (provavelmente Pusher/Realtime)"
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
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
        conversation_id,
        sender_id,
        profiles (
          id,
          primeiro_nome,
          ultimo_nome,
          email,
          avatar_url
        )
      `)
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("❌ Erro ao buscar mensagens:", error);
    return NextResponse.json({ error: "Erro ao buscar mensagens" }, { status: 500 });
  }
}
