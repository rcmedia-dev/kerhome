'use server';

import { createClient } from "@/lib/supabase/server";

export async function aproveAgent(requestId: string, userId: string): Promise<{success: boolean, message: string}>{
    const supabase = await createClient();
    try {
        const { error } = await supabase
          .from('agente_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);
        
        if (error) throw error;
        
        // Atualizar o perfil do usuário para ser agente
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'agent' })
          .eq('id', userId);
        
        if (profileError) throw profileError;
        
        return { success: true, message: "Agente aprovado com sucesso!" };
      } catch (error) {
        console.error('Erro ao aprovar agente:', error);
        return { success: false, message: "Erro ao aprovar agente" };
      }
}

export async function rejectAgent(requestId: string): Promise<{success: boolean, message: string, rejection_reason?: string}>{
    const supabase = await createClient();
    try {
        // Buscar dados da solicitação antes de rejeitar
        const { data: request } = await supabase
          .from('agente_requests')
          .select('user_id')
          .eq('id', requestId)
          .single();

        const { error } = await supabase
        .from('agente_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
        
        if (error) throw error;

        // Notificar agente sobre rejeição
        if (request) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('primeiro_nome, ultimo_nome, email, telefone')
            .eq('id', request.user_id)
            .single();

          if (profile) {
            const webhookUrl = 'https://n8n.srv1157846.hstgr.cloud/webhook/notificate';
            fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                evento: 'agente_rejeitado',
                dados: {
                  nome: `${profile.primeiro_nome || ''} ${profile.ultimo_nome || ''}`.trim(),
                  email: profile.email,
                  telefone: profile.telefone || '',
                  user_id: request.user_id,
                  motivos: ['Rejeitado manualmente pela administração'],
                  score: 0,
                },
              }),
            }).catch(() => {});
          }
        }
        
        return { success: true, message: "Solicitação rejeitada!" };
    } catch (error) {
        console.error('Erro ao rejeitar agente:', error);
        return { success: false, message: "Erro ao rejeitar solicitação" };
    }
}
