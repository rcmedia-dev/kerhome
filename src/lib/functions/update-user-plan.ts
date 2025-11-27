'use server';

import { supabase } from '@/lib/supabase';
import { unstable_noStore as noStore } from 'next/cache';
import { UserPlan } from '@/lib/types/agent';

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
    // 1. Buscar o plano pelo nome (ex.: "BÁSICO", "PROFESSIONAL", "SUPER")
    const { data: planData, error: planError } = await supabase
      .from('planos_agente')
      .select('id')
      .eq('nome', newPlan.nome)
      .single();

    if (planError || !planData) {
      return { success: false, error: planError?.message || 'Plano não encontrado' };
    }

    // 2. Atualizar o usuário para o novo plano
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        pacote_agente_id: planData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}
