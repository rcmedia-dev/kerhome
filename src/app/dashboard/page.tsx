// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Dashboard from '@/components/dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, avatar_url, role')
    .eq('id', session.user.id)
    .single()

  return <Dashboard session={session} profile={profile} />
}
