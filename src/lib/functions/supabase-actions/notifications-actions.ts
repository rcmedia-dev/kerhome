'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export async function insertNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}) {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
    });
    if (error) throw error;
  } catch (err) {
    console.error('Erro ao inserir notificação:', err);
  }
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar notificações:', err);
    return [];
  }
}

export async function fetchUnreadCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Erro ao contar notificações não lidas:', err);
    return 0;
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const supabase = await createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  } catch (err) {
    console.error('Erro ao marcar notificação como lida:', err);
  }
}

export async function markAllNotificationsRead(userId: string) {
  try {
    const supabase = await createClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  } catch (err) {
    console.error('Erro ao marcar todas notificações como lidas:', err);
  }
}
