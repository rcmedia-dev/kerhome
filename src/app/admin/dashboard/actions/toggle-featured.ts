'use server';

import { createClient } from '@/lib/supabase/server';

export async function toggleFeaturedProperty(propertyId: string, featured: boolean) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Não autenticado');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'Administrador') {
    throw new Error('Apenas administradores podem destacar propriedades');
  }

  const { error } = await supabase
    .from('properties')
    .update({ is_featured: featured })
    .eq('id', propertyId);

  if (error) throw new Error(error.message);

  return { success: true, featured };
}
