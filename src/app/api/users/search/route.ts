import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const exclude_id = searchParams.get('exclude_id');

    if (!query || query.length < 2) {
        return NextResponse.json({ users: [] });
    }

    try {
        let dbQuery = supabase
            .from('profiles')
            .select('id, primeiro_nome, ultimo_nome, email, avatar_url')
            .or(`primeiro_nome.ilike.%${query}%,ultimo_nome.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(10);

        if (exclude_id) {
            dbQuery = dbQuery.neq('id', exclude_id);
        }

        const { data: users, error } = await dbQuery;

        if (error) throw error;

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
