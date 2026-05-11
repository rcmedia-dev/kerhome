import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();
        const { conversation_id, lead_temperature, internal_notes } = await req.json();

        if (!conversation_id) {
            return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
        }

        const updateData: any = {
            updated_at: new Date().toISOString()
        };
        
        if (lead_temperature !== undefined) updateData.lead_temperature = lead_temperature;
        if (internal_notes !== undefined) updateData.internal_notes = internal_notes;

        const { error } = await supabase
            .from('conversations')
            .update(updateData)
            .eq('id', conversation_id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating conversation CRM:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
