import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    const supabase = await createClient();
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
            status,
            lead_temperature,
            internal_notes,
            property_id
        `);

        if (user_id) {
            query = query.or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);
        } else if (imobiliaria_id) {
            query = query.eq('imobiliaria_id', imobiliaria_id);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: conversations, error } = await query.order('updated_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar conversas (query principal):", error);
            throw error;
        }
        if (!conversations || conversations.length === 0) return NextResponse.json({ conversations: [] });

        // --- BULK FETCH profiles ---
        const allUserIds = [...new Set(
            conversations.flatMap(c => [c.user1_id, c.user2_id]).filter(Boolean)
        )];

        let profilesMap = new Map();
        if (allUserIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, primeiro_nome, ultimo_nome, avatar_url, email')
                .in('id', allUserIds);
            if (profilesError) console.error("Erro ao buscar profiles:", profilesError);
            profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
        }

        // --- BULK FETCH agencies ---
        const allAgencyIds = [...new Set(
            conversations
                .filter(c => c.target_type === 'agency' && c.imobiliaria_id)
                .map(c => c.imobiliaria_id as string)
        )];

        let agenciesMap = new Map();
        if (allAgencyIds.length > 0) {
            const { data: agencies, error: agenciesError } = await supabase
                .from('imobiliarias')
                .select('id, nome, logo')
                .in('id', allAgencyIds);
            if (agenciesError) console.error("Erro ao buscar imobiliarias:", agenciesError);
            agenciesMap = new Map(agencies?.map(a => [a.id, a]) || []);
        }

        // --- BULK FETCH properties ---
        const allPropertyIds = [...new Set(
            conversations
                .filter(c => c.property_id)
                .map(c => c.property_id as string)
        )];

        let propertiesMap = new Map();
        if (allPropertyIds.length > 0) {
            const { data: properties, error: propertiesError } = await supabase
                .from('properties')
                .select('id, title, price, images, cidade, provincia')
                .in('id', allPropertyIds);
            if (propertiesError) console.error("Erro ao buscar properties:", propertiesError);
            propertiesMap = new Map(properties?.map(p => [p.id, p]) || []);
        }

        // --- BULK FETCH last messages and unread counts ---
        const convIds = conversations.map(c => c.id);

        const { data: lastMessages } = await supabase
            .from('messages')
            .select('conversation_id, content, created_at, sender_id')
            .in('conversation_id', convIds)
            .order('created_at', { ascending: false });

        // Keep only the last message per conversation (first occurrence after ordering)
        const lastMsgMap = new Map<string, { content: string; created_at: string; sender_id: string }>();
        lastMessages?.forEach(msg => {
            if (!lastMsgMap.has(msg.conversation_id)) {
                lastMsgMap.set(msg.conversation_id, {
                    content: msg.content,
                    created_at: msg.created_at,
                    sender_id: msg.sender_id,
                });
            }
        });

        const { data: unreadMessages } = await supabase
            .from('messages')
            .select('conversation_id, sender_id')
            .in('conversation_id', convIds)
            .eq('read_by_receiver', false);

        // Count unread per conversation (only messages not sent by the current user)
        const unreadMap = new Map<string, number>();
        unreadMessages?.forEach(msg => {
            if (user_id && msg.sender_id !== user_id) {
                unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) || 0) + 1);
            }
        });

        // --- ASSEMBLE ---
        const conversationsWithDetails = conversations.map((conv) => {
            const otherUserId = conv.user1_id === user_id ? conv.user2_id : conv.user1_id;

            return {
                ...conv,
                other_user: profilesMap.get(otherUserId) || null,
                agency_details: agenciesMap.get(conv.imobiliaria_id || '') || null,
                property_details: propertiesMap.get(conv.property_id || '') || null,
                last_message: lastMsgMap.get(conv.id) || null,
                unread_count: unreadMap.get(conv.id) || 0
            };
        });

        return NextResponse.json({ conversations: conversationsWithDetails });
    } catch (error) {
        console.error("Erro ao buscar conversas:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const supabase = await createClient();
    try {
        const { user_id, target_user_id, target_type = 'agent', imobiliaria_id } = await req.json();

        if (!user_id || (!target_user_id && !imobiliaria_id)) {
            return NextResponse.json({ error: "Data missing" }, { status: 400 });
        }

        const u2 = target_user_id || user_id;
        
        let query = supabase.from('conversations').select('*');
        if (target_type === 'agency' && imobiliaria_id) {
             query = query.eq('imobiliaria_id', imobiliaria_id).eq('user1_id', user_id);
        } else {
             query = query.or(`and(user1_id.eq.${user_id},user2_id.eq.${u2}),and(user1_id.eq.${u2},user2_id.eq.${user_id})`);
        }

        const { data: existing, error: findError } = await query.maybeSingle();

        if (findError) throw findError;

        if (existing) {
            return NextResponse.json({ conversation: existing, created: false });
        }

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
