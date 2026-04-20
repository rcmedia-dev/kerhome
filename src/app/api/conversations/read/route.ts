import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();
        const { conversation_id, user_id } = await req.json();

        if (!conversation_id || !user_id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // Mark messages as read where:
        // conversation_id matches
        // sender_id IS NOT current user (we read others' messages)
        // read_by_receiver is false

        const { error } = await supabase
            .from('messages')
            .update({ read_by_receiver: true })
            .eq('conversation_id', conversation_id)
            .neq('sender_id', user_id)
            .eq('read_by_receiver', false);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking messages read:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
