'use server';


import { Plano, PlanoAgente } from "../types/agent";


export async function updateUserPlan(userId: string, plan: Plano): Promise<{ success: boolean; error?: string }> {
  console.log(`Simulando atualização de plano para o usuário ${userId} para o plano ${plan}`);

  // Simula atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simula uma atualização bem-sucedida
  return { success: true };

  // Para simular erro, comente acima e descomente abaixo:
  // return { success: false, error: "Falha ao atualizar o plano" };
}
