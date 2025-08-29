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
  noStore();

  try {
    // Buscar o user e o plano atual
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('pacote_agente_id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: userError?.message || 'Usuário não encontrado' };
    }

    // Buscar plano atual
    const { data: planData, error: planError } = await supabase
      .from('planos_agente')
      .select('id')
      .eq('id', userData.pacote_agente_id)
      .single();

    if (planError || !planData) {
      return { success: false, error: planError?.message || 'Plano não encontrado' };
    }

    // Atualizar o plano
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
      return { success: false, error: updateError.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
