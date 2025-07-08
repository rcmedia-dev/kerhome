import { getSupabaseClient } from '@/lib/supabase';
import { Property } from '@/lib/types/property';

export async function getUserProperties(userId: string): Promise<Property[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar propriedades do usuário:', error.message);
    return [];
  }
  return data as Property[];
}
