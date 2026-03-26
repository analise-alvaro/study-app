import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import AppShell from '@/components/AppShell'

type Props = {
  children: ReactNode
}

export default async function AuthenticatedLayout({ children }: Props) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, email')
    .eq('id', user.id)
    .single()

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('duration_seconds')
    .eq('user_id', user.id)

  const totalSeconds =
    sessions?.reduce((acc, session) => acc + session.duration_seconds, 0) ?? 0

  const totalHours = (totalSeconds / 3600).toFixed(1)

  return (
    <AppShell
      username={profile?.username ?? 'Usuário'}
      totalHours={totalHours}
    >
      {children}
    </AppShell>
  )
}