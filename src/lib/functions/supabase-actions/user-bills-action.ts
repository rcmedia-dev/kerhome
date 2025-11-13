'use server';

import { supabase } from '@/lib/supabase';
import { Fatura, faturaSchema } from '@/lib/types/property';

// Buscar faturas do usuário
export async function getFaturas(userId: string): Promise<Fatura[]> {
  const { data, error } = await supabase
    .from('faturas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log('faturas:', data)

  if (error) {
    console.error('Erro ao buscar faturas:', error.message);
    return [];
  }

  if (!data) return [];

  // Valida os dados com Zod
  const parsed = data.map((f) => faturaSchema.safeParse(f));
  console.log('parsed faturas:', parsed)
  return parsed
    .filter((p) => p.success)
    .map((p) => (p as any).data);
}
