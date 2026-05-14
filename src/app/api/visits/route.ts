import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const conversation_id = searchParams.get('conversation_id');
    const agent_id = searchParams.get('agent_id');

    if (!conversation_id && !agent_id) {
        return NextResponse.json({ error: "conversation_id or agent_id required" }, { status: 400 });
    }

    let query = supabase.from('visits').select('*');

    if (conversation_id) {
        query = query.eq('conversation_id', conversation_id);
    } else if (agent_id) {
        query = query.eq('agent_id', agent_id);
    }

    const { data, error } = await query
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

    if (error) {
        console.error("Error fetching visits:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ visits: data || [] });
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            conversation_id,
            property_id,
            property_title,
            lead_id,
            lead_name,
            scheduled_date,
            scheduled_time,
            notes
        } = body;

        if (!conversation_id || !scheduled_date || !scheduled_time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('visits')
            .insert([{
                conversation_id,
                property_id: property_id || null,
                property_title: property_title || null,
                agent_id: user.id,
                lead_id: lead_id || null,
                lead_name: lead_name || null,
                scheduled_date,
                scheduled_time,
                notes: notes || null,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) {
            console.error("Database error creating visit:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ visit: data });
    } catch (error: any) {
        console.error("Error creating visit:", error);
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('visits')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('agent_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ visit: data });
    } catch (error) {
        console.error("Error updating visit:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('visits')
            .delete()
            .eq('id', id)
            .eq('agent_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting visit:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
