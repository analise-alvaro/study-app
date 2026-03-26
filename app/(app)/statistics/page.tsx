'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock3,
  Flame,
  Layers3,
  TrendingUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type PeriodFilter = '7d' | '30d' | '90d' | 'month' | 'year' | 'all'

type StudySession = {
  session_id: number
  user_id: string
  cycle_id: number
  discipline: string
  position: number
  study_color_id: number | null
  color_name: string | null
  color_hex: string | null
  study_method_id: number | null
  study_method_name: string | null
  duration_seconds: number
  session_date: string
  created_at: string
}

type DailyStats = {
  date: string
  totalSeconds: number
}

type DisciplineStats = {
  discipline: string
  totalSeconds: number
  colorHex: string | null
}

type MethodStats = {
  method: string
  totalSeconds: number
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return '0min'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`

  return `${hours}h ${minutes}min`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function getStartDate(period: PeriodFilter) {
  const now = new Date()

  switch (period) {
    case '7d': {
      const date = new Date()
      date.setDate(now.getDate() - 7)
      return date
    }
    case '30d': {
      const date = new Date()
      date.setDate(now.getDate() - 30)
      return date
    }
    case '90d': {
      const date = new Date()
      date.setDate(now.getDate() - 90)
      return date
    }
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'year':
      return new Date(now.getFullYear(), 0, 1)
    case 'all':
    default:
      return null
  }
}

export default function StatisticsPage() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [period, setPeriod] = useState<PeriodFilter>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSessions() {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setSessions([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('study_sessions_view')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: true })

      if (error) {
        console.error('Erro ao buscar estatísticas:', error)
        setSessions([])
      } else {
        setSessions((data as StudySession[]) || [])
      }

      setLoading(false)
    }

    loadSessions()
  }, [])

  const filteredSessions = useMemo(() => {
    const startDate = getStartDate(period)
    if (!startDate) return sessions

    return sessions.filter((session) => new Date(session.session_date) >= startDate)
  }, [sessions, period])

  const totalSeconds = useMemo(() => {
    return filteredSessions.reduce((acc, session) => acc + (session.duration_seconds || 0), 0)
  }, [filteredSessions])

  const totalSessions = filteredSessions.length

  const dailyAverage = useMemo(() => {
    if (!filteredSessions.length) return 0

    const uniqueDays = new Set(
      filteredSessions.map((session) =>
        new Date(session.session_date).toISOString().slice(0, 10)
      )
    )

    if (uniqueDays.size === 0) return 0
    return Math.floor(totalSeconds / uniqueDays.size)
  }, [filteredSessions, totalSeconds])

  const dailyStats = useMemo<DailyStats[]>(() => {
    const map = new Map<string, number>()

    filteredSessions.forEach((session) => {
      const dateKey = new Date(session.session_date).toISOString().slice(0, 10)
      map.set(dateKey, (map.get(dateKey) || 0) + (session.duration_seconds || 0))
    })

    return Array.from(map.entries())
      .map(([date, totalSeconds]) => ({ date, totalSeconds }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredSessions])

  const disciplineStats = useMemo<DisciplineStats[]>(() => {
    const map = new Map<string, { totalSeconds: number; colorHex: string | null }>()

    filteredSessions.forEach((session) => {
      const current = map.get(session.discipline) || {
        totalSeconds: 0,
        colorHex: session.color_hex || null,
      }

      map.set(session.discipline, {
        totalSeconds: current.totalSeconds + (session.duration_seconds || 0),
        colorHex: current.colorHex || session.color_hex || null,
      })
    })

    return Array.from(map.entries())
      .map(([discipline, values]) => ({
        discipline,
        totalSeconds: values.totalSeconds,
        colorHex: values.colorHex,
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
  }, [filteredSessions])

  const methodStats = useMemo<MethodStats[]>(() => {
    const map = new Map<string, number>()

    filteredSessions.forEach((session) => {
      const method = session.study_method_name || 'Não informado'
      map.set(method, (map.get(method) || 0) + (session.duration_seconds || 0))
    })

    return Array.from(map.entries())
      .map(([method, totalSeconds]) => ({ method, totalSeconds }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
  }, [filteredSessions])

  const topDiscipline = disciplineStats[0]?.discipline || '—'

  const bestDay = useMemo(() => {
    if (!dailyStats.length) return null
    return [...dailyStats].sort((a, b) => b.totalSeconds - a.totalSeconds)[0]
  }, [dailyStats])

  const maxDailySeconds = Math.max(...dailyStats.map((d) => d.totalSeconds), 1)
  const maxDisciplineSeconds = Math.max(...disciplineStats.map((d) => d.totalSeconds), 1)
  const maxMethodSeconds = Math.max(...methodStats.map((m) => m.totalSeconds), 1)

  const periodOptions: { label: string; value: PeriodFilter }[] = [
    { label: '7 dias', value: '7d' },
    { label: '30 dias', value: '30d' },
    { label: '90 dias', value: '90d' },
    { label: 'Mês', value: 'month' },
    { label: 'Ano', value: 'year' },
    { label: 'Tudo', value: 'all' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#04aa6d]">
            <BarChart3 className="h-4 w-4" />
            Estatísticas
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Desempenho dos estudos
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Acompanhe consistência, tempo acumulado, disciplinas e métodos de estudo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => {
            const active = period === option.value

            return (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-[#04aa6d] text-white shadow-sm'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
          Carregando estatísticas...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Clock3 className="h-5 w-5" />}
              title="Tempo total estudado"
              value={formatDuration(totalSeconds)}
              subtitle="Soma do período selecionado"
              tone="green"
            />
            <StatCard
              icon={<Layers3 className="h-5 w-5" />}
              title="Sessões concluídas"
              value={String(totalSessions)}
              subtitle="Quantidade de registros"
              tone="orange"
            />
            <StatCard
              icon={<CalendarDays className="h-5 w-5" />}
              title="Média por dia"
              value={formatDuration(dailyAverage)}
              subtitle="Somente dias com estudo"
              tone="default"
            />
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Disciplina mais estudada"
              value={topDiscipline}
              subtitle="Maior tempo acumulado"
              tone="green"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-[#04aa6d] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Evolução por dia</h2>
                  <p className="text-sm text-slate-500">
                    Quanto tempo você estudou em cada dia.
                  </p>
                </div>
              </div>

              {dailyStats.length === 0 ? (
                <EmptyState text="Nenhum estudo encontrado nesse período." className="mt-6" />
              ) : (
                <div className="mt-6 space-y-4">
                  {dailyStats.map((day) => {
                    const width = Math.max((day.totalSeconds / maxDailySeconds) * 100, 4)

                    return (
                      <div key={day.date}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-600">{formatDate(day.date)}</span>
                          <span className="font-semibold text-slate-900">
                            {formatDuration(day.totalSeconds)}
                          </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-200">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-[#04aa6d] to-orange-400 transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-orange-200 bg-orange-100/90 p-5 shadow-[0_18px_40px_rgba(251,146,60,0.18)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/70 p-3 text-orange-500 shadow-sm">
                  <Flame className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Consistência</h2>
                  <p className="text-sm text-slate-600">
                    Resumo do seu ritmo de estudos.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-orange-200 bg-white/70 p-5 shadow-inner">
                <div className="space-y-4">
                  <InfoRow label="Dias estudados" value={String(dailyStats.length)} />
                  <InfoRow
                    label="Melhor dia"
                    value={bestDay ? formatDate(bestDay.date) : '—'}
                  />
                  <InfoRow
                    label="Tempo no melhor dia"
                    value={bestDay ? formatDuration(bestDay.totalSeconds) : '—'}
                  />
                  <InfoRow label="Sessões no período" value={String(totalSessions)} />
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-emerald-200 bg-emerald-100/85 p-5 shadow-[0_18px_40px_rgba(16,185,129,0.14)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/70 p-3 text-[#04aa6d] shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-emerald-950">
                    Tempo por disciplina
                  </h2>
                  <p className="text-sm text-emerald-800/80">
                    Ranking das matérias mais estudadas.
                  </p>
                </div>
              </div>

              {disciplineStats.length === 0 ? (
                <EmptyState
                  text="Sem disciplinas registradas nesse período."
                  className="mt-6 border-emerald-200 bg-white/60 text-emerald-900"
                />
              ) : (
                <div className="mt-6 space-y-5">
                  {disciplineStats.map((item) => {
                    const width = Math.max((item.totalSeconds / maxDisciplineSeconds) * 100, 4)

                    return (
                      <div key={item.discipline}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full shadow-sm"
                              style={{ backgroundColor: item.colorHex || '#10B981' }}
                            />
                            <span className="text-sm font-medium text-emerald-950">
                              {item.discipline}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-emerald-950">
                            {formatDuration(item.totalSeconds)}
                          </span>
                        </div>

                        <div className="h-3 w-full rounded-full bg-emerald-200/70">
                          <div
                            className="h-3 rounded-full transition-all"
                            style={{
                              width: `${width}%`,
                              backgroundColor: item.colorHex || '#10B981',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                  <Layers3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Métodos de estudo</h2>
                  <p className="text-sm text-slate-500">
                    Distribuição do seu tempo por tipo de estudo.
                  </p>
                </div>
              </div>

              {methodStats.length === 0 ? (
                <EmptyState text="Sem métodos registrados nesse período." />
              ) : (
                <div className="grid gap-4">
                  {methodStats.map((item) => {
                    const width = Math.max((item.totalSeconds / maxMethodSeconds) * 100, 4)

                    return (
                      <div
                        key={item.method}
                        className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm"
                      >
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-slate-900">
                            {item.method}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            {formatDuration(item.totalSeconds)}
                          </span>
                        </div>

                        <div className="h-3 w-full rounded-full bg-slate-200">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-orange-300 to-orange-500 transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  tone = 'default',
}: {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  tone?: 'default' | 'green' | 'orange'
}) {
  const toneClasses =
    tone === 'green'
      ? 'border-emerald-200 bg-emerald-100/85 shadow-[0_18px_40px_rgba(16,185,129,0.14)]'
      : tone === 'orange'
      ? 'border-orange-200 bg-orange-100/90 shadow-[0_18px_40px_rgba(251,146,60,0.18)]'
      : 'border-white/70 bg-white/85 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm'

  return (
    <div className={`rounded-3xl p-5 ${toneClasses}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/70 p-3 text-slate-700 shadow-sm">
          {icon}
        </div>
        <p className="text-sm text-slate-600">{title}</p>
      </div>

      <p className="mt-5 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-orange-200 pb-3 last:border-none last:pb-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  )
}

function EmptyState({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm ${className}`}
    >
      {text}
    </div>
  )
}