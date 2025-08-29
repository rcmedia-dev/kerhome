'use server';

import { updateUserPlan } from "@/lib/actions/update-user-plan";
import { supabase } from "@/lib/supabase";

export async function handlePlanRequest(requestId: string, action: 'approved' | 'rejected') {
  try {
    // Buscar a solicitação
    const { data: request, error } = await supabase
      .from('plan_requests')
      .select('id, user_id, requested_plan, status')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      return { success: false, error: 'Solicitação não encontrada' };
    }

    // Atualizar status
    const { error: updateRequestError } = await supabase
      .from('plan_requests')
      .update({ 
        status: action, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', requestId);

    if (updateRequestError) {
      return { success: false, error: updateRequestError.message };
    }

    // Se aprovado, atualizar plano do user
    if (action === 'approved') {
      const result = await updateUserPlan(request.user_id, request.requested_plan);
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }

    return { success: true };

  } catch (err) {
    console.error('Erro ao processar solicitação:', err);
    return { success: false, error: 'Erro interno do servidor' };
  }
}


export async function handleRequestPlanChange(
  userId: string,
  planData: {
    nome: string;
    limite: number;
    restante: number;
    destaques: boolean;
    destaques_permitidos: number;
  }
) {
  try {
    // Inserir solicitação
    const { error } = await supabase
      .from("plan_requests")
      .insert([
        {
          user_id: userId,
          requested_plan: planData,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Erro ao criar solicitação de plano:", err);
    return { success: false, error: "Erro interno do servidor" };
  }
}
