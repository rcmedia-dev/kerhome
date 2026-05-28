// lib/actions/get-user-plan.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

interface UserPlan {
  nome: string;
  limite: number;
  restante: number;
  destaques: boolean;
  destaquesPermitidos: number;
  pacote_agente_id: string;
}

export async function getUserPlan(userId?: string): Promise<UserPlan | null> {
  noStore();

  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  // 1. Buscar o ID do plano do usuário
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('pacote_agente_id')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error(`Erro ao buscar perfil: ${userError.message}`);
    return null;
  }

  if (!userData?.pacote_agente_id) {
    return null; // Utilizador sem plano — não lançar erro
  }

  // 2. Buscar os detalhes do plano
  const { data: planData, error: planError } = await supabase
    .from('planos_agente')
    .select('nome, limite, destaques, destaques_permitidos')
    .eq('id', userData.pacote_agente_id)
    .single();

  if (planError) {
    console.error(`Erro ao buscar detalhes do plano: ${planError.message}`);
    return null;
  }

  if (!planData) {
    console.error(`Plano não encontrado para o ID: ${userData.pacote_agente_id}`);
    return null;
  }

  // 3. Contar quantos imóveis ativos o usuário já cadastrou
  const { count: imoveisCount, error: countError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .eq('status', 'active');

  if (countError) {
    console.error(`Erro ao contar imóveis do usuário: ${countError.message}`);
    // Non-fatal error, we can still return the plan details with 0 used
  }

  return {
    nome: planData.nome,
    limite: planData.limite,
    restante: Math.max(0, planData.limite - (imoveisCount || 0)),
    destaques: planData.destaques,
    destaquesPermitidos: planData.destaques_permitidos,
    pacote_agente_id: userData.pacote_agente_id,
  };
}
