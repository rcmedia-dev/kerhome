'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';

const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceKey,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

export async function getImobiliariasWithOwnersAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from('imobiliarias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const list = data || [];

    // Enrich with owner data for pending items
    const ownerIds = list
      .filter((i: any) => i.status === 'pending' && i.owner_id)
      .map((i: any) => i.owner_id);

    if (ownerIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, primeiro_nome, ultimo_nome, email, telefone, role')
        .in('id', ownerIds);

      if (profiles) {
        const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
        return list.map((item: any) => ({
          ...item,
          owner: item.owner_id ? profileMap.get(item.owner_id) || null : null
        }));
      }
    }

    return list;
  } catch (error) {
    console.error('Error fetching imobiliarias with owners:', error);
    return [];
  }
}

