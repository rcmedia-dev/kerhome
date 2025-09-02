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

    if (userError) {
      console.error('Erro ao buscar perfil do usuário:', userError);
      return null;
    }

    if (!userData || !userData.pacote_agente_id) {
      console.log('Usuário não possui plano atribuído');
      return null;
    }

    // 2. Buscar os detalhes do plano
    const { data: planData, error: planError } = await supabase
      .from('planos_agente')
      .select('nome, limite, destaques, destaques_permitidos')
      .eq('id', userData.pacote_agente_id)
      .single();

    if (planError) {
      console.error('Erro ao buscar detalhes do plano:', planError);
      return null;
    }

    if (!planData) {
      console.log('Plano não encontrado para o ID:', userData.pacote_agente_id);
      return null;
    }

    // 3. Contar quantos imóveis o usuário já cadastrou
    const { count: imoveisCount, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'active'); // Considerar apenas imóveis ativos

    if (countError) {
      console.error('Erro ao contar imóveis do usuário:', countError);
      // Continuamos mesmo com erro na contagem, usando 0 como fallback
    }

    return {
      nome: planData.nome,
      limite: planData.limite,
      restante: Math.max(0, planData.limite - (imoveisCount || 0)),
      destaques: planData.destaques,
      destaquesPermitidos: planData.destaques_permitidos,
      pacote_agente_id: userData.pacote_agente_id
    };
  } catch (error) {
    console.error('Erro inesperado ao buscar plano do usuário:', error);
    return null;
  }
}