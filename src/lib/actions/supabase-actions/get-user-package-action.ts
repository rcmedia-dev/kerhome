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
}

export async function getUserPlan(userId: string): Promise<UserPlan | null> {
  noStore(); // Para evitar cache em páginas dinâmicas
  
  if (!userId) return null;

  try {
    // 1. Buscar o ID do plano do usuário
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('pacote_agente_id')
      .eq('id', userId)
      .single();

    if (userError || !userData) throw userError || new Error('Usuário não encontrado');

    // 2. Buscar os detalhes do plano
    const { data: planData, error: planError } = await supabase
      .from('planos_agente')
      .select('nome, limite, destaques, destaques_permitidos')
      .eq('id', userData.pacote_agente_id)
      .single();

    if (planError || !planData) throw planError || new Error('Plano não encontrado');

    // 3. Contar quantos imóveis o usuário já cadastrou
    const { count: imoveisCount, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    if (countError) throw countError;

    return {
      nome: planData.nome,
      limite: planData.limite,
      restante: Math.max(0, planData.limite - (imoveisCount || 0)),
      destaques: planData.destaques,
      destaquesPermitidos: planData.destaques_permitidos
    };
  } catch (error) {
    console.error('Erro ao buscar plano do usuário:', error);
    return null;
  }
}