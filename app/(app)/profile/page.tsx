import AppUsageGuide from '@/components/AppUsageGuide'
import { createSupabaseServerClient } from '@/lib/supabase/server'

type StudyColorRelation =
  | {
      name: string
      hex_value: string
    }
  | {
      name: string
      hex_value: string
    }[]
  | null

type CycleItem = {
  id: number
  discipline: string
  position: number
  study_color_id: number | null
  study_colors: StudyColorRelation
}

function getStudyColor(studyColors: StudyColorRelation) {
  if (!studyColors) return null
  return Array.isArray(studyColors) ? studyColors[0] ?? null : studyColors
}

function buildDonutGradient(cycles: CycleItem[]) {
  if (!cycles.length) {
    return 'conic-gradient(#e5e7eb 0deg 360deg)'
  }

  const sliceSize = 360 / cycles.length
  let currentDeg = 0

  const parts = cycles.map((cycle) => {
    const start = currentDeg
    const end = currentDeg + sliceSize
    currentDeg = end

    const color = getStudyColor(cycle.study_colors)?.hex_value || '#94a3b8'
    return `${color} ${start}deg ${end}deg`
  })

  return `conic-gradient(${parts.join(', ')})`
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, email')
    .eq('id', user!.id)
    .single()

  const { data: cycles } = await supabase
    .from('cycles')
    .select(`
      id,
      discipline,
      position,
      study_color_id,
      study_colors (
        name,
        hex_value
      )
    `)
    .eq('user_id', user!.id)
    .order('position', { ascending: true })

  const cycleList = (cycles || []) as unknown as CycleItem[]
  const donutBackground = buildDonutGradient(cycleList)

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-[#04aa6d]">Perfil</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Informações do usuário
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Visualize seus dados e a composição atual do seu ciclo de estudos.
        </p>
      </div>

      <AppUsageGuide compact />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="bg-white/85 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Dados do perfil
          </h2>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Username
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {profile?.username || 'Não informado'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                E-mail
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {profile?.email || 'Não informado'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Disciplinas no ciclo
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {cycleList.length}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-emerald-100/85 p-6 shadow-[0_18px_40px_rgba(16,185,129,0.14)]">
          <h2 className="text-lg font-semibold text-emerald-950">
            Ciclo de estudo
          </h2>
          <p className="mt-1 text-sm text-emerald-900/80">
            Representação visual das disciplinas cadastradas no seu ciclo.
          </p>

          {cycleList.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-emerald-300 bg-white/60 p-8 text-center text-sm text-emerald-950">
              Você ainda não cadastrou disciplinas no ciclo.
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr] lg:items-center">
              <div className="flex justify-center">
                <div className="relative h-72 w-72">
                  <div
                    className="h-72 w-72 rounded-full shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                    style={{ background: donutBackground }}
                  />
                  <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-inner">
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Total
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        {cycleList.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {cycleList.map((cycle) => {
                  const resolvedColor = getStudyColor(cycle.study_colors)
                  const color = resolvedColor?.hex_value || '#94a3b8'

                  return (
                    <div
                      key={cycle.id}
                      className="flex items-center gap-3 rounded-2xl bg-white/75 px-4 py-3 shadow-sm"
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {cycle.discipline}
                        </p>
                        <p className="text-xs text-slate-500">
                          Posição {cycle.position}
                          {resolvedColor?.name ? ` • ${resolvedColor.name}` : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}