import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Pusher from "pusher";

// 🔐 Configuração segura do Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || "2033373",
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "f4dcc1e6a5f94d4dd4ad",
  secret: process.env.PUSHER_APP_SECRET || "f8455a55d1afd516e4cc",
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "mt1",
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversation_id, sender_id, content } = body;

    if (!conversation_id || !sender_id || !content) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // 🗄️ 1️⃣ Salvar mensagem no Supabase
    const { data, error } = await supabase
      .from("messages")
      .insert([{ 
        conversation_id, 
        sender_id, 
        content 
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
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
