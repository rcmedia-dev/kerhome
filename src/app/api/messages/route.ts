import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Pusher from 'pusher';

// 🔐 Configuração do Pusher CORRIGIDA
const pusher = new Pusher({
  appId: process.env.PUSHER_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!, // A key deve ser pública
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!, // Cluster deve ser público
  useTLS: true,
});

// 🌍 CORS (libera apenas teu domínio de produção)
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.kerhome.ao",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handler para preflight (OPTIONS)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// Handler para POST (enviar mensagem)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversation_id, content, sender_id } = body;

    console.log('[REQ BODY]', body);

    // 🔍 Validações básicas
    if (!conversation_id || !content || !sender_id) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400, headers: corsHeaders }
      );
    }

    const isUUID = (value: string) => /^[0-9a-fA-F\-]{36}$/.test(value);

    if (!isUUID(conversation_id) || !isUUID(sender_id)) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🗄️ Inserir mensagem no Supabase CORRIGIDO
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id, content, sender_id }])
      .select(`
        id,
        content,
        created_at,
        conversation_id,
        sender_id,
        profiles (id, email, primeiro_nome, ultimo_nome, avatar_url)
      `) // Removido !inner para evitar erro se não encontrar relação
      .single();

    if (error) {
      console.error('[SUPABASE ERROR]', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('[MENSAGEM INSERIDA]', data);

    // 📡 Emitir evento no canal específico da conversa CORRIGIDO
    try {
      await pusher.trigger(`chat-${conversation_id}`, 'new-message', {
        ...data,
        timestamp: new Date().toISOString() // Adiciona timestamp para debug
      });
      console.log('[PUSHER] Evento emitido para canal:', `chat-${conversation_id}`);
    } catch (pushError) {
      console.error('[PUSHER ERROR]', pushError);
      // Não retorne erro aqui, apenas logue para não quebrar o fluxo
    }

    // ✅ Resposta final CORRIGIDA
    return NextResponse.json(
      { message: 'Mensagem enviada', data },
      { status: 200, headers: corsHeaders } // Adicionado status 200 explicitamente
    );
  } catch (err: any) {
    console.error('[SERVER ERROR]', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}