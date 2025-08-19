'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface ApprovePropertyParams {
  propertyId: string;
}

export async function approveProperty({ propertyId }: ApprovePropertyParams) {
  try {
    // 1. Verificar se o imóvel existe
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id, aprovement_status')
      .eq('id', propertyId)
      .single();

    if (fetchError || !existingProperty) {
      throw new Error(fetchError?.message || 'Imóvel não encontrado');
    }

    // 2. Verificar se já não está aprovado
    if (existingProperty.aprovement_status === 'aprovado') {
      return {
        success: false,
        message: 'Este imóvel já está aprovado',
      };
    }

    // 3. Atualizar o status no banco de dados
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        aprovement_status: 'aprovado'
      })
      .eq('id', propertyId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 4. Atualizar o cache
    revalidatePath('/properties');
    
    return {
      success: true,
      message: 'Imóvel aprovado com sucesso!',
    };

  } catch (error) {
    console.error('Error in approveProperty:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido ao aprovar imóvel',
    };
  }
}


interface RejectPropertyParams {
  propertyId: string;
}

export async function rejectProperty({ propertyId }: RejectPropertyParams) {
  try {
    // 1. Verificar se o imóvel existe
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id, aprovement_status')
      .eq('id', propertyId)
      .single();

    if (fetchError || !existingProperty) {
      throw new Error(fetchError?.message || 'Imóvel não encontrado');
    }

    // 2. Verificar se já não está rejeitado
    if (existingProperty.aprovement_status === 'rejeitado') {
      return {
        success: false,
        message: 'Este imóvel já está rejeitado',
      };
    }

    // 3. Atualizar o status no banco de dados
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        aprovement_status: 'rejeitado',
      })
      .eq('id', propertyId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 4. Atualizar o cache
    revalidatePath('/properties');
    
    return {
      success: true,
      message: 'Imóvel rejeitado com sucesso!',
    };

  } catch (error) {
    console.error('Error in rejectProperty:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido ao rejeitar imóvel',
    };
  }
}