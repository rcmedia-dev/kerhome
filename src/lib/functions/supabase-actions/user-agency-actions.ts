'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { updateImobiliariaAction } from './admin-imobiliaria-actions';

export async function getUserAgency(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('imobiliarias')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar agência do usuário:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar agência do usuário:', error);
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

