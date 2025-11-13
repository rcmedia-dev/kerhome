// src/lib/actions/send-password-reset.ts
'use server'

import { createClient } from "@/lib/supabase/client"

export async function sendPasswordReset(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`, // página para redefinir
  })

  if (error) throw error
  return { success: true }
}
