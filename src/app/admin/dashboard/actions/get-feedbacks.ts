'use server';

import { createServiceClient } from '@/lib/supabase/server';

export interface Feedback {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  categoria: string;
  titulo: string;
  mensagem: string;
  url: string | null;
  user_agent: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export async function getFeedbacks() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar feedbacks: ${error.message}`);
  }

  return (data || []) as Feedback[];
}

export async function updateFeedbackStatus(id: string, status: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('feedbacks')
    .update({ status })
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao atualizar status: ${error.message}`);
  }

  return { success: true };
}
