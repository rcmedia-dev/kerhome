'use server';

import { createClient } from '@/lib/supabase/client';

export async function checkAgentRequestStatus(userId: string) {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('agente_requests')
            .select('status')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Nenhum registro encontrado
            }
            console.error('Erro ao verificar status da solicitação:', error);
            return null;
        }

        return data?.status || null;
    } catch (err) {
        console.error('Erro inesperado ao verificar solicitação:', err);
        return null;
    }
}
