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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { chat_id, receiver_id, content, sender_id } = body;

    console.log('[REQ BODY]', body);

    if (!receiver_id || !content || !sender_id) {
      console.error('[VALIDAÇÃO FALHOU] Dados incompletos');
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Verificação básica de UUIDs (opcional, mas útil)
    const isUUID = (value: string) => /^[0-9a-fA-F\-]{36}$/.test(value);

    if (chat_id && !isUUID(chat_id)) {
      console.error('[ERRO DE FORMATO] chat_id inválido:', chat_id);
      return NextResponse.json({ error: 'chat_id inválido' }, { status: 400 });
    }

    if (!isUUID(sender_id) || !isUUID(receiver_id)) {
      console.error('[ERRO DE FORMATO] sender_id ou receiver_id inválidos');
      return NextResponse.json({ error: 'IDs de utilizador inválidos' }, { status: 400 });
    }

    // SUPABASE
    const { data, error } = await supabase
      .from('messages')
      .insert([{ chat_id, receiver_id, content, sender_id }])
      .select()
      .single();

    if (error) {
      console.error('[SUPABASE ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[MENSAGEM INSERIDA]', data);

    // PUSHER
    try {
      await pusher.trigger('chat-channel', 'new_message', data);
      console.log('[PUSHER] Evento emitido com sucesso');
    } catch (pushError) {
      console.error('[PUSHER ERROR]', pushError);
      return NextResponse.json({ error: 'Erro ao emitir evento com Pusher' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Mensagem enviada', data });
  } catch (err: any) {
    console.error('[SERVER ERROR]', err);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
