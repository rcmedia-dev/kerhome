import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    const imobiliaria_id = searchParams.get('imobiliaria_id');
    const status = searchParams.get('status');

    if (!user_id && !imobiliaria_id) {
        return NextResponse.json({ error: "User ID or Imobiliaria ID required" }, { status: 400 });
    }

    try {
        let query = supabase.from('conversations').select(`
            id,
            updated_at,
            user1_id,
            user2_id,
            target_type,
            imobiliaria_id,
            status
        `);

        if (user_id) {
            query = query.or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);
        } else if (imobiliaria_id) {
            query = query.eq('imobiliaria_id', imobiliaria_id);
        }

        const { data: conversations, error } = await query.order('updated_at', { ascending: false });

        if (error) throw error;
        if (!conversations) return NextResponse.json({ conversations: [] });

        // --- BULK FETCH ---
        const allUserIds = new Set<string>();
        conversations.forEach(c => {
            allUserIds.add(c.user1_id);
            allUserIds.add(c.user2_id);
        });

        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, primeiro_nome, ultimo_nome, avatar_url, email')
            .in('id', Array.from(allUserIds));

        const profilesMap = new Map(profiles?.map(p => [p.id, p]));

        const allAgencyIds = new Set<string>(
            conversations
                .filter(c => c.target_type === 'agency' && c.imobiliaria_id)
                .map(c => c.imobiliaria_id as string)
        );

        let agenciesMap = new Map();
        if (allAgencyIds.size > 0) {
            const { data: agencies } = await supabase
                .from('imobiliarias')
                .select('id, nome, logo')
                .in('id', Array.from(allAgencyIds));
            agenciesMap = new Map(agencies?.map(a => [a.id, a]));
        }

        const conversationsWithProfiles = await Promise.all(conversations.map(async (conv) => {
            const otherUserId = conv.user1_id === user_id ? conv.user2_id : conv.user1_id;

            // Fetch last message separately
            const { data: lastMessages } = await supabase
                .from('messages')
                .select('content, created_at, sender_id')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1);

            const lastMsg = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null;

            // Calculate unread count
            const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .eq('sender_id', otherUserId) 
                .eq('read_by_receiver', false); 

            return {
                ...conv,
                other_user: profilesMap.get(otherUserId) || null,
                agency_details: agenciesMap.get(conv.imobiliaria_id) || null,
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
        const { user_id, target_user_id, target_type = 'agent', imobiliaria_id } = await req.json();

        if (!user_id || (!target_user_id && !imobiliaria_id)) {
            return NextResponse.json({ error: "Data missing" }, { status: 400 });
        }

        // Determinar o user2_id (se for agência e não tiver target_user_id, usa o próprio user_id como placeholder até o claim)
        const u2 = target_user_id || user_id;
        
        // Gerar user_pair ordenado para evitar duplicidade
        const ids = [user_id, u2].sort();
        const user_pair = `${ids[0]}-${ids[1]}`;

        // 1. Tentar encontrar conversa existente por IDs
        let query = supabase.from('conversations').select('*');
        if (target_type === 'agency' && imobiliaria_id) {
             query = query.eq('imobiliaria_id', imobiliaria_id).eq('user1_id', user_id);
        } else {
             query = query.or(`and(user1_id.eq.${user_id},user2_id.eq.${u2}),and(user1_id.eq.${u2},user2_id.eq.${user_id})`);
        }

        const { data: existing, error: findError } = await query.maybeSingle();

        if (findError) throw findError;

        if (existing) {
            // Se for chat de agência, resetamos o status para 'open' para voltar à fila
            if (target_type === 'agency' || existing.target_type === 'agency') {
                return NextResponse.json({ conversation: existing, created: false });
            }

            return NextResponse.json({ conversation: existing, created: false });
        }

        // 2. Criar nova se não existir
        const { data: newConv, error: insertError } = await supabase
            .from('conversations')
            .insert([{
                user1_id: user_id,
                user2_id: u2,
                target_type,
                imobiliaria_id,
                status: 'open',
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (insertError) {
            // Caso ocorra uma race condition e o insert falhe por unique constraint após o find falhar
            if (insertError.code === '23505') {
                 let retryQuery = supabase.from('conversations').select('*');
                 if (target_type === 'agency' && imobiliaria_id) {
                     retryQuery = retryQuery.eq('imobiliaria_id', imobiliaria_id).eq('user1_id', user_id);
                 } else {
                     retryQuery = retryQuery.or(`and(user1_id.eq.${user_id},user2_id.eq.${u2}),and(user1_id.eq.${u2},user2_id.eq.${user_id})`);
                 }
                 const { data: retryFind } = await retryQuery.maybeSingle();
                 return NextResponse.json({ conversation: retryFind, created: false });
            }
            throw insertError;
        }

        return NextResponse.json({ conversation: newConv, created: true });

    } catch (error) {
        console.error("Erro ao gerenciar conversa:", error);
        return NextResponse.json({ error: "Erro interno ao processar conversa" }, { status: 500 });
    }
}

