'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { updateImobiliariaAction } from './admin-imobiliaria-actions';

export async function getUserAgency(userId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Tentar encontrar a imobiliária onde o utilizador é o DONO
    const { data: ownerAgency } = await supabase
      .from('imobiliarias')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (ownerAgency) return ownerAgency;

    // 2. Se não for dono, verificar no perfil se ele é um MEMBRO vinculado
    const { data: profile } = await supabase
      .from('profiles')
      .select('imobiliaria_id')
      .eq('id', userId)
      .single();

    if (profile?.imobiliaria_id) {
      const { data: memberAgency } = await supabase
        .from('imobiliarias')
        .select('*')
        .eq('id', profile.imobiliaria_id)
        .maybeSingle();
      
      return memberAgency;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar agência do utilizador:', error);
    return null;
  }
}

export async function updateUserAgencyAction(id: string, data: any, originalData: any) {
  try {
    const supabase = await createClient();
    
    // Check for sensitive field changes
    const sensitiveFields = ['nome', 'nif']; // 'nif' if it exists in the future
    let shouldResetStatus = false;
    
    for (const field of sensitiveFields) {
      if (data[field] && data[field] !== originalData[field]) {
        shouldResetStatus = true;
        break;
      }
    }

    const updateData = {
      ...data,
      status: shouldResetStatus ? 'pending' : originalData.status,
    };

    // Use the existing update action which handles both user client and admin fallback
    const result = await updateImobiliariaAction(id, updateData);
    
    if (result.success) {
      revalidatePath('/dashboard');
      return { 
        success: true, 
        resetStatus: shouldResetStatus 
      };
    }
    
    return result;
  } catch (error: any) {
    console.error('Erro ao atualizar agência do usuário:', error);
    return { success: false, error: error.message };
  }
}

