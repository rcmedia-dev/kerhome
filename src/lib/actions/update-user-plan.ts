// lib/actions/update-user-plan.ts (versão com tabela separada)
'use server';

import { supabase } from '../supabase';
import { unstable_noStore as noStore } from 'next/cache';
import { UserPlan } from '../types/agent';

interface UpdatePlanResult {
  success: boolean;
  error?: string;
}

export async function updateUserPlan(
  userId: string,
  newPlan: UserPlan
): Promise<UpdatePlanResult> {
  noStore(); // Evita cache para dados atualizados
  
  try {
    // 1. Verificar se o usuário já está inscrito neste plano
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('pacote_agente_id')
      .eq('id', userId)
      .single();

    if (userError) {
      return {
        success: false,
        error: userError.message
      };
    }

    const { data: planData, error: planDataError } = await supabase.from('planos_agente')
      .select('*')
      .eq('id', userData.pacote_agente_id)
      .single();

    // 3. Atualizar a referência do plano na tabela users
    const { error: updateError } = await supabase
      .from('planos_agente')
      .update({ 
        nome: newPlan.nome,
        limite: newPlan.limite,
        restante: newPlan.restante,
        destaques: newPlan.destaques,
        destaques_permitidos: newPlan.destaques_permitidos,
        updated_at: new Date().toISOString(), 
      })
      .eq('id', planData.id);

    if (updateError) {
      return {
        success: false,
        error: updateError.message
      };
    }

    // 4. Atualizar os dados do plano
    const { error: updatePlanError } = await supabase
      .from('planos_agente')
      .update({
        nome: newPlan.nome,
        limite: newPlan.limite,
        restante: newPlan.restante,
        destaques: newPlan.destaques,
        destaques_permitidos: newPlan.destaques_permitidos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planData.id);

    if (updatePlanError) {
      return {
        success: false,
        error: updatePlanError.message
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}