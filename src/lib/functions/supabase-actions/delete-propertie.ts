'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteProperty(propertyId: string, userId?: string) {
  // 1. Verificar se o usuário é o dono da propriedade
  const { data: property, error: fetchError } = await supabase
    .from('properties')
    .select('owner_id, gallery')
    .eq('id', propertyId)
    .maybeSingle();

  if (fetchError) {
    console.error('Erro ao buscar propriedade:', fetchError);
    throw new Error('Erro ao verificar propriedade');
  }

  console.log('Owner Id:', property?.owner_id, 'User Id:', userId);

  if (property?.owner_id !== userId) {
    throw new Error('Você não tem permissão para deletar esta propriedade');
  }

  // 2. Deletar imagens associadas (se existirem)
  if (property?.gallery[0] && property.gallery.length > 0) {
    const imagePaths = property.gallery.map((img: string) => 
      img.split('/').pop()
    );

    const { error: storageError } = await supabase
      .storage
      .from('images')
      .remove(imagePaths);

    if (storageError) {
      console.error('Erro ao deletar imagens:', storageError);
      // Não interrompe o processo, apenas registra o erro
    }
  }

  // 3. Deletar a propriedade
  const { error: deleteError } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (deleteError) {
    console.log('Erro ao deletar propriedade');
  }

  // 4. Invalidar cache e redirecionar
  revalidatePath('/dashboard');
  redirect('/dashboard');
}