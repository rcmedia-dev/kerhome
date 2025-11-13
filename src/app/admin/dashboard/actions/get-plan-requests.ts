// lib/actions/get-plan-requests.ts
'use server'

import { supabase } from "@/lib/supabase"

// Mapear nomes de planos para exibição e preços
const PLAN_NAME_MAP: Record<string, string> = {
  "BÁSICO": "Plano Básico",
  "PROFESSIONAL": "Plano Professional",
  "SUPER": "Plano Super",
  "FREE": "Plano Free",
};

const PLAN_PRICES: Record<string, number> = {
  "BÁSICO": 69000,
  "PROFESSIONAL": 118000,
  "SUPER": 250000,
  "FREE": 0,
}

// Buscar todas as solicitações de plano
export async function getPlanRequests() {
  const { data: requests, error: reqError } = await supabase
    .from("plan_requests")
    .select(`
      id,
      status,
      created_at,
      plan_id,
      user_id,
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
    const perfil = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles
    const plano = planos.find((p) => p.id === req.plan_id)

    return {
      id: req.id,
      nome: perfil?.primeiro_nome ?? "Sem nome",
      email: perfil?.email ?? "Sem email",
      telefone: perfil?.telefone ?? "",
      plano: plano ? PLAN_NAME_MAP[plano.nome] ?? plano.nome : "Plano não encontrado",
      status:
        req.status === "pending"
          ? ("Pendentes" as const)
          : req.status === "approved"
          ? ("Aprovados" as const)
          : ("Rejeitados" as const),
      dataInscricao: req.created_at,
      plan_id: req.plan_id,
      user_id: req.user_id,
    }
  })
}

// Aprova uma solicitação de plano
export async function approvePlanRequest(
  requestId: string,
  userId: string,
  planId: string
) {
  try {
    // Atualiza o plano do usuário
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        pacote_agente_id: planId,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      throw new Error("Erro ao atualizar plano do usuário: " + updateError.message);
    }

    // Atualiza status da solicitação para aprovado
    const { error: statusError } = await supabase
      .from("plan_requests")
      .update({ 
        status: "approved", 
        updated_at: new Date().toISOString() 
      })
      .eq("id", requestId);

    if (statusError) {
      throw new Error("Erro ao aprovar solicitação: " + statusError.message);
    }

    // Buscar o plano aprovado
    const { data: subscribedPlan, error: subscribedPlanError } = await supabase
      .from("planos_agente")
      .select("*")
      .eq("id", planId)
      .maybeSingle();

    if (subscribedPlanError || !subscribedPlan) {
      throw new Error("Erro ao buscar plano selecionado: " + subscribedPlanError?.message);
    }

    // Valor do plano aprovado
    const valor = PLAN_PRICES[subscribedPlan.nome] ?? 0;
    const displayName = PLAN_NAME_MAP[subscribedPlan.nome] ?? subscribedPlan.nome;

    // Criar fatura
    const { error: createFaturaErro } = await supabase
      .from("faturas")
      .insert({
        user_id: userId,
        valor,
        status: "Pago",
        servico: `${displayName}`,
      });

    if (createFaturaErro) {
      throw new Error("Erro ao criar fatura: " + createFaturaErro.message);
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

// Rejeita uma solicitação de plano
export async function rejectPlanRequest(requestId: string) {
  try {
    const { error } = await supabase
      .from("plan_requests")
      .update({ 
        status: "rejected",
        updated_at: new Date().toISOString()
      })
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

// Remove uma subscrição de plano de um agente
export async function removeSubscription(requestId: string, userId: string) {
  try {
    const { data: existingRequest, error: fetchError } = await supabase
      .from("plan_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    if (fetchError || !existingRequest) {
      return { 
        success: false, 
        message: 'Solicitação não encontrada' 
      }
    }

    const { error: deleteError } = await supabase
      .from("plan_requests")
      .delete()
      .eq("id", requestId)

    if (deleteError) {
      throw new Error("Erro ao remover solicitação: " + deleteError.message)
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        pacote_agente_id: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)

    if (updateError) {
      throw new Error("Erro ao atualizar perfil do usuário: " + updateError.message)
    }

    return { 
      success: true, 
      message: 'Subscrição removida com sucesso' 
    }
  } catch (error) {
    console.error('Erro ao remover subscrição:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro interno ao remover subscrição' 
    }
  }
}
