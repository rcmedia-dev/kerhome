import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,       // mantém a sessão no localStorage
    autoRefreshToken: true,     // renova tokens automaticamente
    detectSessionInUrl: true,   // útil quando usas magic link / oauth
  },
})

// Helper para obter o cliente Supabase com RLS habilitado
export const getSupabase = (accessToken: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
