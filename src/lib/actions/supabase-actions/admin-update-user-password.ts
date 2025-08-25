import { createClient } from "@supabase/supabase-js";



const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!, // Nunca use isso no client!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);


export async function updateUserPassword(userId: string, newPassword: string) {
  if (!userId || !newPassword) {
    return { success: false, error: 'ID ou senha inválidos' };
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
