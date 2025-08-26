'use server';

import { supabase } from '@/lib/supabase';

export async function incrementPropertyViews(propertyId: string, userId: string, ownerId: string) {

  const { data, error } = await supabase
    .rpc('add_property_view', {
      p_property_id: propertyId,
      p_user_id: userId,
      p_owner_id: ownerId,
    });

  if (error) {
    console.error('Error incrementing views:', error);
    return 0;
  }

  return data;
}