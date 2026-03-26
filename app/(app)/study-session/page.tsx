import { createSupabaseServerClient } from '@/lib/supabase/server'
import StudySessionClient from '@/components/StudySessionClient'

export default async function StudySessionPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, current_cycle_id')
    .eq('id', user!.id)
    .single()

  const { data: cycles } = await supabase
    .from('cycles')
    .select(`
      id,
      discipline,
      position
    `)
    .eq('user_id', user!.id)
    .order('position', { ascending: true })

  const { data: studyMethods } = await supabase
    .from('study_methods')
    .select('id, name')
    .order('id', { ascending: true })

  const { data: recentSessions } = await supabase
    .from('study_sessions')
    .select(`
      id,
      created_at,
      duration_seconds,
      cycles (
        discipline
      ),
      study_methods (
        name
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  let effectiveCurrentCycleId: number | null = profile?.current_cycle_id ?? null

  if (!effectiveCurrentCycleId && cycles && cycles.length > 0) {
    effectiveCurrentCycleId = cycles[0].id
  }

  const normalizedRecentSessions =
    recentSessions?.map((session) => ({
      id: session.id,
      created_at: session.created_at,
      duration_seconds: session.duration_seconds,
      discipline: Array.isArray(session.cycles)
        ? session.cycles[0]?.discipline ?? 'Sem disciplina'
        : session.cycles?.discipline ?? 'Sem disciplina',
      study_method: Array.isArray(session.study_methods)
        ? session.study_methods[0]?.name ?? 'Sem método'
        : session.study_methods?.name ?? 'Sem método',
    })) ?? []

  return (
    <StudySessionClient
      userId={user!.id}
      cycles={cycles ?? []}
      studyMethods={studyMethods ?? []}
      currentCycleId={effectiveCurrentCycleId}
      recentSessions={normalizedRecentSessions}
    />
  )
}