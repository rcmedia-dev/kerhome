import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  useTLS: true,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.kerhome.ao", // 👈 só libera teu domínio
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handler para preflight (OPTIONS)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// Handler para POST
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chat_id, receiver_id, content, sender_id } = body;

    console.log('[REQ BODY]', body);

    if (!receiver_id || !content || !sender_id) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400, headers: corsHeaders });
    }

    const isUUID = (value: string) => /^[0-9a-fA-F\-]{36}$/.test(value);

    if (chat_id && !isUUID(chat_id)) {
      return NextResponse.json({ error: 'chat_id inválido' }, { status: 400, headers: corsHeaders });
    }

    if (!isUUID(sender_id) || !isUUID(receiver_id)) {
      return NextResponse.json({ error: 'IDs de utilizador inválidos' }, { status: 400, headers: corsHeaders });
    }

    // SUPABASE
    const { data, error } = await supabase
      .from('messages')
      .insert([{ chat_id, receiver_id, content, sender_id }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    console.log('[MENSAGEM INSERIDA]', data);

    // PUSHER
    try {
      await pusher.trigger('chat-channel', 'new_message', data);
      console.log('[PUSHER] Evento emitido com sucesso');
    } catch (pushError) {
      return NextResponse.json({ error: 'Erro ao emitir evento com Pusher' }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ message: 'Mensagem enviada', data }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('[SERVER ERROR]', err);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500, headers: corsHeaders });
  }
}
