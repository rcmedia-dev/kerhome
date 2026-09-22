'use server';

import { createClient } from '@/lib/supabase/server';
import { Fatura, faturaSchema } from '@/lib/types/property';

// Buscar faturas do utilizador autenticado
export async function getFaturas(userId: string): Promise<Fatura[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('faturas')
    .select('id, servico, valor, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getFaturas] Erro ao buscar faturas:', error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Valida cada registo com Zod — descarta qualquer linha malformada
  return data
    .map(f => faturaSchema.safeParse(f))
    .filter(r => r.success)
    .map(r => (r as { success: true; data: Fatura }).data);
}
