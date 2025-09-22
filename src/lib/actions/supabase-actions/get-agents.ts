import { supabase } from "@/lib/supabase";

export async function getAgents(){
    const agents = await supabase.
        from('profiles')
        .select('*')
        .eq('role', 'agent')
        .limit(4)

    return agents
}