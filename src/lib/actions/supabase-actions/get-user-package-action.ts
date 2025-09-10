// lib/actions/get-user-plan.ts
'use server';

import { supabase } from '@/lib/supabase';
import { unstable_noStore as noStore } from 'next/cache';

interface UserPlan {
  nome: string;
  limite: number;
  restante: number;
  destaques: boolean;
  destaquesPermitidos: number;
  pacote_agente_id: string;
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  noStore();

  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  // 1. Buscar o ID do plano do usuário
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('pacote_agente_id')
    .eq('id', userId)
    .single();

  if (userError) {
    throw new Error(`Erro ao buscar perfil: ${userError.message}`);
  }

  if (!userData?.pacote_agente_id) {
    throw new Error('Usuário não possui plano atribuído');
  }

  // 2. Buscar os detalhes do plano
  const { data: planData, error: planError } = await supabase
    .from('planos_agente')
    .select('nome, limite, destaques, destaques_permitidos')
    .eq('id', userData.pacote_agente_id)
    .single();

  if (planError) {
    throw new Error(`Erro ao buscar detalhes do plano: ${planError.message}`);
  }

  if (!planData) {
    throw new Error(`Plano não encontrado para o ID: ${userData.pacote_agente_id}`);
  }

  // 3. Contar quantos imóveis ativos o usuário já cadastrou
  const { count: imoveisCount, error: countError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .eq('status', 'active');

  if (countError) {
    throw new Error(`Erro ao contar imóveis do usuário: ${countError.message}`);
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
