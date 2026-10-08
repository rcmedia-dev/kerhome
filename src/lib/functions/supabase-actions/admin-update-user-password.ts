import { createClient } from "@supabase/supabase-js";



let adminClientCache: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
  if (!adminClientCache) {
    adminClientCache = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'dummy_key', // Nunca use isso no client!
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return adminClientCache;
}


export async function updateUserPassword(userId: string, newPassword: string) {
  if (!userId || !newPassword) {
    return { success: false, error: 'ID ou senha inválidos' };
  }

  const { data, error } = await getSupabaseAdmin().auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

