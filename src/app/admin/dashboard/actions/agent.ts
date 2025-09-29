import { supabase } from "@/lib/supabase";

export async function aproveAgent(requestId: string, userId: string): Promise<{success: boolean, message: string}>{
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

export async function rejectAgent(requestId: string): Promise<{success: boolean, message: string}>{
    try {
        const { error } = await supabase
        .from('agente_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
        
        if (error) throw error;
        
        return { success: true, message: "Solicitação rejeitada!" };
    } catch (error) {
        console.error('Erro ao rejeitar agente:', error);
        return { success: false, message: "Erro ao rejeitar solicitação" };
    }
}