import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    try {
        // Buscar conversas onde o usuário é user1 ou user2
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
        id,
        updated_at,
        user1_id,
        user2_id
      `)
            .or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Para cada conversa, buscar os detalhes do OUTRO usuário
        const conversationsWithProfiles = await Promise.all(conversations.map(async (conv) => {
            const otherUserId = conv.user1_id === user_id ? conv.user2_id : conv.user1_id;

            const { data: profile } = await supabase
                .from('profiles')
                .select('id, primeiro_nome, ultimo_nome, avatar_url, email')
                .eq('id', otherUserId)
                .single();

            // Fetch last message separately to avoid complex join syntax issues
            const { data: lastMessages } = await supabase
                .from('messages')
                .select('content, created_at, sender_id')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1);

            const lastMsg = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null;

            // Calculate unread count (messages sent by OTHER user that are not read)
            const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .eq('sender_id', otherUserId) // Messages from the other person
                .eq('read_by_receiver', false); // Not read yet

            return {
                ...conv,
                other_user: profile,
                last_message: lastMsg,
                unread_count: unreadCount || 0
            };


        }));

        return NextResponse.json({ conversations: conversationsWithProfiles });
    } catch (error) {
        console.error("Erro ao buscar conversas:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { user_id, target_user_id } = await req.json();

        if (!user_id || !target_user_id) {
            return NextResponse.json({ error: "IDs required" }, { status: 400 });
        }

        // Verificar se já existe conversa entre esses dois
        // user_pair costuma ser uma coluna auxiliar 'min_uuid-max_uuid' para uniqueness, se existir.
        // Se não existir, buscamos manualmente.

        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(user1_id.eq.${user_id},user2_id.eq.${target_user_id}),and(user1_id.eq.${target_user_id},user2_id.eq.${user_id})`)
            .single();

        if (existing) {
            return NextResponse.json({ conversation: existing, created: false });
        }

        // Criar nova
        const { data: newConv, error } = await supabase
            .from('conversations')
            .insert([{
                user1_id: user_id,
                user2_id: target_user_id,
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ conversation: newConv, created: true });

    } catch (error) {
        console.error("Erro ao criar conversa:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
