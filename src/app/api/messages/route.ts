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

    if (!receiver_id || !content || !sender_id) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // SUPABASE
    const { data, error } = await supabase
      .from('messages')
      .insert([{ chat_id, receiver_id, content, sender_id }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // PUSHER
    try {
      await pusher.trigger('chat-channel', 'new_message', data);
    } catch (pushError) {
      return NextResponse.json({ error: 'Erro ao emitir evento com Pusher' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Mensagem enviada', data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
