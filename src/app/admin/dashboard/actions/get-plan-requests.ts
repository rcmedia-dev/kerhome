// lib/actions/get-plan-requests.ts
'use server'

import { updateUserPlan } from "@/lib/actions/update-user-plan"
import { supabase } from "@/lib/supabase"
import { UserPlan } from "@/lib/types/agent"

export async function getPlanRequests() {
  const { data: requests, error: reqError } = await supabase
    .from("plan_requests")
    .select(`
      id,
      status,
      created_at,
      requested_plan,
      profiles (
        id,
        primeiro_nome,
        email,
        telefone
      )
    `)
    .order("created_at", { ascending: false })

  if (reqError) {
    console.error("Erro ao buscar plan_requests:", reqError)
    return []
  }

  // Buscar os planos da tabela correta
  const { data: planos, error: planosError } = await supabase
    .from("planos_agente")
    .select("id, nome")

  if (planosError) {
    console.error("Erro ao buscar planos:", planosError)
    return []
  }

  // Cruzar os pedidos com os planos
  return requests.map((req) => {
    const plano = planos.find((p) => p.id === req.requested_plan)
    return {
      id: req.id,
      nome: req.profiles?.primeiro_nome ?? "Sem nome",
      email: req.profiles?.email ?? "Sem email",
      telefone: req.profiles?.telefone ?? "",
      plano: plano?.nome ?? "Plano Básico",
      status:
        req.status === "pending"
          ? ("Pendentes" as const)
          : req.status === "approved"
          ? ("Aprovados" as const)
          : ("Rejeitados" as const),
      dataInscricao: req.created_at,
      requested_plan: req.requested_plan,
      user_id: req.profiles?.id
    }
  })
}

// Aprova uma solicitação de plano
export async function approvePlanRequest(
  requestId: string,
  userId: string,
  newPlan: UserPlan
) {
  try {
    // Atualiza o plano do usuário (campos do plano em planos_agente)
    const updateResult = await updateUserPlan(userId, newPlan);

    if (!updateResult.success) {
      throw new Error("Erro ao atualizar plano: " + updateResult.error);
    }

    // Atualiza status da solicitação para aprovado
    const { error: statusError } = await supabase
      .from("plan_requests")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (statusError) {
      throw new Error("Erro ao aprovar solicitação: " + statusError.message);
    }

    return { success: true, message: "Solicitação aprovada com sucesso!" };
  } catch (error) {
    console.error("Erro ao aprovar solicitação:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}


export async function rejectPlanRequest(requestId: string) {
  try {
    // Atualizar status da solicitação para rejeitado
    const { error } = await supabase
      .from("plan_requests")
      .update({ status: "rejected" })
      .eq("id", requestId)

    if (error) {
      throw new Error("Erro ao rejeitar solicitação: " + error.message)
    }

    return { success: true, message: "Solicitação rejeitada com sucesso!" }
  } catch (error) {
    console.error("Erro ao rejeitar solicitação:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro desconhecido" 
    }
  }
}
