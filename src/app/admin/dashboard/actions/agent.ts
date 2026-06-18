'use server';

import { createClient } from "@/lib/supabase/server";

export async function aproveAgent(requestId: string, userId: string): Promise<{success: boolean, message: string}>{
    const supabase = await createClient();
    try {
        // Verificar role de administrador
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Não autenticado');
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (profile?.role !== 'admin') throw new Error('Apenas administradores podem aprovar agentes');

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
        return { success: false, message: error instanceof Error ? error.message : "Erro ao aprovar agente" };
      }
}

export async function rejectAgent(requestId: string): Promise<{success: boolean, message: string, rejection_reason?: string}>{
    const supabase = await createClient();
    try {
        // Verificar role de administrador
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Não autenticado');
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (profile?.role !== 'admin') throw new Error('Apenas administradores podem rejeitar agentes');

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

        // Notificação in-app
        if (request) {
          const { insertNotification } = await import('@/lib/functions/supabase-actions/notifications-actions');
          await insertNotification({
            userId: request.user_id,
            type: 'agent_rejected',
            title: 'Pedido de agente rejeitado',
            message: 'O teu pedido para ser agente foi rejeitado pela administração. Contacta o suporte para mais informações.',
            data: { rejected_by: 'admin' },
          });
        }
        
        return { success: true, message: "Solicitação rejeitada!" };
    } catch (error) {
        console.error('Erro ao rejeitar agente:', error);
        return { success: false, message: "Erro ao rejeitar solicitação" };
    }
}
