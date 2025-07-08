import { getSupabaseClient } from '@/lib/supabase';
import { Property } from '@/lib/types/property';

export async function searchProperties({ q, status }: { q?: string; status?: string }): Promise<Property[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from('properties').select('*');
  if (status) query = query.eq('status', status);
  // Busca simples por título ou campos de endereço
  if (q) {
    // Busca em title, endereco, bairro, cidade, provincia, pais
    query = query.or([
      `title.ilike.%${q}%`,
      `endereco.ilike.%${q}%`,
      `bairro.ilike.%${q}%`,
      `cidade.ilike.%${q}%`,
      `provincia.ilike.%${q}%`,
      `pais.ilike.%${q}%`
    ].join(','));
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar propriedades:', error.message);
    return [];
  }
  return data as Property[];
}
