// app/actions/plan-actions.ts
'use server';

import { supabase } from "@/lib/supabase";

export async function handlePlanRequest(
  requestId: string,
  action: "approved" | "rejected"
) {
  try {
    // Buscar a solicitação
    const { data: request, error } = await supabase
      .from("plan_requests")
      .select("id, user_id, plan_id, status")
      .eq("id", requestId)
      .single();

    if (error || !request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    // Atualizar status
    const { error: updateRequestError } = await supabase
      .from("plan_requests")
      .update({
        status: action,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateRequestError) {
      return { success: false, error: updateRequestError.message };
    }

    // Se aprovado, atualizar plano do user
    if (action === "approved") {
      const { error: updateUserError } = await supabase
        .from("profiles")
        .update({
          pacote_agente_id: request.plan_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.user_id);

      if (updateUserError) {
        return { success: false, error: updateUserError.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Erro ao processar solicitação:", err);
    return { success: false, error: "Erro interno do servidor" };
  }
}

export async function handleRequestPlanChange(userId: string, planName: string) {
  try {
    // Mapear nome do plano para ID (você precisa criar esta lógica)
    const planId = await getPlanIdByName(planName);
    
    if (!planId) {
      return { success: false, error: "Plano não encontrado" };
    }

    const { error } = await supabase
      .from("plan_requests")
      .insert([
        {
          user_id: userId,
          plan_id: planId,
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

// Função auxiliar para obter ID do plano pelo nome
async function getPlanIdByName(planName: string): Promise<string | null> {
  // Você precisa implementar esta função baseada na sua estrutura de banco
  const planMap: { [key: string]: string } = {
    "Plano Básico": "26404022-2e38-4770-a89a-9f9c04ec5336",
    "Plano Professional": "b6034f3a-7ac6-4da9-a825-bb5892c02a93", 
    "Plano Super": "a3d276fa-9f6d-4525-9d65-22031819cfab"
  };
  
  return planMap[planName] || null;
}