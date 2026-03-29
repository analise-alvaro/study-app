import { createSupabaseServerClient } from '@/lib/supabase/server'
import StudySessionClient from '@/components/StudySessionClient'

type CycleRelation = { discipline: string }[] | { discipline: string } | null
type StudyMethodRelation = { name: string }[] | { name: string } | null

function getDisciplineFromRelation(relation: CycleRelation) {
  if (!relation) return 'Sem disciplina'
  if (Array.isArray(relation)) return relation[0]?.discipline ?? 'Sem disciplina'
  return relation.discipline ?? 'Sem disciplina'
}

function getMethodFromRelation(relation: StudyMethodRelation) {
  if (!relation) return 'Sem método'
  if (Array.isArray(relation)) return relation[0]?.name ?? 'Sem método'
  return relation.name ?? 'Sem método'
}

export default async function StudySessionPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, current_cycle_id')
    .eq('id', user.id)
    .single()

  const { data: cycles } = await supabase
    .from('cycles')
    .select(`
      id,
      discipline,
      position
    `)
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  const { data: studyMethods } = await supabase
    .from('study_methods')
    .select('id, name')
    .order('id', { ascending: true })

  const { data: recentSessions, error: recentSessionsError } = await supabase
    .from('study_sessions')
    .select(`
      id,
      created_at,
      session_date,
      duration_seconds,
      session_note,
      cycle_id,
      study_method_id,
      cycle:cycles!study_sessions_cycle_user_fk (
        discipline
      ),
      study_method:study_methods!study_sessions_study_method_id_fkey (
        name
      )
    `)
    .eq('user_id', user.id)
    .order('session_date', { ascending: false })
    .limit(10)

  if (recentSessionsError) {
    console.error('Erro ao buscar sessões recentes:', recentSessionsError)
  }

  let effectiveCurrentCycleId: number | null = profile?.current_cycle_id ?? null

  if (!effectiveCurrentCycleId && cycles && cycles.length > 0) {
    effectiveCurrentCycleId = cycles[0].id
  }

  const normalizedRecentSessions =
    recentSessions?.map((session) => ({
      id: session.id,
      created_at: session.created_at,
      session_date: session.session_date ?? session.created_at,
      duration_seconds: session.duration_seconds,
      cycle_id: session.cycle_id,
      study_method_id: session.study_method_id,
      session_note: session.session_note ?? '',
      discipline: getDisciplineFromRelation(session.cycle as CycleRelation),
      study_method: getMethodFromRelation(
        session.study_method as StudyMethodRelation
      ),
    })) ?? []

  return (
    <StudySessionClient
      userId={user.id}
      cycles={cycles ?? []}
      studyMethods={studyMethods ?? []}
      currentCycleId={effectiveCurrentCycleId}
      recentSessions={normalizedRecentSessions}
    />
  )
}