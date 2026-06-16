'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ApprovePropertyParams {
  propertyId: string;
}

export async function approveProperty({ propertyId }: ApprovePropertyParams) {
  try {
    const supabase = await createClient();
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
    if (existingProperty.aprovement_status === 'approved') {
      return {
        success: false,
        message: 'Este imóvel já está aprovado',
      };
    }

    // 3. Atualizar o status no banco de dados
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        aprovement_status: 'approved'
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
    const supabase = await createClient();
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
    if (existingProperty.aprovement_status === 'rejected') {
      return {
        success: false,
        message: 'Este imóvel já está rejeitado',
      };
    }

    // 3. Buscar dados do imóvel para notificação
    const { data: propertyData } = await supabase
      .from('properties')
      .select('title, owner_id')
      .eq('id', propertyId)
      .single();

    // 4. Atualizar o status no banco de dados
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        aprovement_status: 'rejected',
      })
      .eq('id', propertyId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 5. Notificar proprietário sobre rejeição
    if (propertyData?.owner_id) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('primeiro_nome, ultimo_nome, email, telefone')
        .eq('id', propertyData.owner_id)
        .single();

      if (owner) {
        const webhookUrl = 'https://n8n.srv1157846.hstgr.cloud/webhook/notificate';
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evento: 'imovel_rejeitado',
            dados: {
              nome: `${owner.primeiro_nome || ''} ${owner.ultimo_nome || ''}`.trim(),
              email: owner.email,
              telefone: owner.telefone || '',
              imovel_titulo: propertyData.title,
              imovel_id: propertyId,
              motivos: ['Rejeitado manualmente pela administração'],
              score: 0,
            },
          }),
        }).catch(() => {});
      }
    }

    // 6. Atualizar o cache
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
