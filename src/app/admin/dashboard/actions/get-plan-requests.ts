// lib/actions/get-plan-requests.ts
'use server'

import { supabase } from "@/lib/supabase"

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
    // 👇 garante que perfis é tratado como array
    const perfil = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles
    const plano = planos.find((p) => p.id === req.plan_id)

    return {
      id: req.id,
      nome: perfil?.primeiro_nome ?? "Sem nome",
      email: perfil?.email ?? "Sem email",
      telefone: perfil?.telefone ?? "",
      plano: plano?.nome ?? "Plano não encontrado",
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

    // Mapear o preço local para o plano
    const planPrices: Record<string, number> = {
      BÁSICO: 99000.0,
      PROFESSIONAL: 199000.0,
      SUPER: 499000.0,
      FREE: 0,
    };

    const valor = planPrices[subscribedPlan.nome] ?? 0;

    // Criar fatura
    const { error: createFaturaErro } = await supabase
      .from("faturas")
      .insert({
        user_id: userId,
        valor,
        status: "Pago",
        servico: `PLANO ${subscribedPlan.nome}`,
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
    // Atualizar status da solicitação para rejeitado
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
    // Verificar se a solicitação existe
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

    // Remover a solicitação de plano
    const { error: deleteError } = await supabase
      .from("plan_requests")
      .delete()
      .eq("id", requestId)

    if (deleteError) {
      throw new Error("Erro ao remover solicitação: " + deleteError.message)
    }

    // Atualizar o usuário para remover o plano e definir status como inativo
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