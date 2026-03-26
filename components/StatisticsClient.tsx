'use client'

import { useMemo, useState } from 'react'

type SessionItem = {
  id: number
  duration_seconds: number
  created_at: string
  discipline: string
  study_method: string
}

type Props = {
  sessions: SessionItem[]
}

type PeriodFilter = 'today' | '7days' | '30days' | 'all'

export default function StatisticsClient({ sessions }: Props) {
  const [period, setPeriod] = useState<PeriodFilter>('all')

  const filteredSessions = useMemo(() => {
    if (period === 'all') return sessions

    const now = new Date()

    return sessions.filter((session) => {
      const sessionDate = new Date(session.created_at)

      if (period === 'today') {
        return (
          sessionDate.getFullYear() === now.getFullYear() &&
          sessionDate.getMonth() === now.getMonth() &&
          sessionDate.getDate() === now.getDate()
        )
      }

      const diffMs = now.getTime() - sessionDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      if (period === '7days') return diffDays <= 7
      if (period === '30days') return diffDays <= 30

      return true
    })
  }, [sessions, period])

  const totalSeconds = useMemo(() => {
    return filteredSessions.reduce((sum, session) => sum + session.duration_seconds, 0)
  }, [filteredSessions])

  const totalSessions = filteredSessions.length

  const statsByDiscipline = useMemo(() => {
    const map = new Map<string, number>()

    for (const session of filteredSessions) {
      map.set(
        session.discipline,
        (map.get(session.discipline) ?? 0) + session.duration_seconds
      )
    }

    return Array.from(map.entries())
      .map(([discipline, seconds]) => ({
        discipline,
        seconds,
      }))
      .sort((a, b) => b.seconds - a.seconds)
  }, [filteredSessions])

  const statsByMethod = useMemo(() => {
    const map = new Map<string, number>()

    for (const session of filteredSessions) {
      map.set(
        session.study_method,
        (map.get(session.study_method) ?? 0) + session.duration_seconds
      )
    }

    return Array.from(map.entries())
      .map(([method, seconds]) => ({
        method,
        seconds,
      }))
      .sort((a, b) => b.seconds - a.seconds)
  }, [filteredSessions])

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remaining = seconds % 60

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(remaining).padStart(2, '0')}s`
    }

    return `${minutes}m ${String(remaining).padStart(2, '0')}s`
  }

  function getPeriodLabel() {
    if (period === 'today') return 'Hoje'
    if (period === '7days') return 'Últimos 7 dias'
    if (period === '30days') return 'Últimos 30 dias'
    return 'Todo o período'
  }

  return (
    <>
      <h1>Estatísticas</h1>

      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="period"><strong>Período:</strong></label>
        <br />
        <select
          id="period"
          value={period}
          onChange={(event) => setPeriod(event.target.value as PeriodFilter)}
        >
          <option value="today">Hoje</option>
          <option value="7days">Últimos 7 dias</option>
          <option value="30days">Últimos 30 dias</option>
          <option value="all">Todo o período</option>
        </select>
      </div>

      <p>
        <strong>Período selecionado:</strong> {getPeriodLabel()}
      </p>

      <hr style={{ margin: '24px 0' }} />

      <div style={{ marginBottom: '24px' }}>
        <h2>Resumo geral</h2>
        <p><strong>Total estudado:</strong> {formatDuration(totalSeconds)}</p>
        <p><strong>Total de sessões:</strong> {totalSessions}</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2>Tempo por disciplina</h2>

        {statsByDiscipline.length === 0 ? (
          <p>Nenhuma sessão no período selecionado.</p>
        ) : (
          <ul>
            {statsByDiscipline.map((item) => (
              <li key={item.discipline}>
                {item.discipline}: {formatDuration(item.seconds)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Tempo por método de estudo</h2>

        {statsByMethod.length === 0 ? (
          <p>Nenhuma sessão no período selecionado.</p>
        ) : (
          <ul>
            {statsByMethod.map((item) => (
              <li key={item.method}>
                {item.method}: {formatDuration(item.seconds)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}