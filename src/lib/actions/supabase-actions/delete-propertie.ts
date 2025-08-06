'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteProperty(propertyId: string, userId?: string) {
  // 1. Verificar se o usuário é o dono da propriedade
  const { data: property, error: fetchError } = await supabase
    .from('properties')
    .select('owner_id, images')
    .eq('id', propertyId)
    .single();

  if (fetchError) {
    throw new Error('Erro ao verificar propriedade');
  }

  if (property.owner_id !== userId) {
    throw new Error('Você não tem permissão para deletar esta propriedade');
  }

  // 2. Deletar imagens associadas (se existirem)
  if (property.images && property.images.length > 0) {
    const imagePaths = property.images.map((img: string) => 
      img.split('/').pop()
    );

    const { error: storageError } = await supabase
      .storage
      .from('images/images')
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
    throw new Error('Erro ao deletar propriedade');
  }

  // 4. Invalidar cache e redirecionar
  revalidatePath('/dashboard');
  redirect('/dashboard');
}