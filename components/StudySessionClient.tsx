'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock3,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  TimerReset,
  Trash2,
  History,
  Target,
  CircleAlert,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type CycleItem = {
  id: number
  discipline: string
  position: number
}

type StudyMethod = {
  id: number
  name: string
}

type RecentSession = {
  id: number
  created_at: string
  duration_seconds: number
  discipline: string
  study_method: string
}

type Props = {
  userId: string
  cycles: CycleItem[]
  studyMethods: StudyMethod[]
  currentCycleId: number | null
  recentSessions: RecentSession[]
}

export default function StudySessionClient({
  userId,
  cycles,
  studyMethods,
  currentCycleId,
  recentSessions,
}: Props) {
  const router = useRouter()

  const defaultDurationMinutes = 25
  const defaultDurationSeconds = defaultDurationMinutes * 60

  const [selectedCycleId, setSelectedCycleId] = useState(() => {
    if (currentCycleId) return String(currentCycleId)
    if (cycles.length > 0) return String(cycles[0].id)
    return ''
  })

  const [selectedMethodId, setSelectedMethodId] = useState(
    studyMethods.length > 0 ? String(studyMethods[0].id) : ''
  )

  const [durationInput, setDurationInput] = useState(String(defaultDurationMinutes))
  const [configuredDuration, setConfiguredDuration] = useState(defaultDurationSeconds)
  const [remainingSeconds, setRemainingSeconds] = useState(defaultDurationSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAdvancingCycle, setIsAdvancingCycle] = useState(false)
  const [isSettingCurrentCycle, setIsSettingCurrentCycle] = useState(false)
  const [message, setMessage] = useState('')

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasSavedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const selectedCycle = cycles.find((cycle) => String(cycle.id) === selectedCycleId)
  const currentCycle = cycles.find((cycle) => cycle.id === currentCycleId) ?? null

  const isOutsideCurrentCycle =
    !!selectedCycle && !!currentCycle && selectedCycle.id !== currentCycle.id

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [remainingSeconds])

  const progressPercent = useMemo(() => {
    if (!configuredDuration || configuredDuration <= 0) return 0
    const elapsed = configuredDuration - remainingSeconds
    return Math.min(Math.max((elapsed / configuredDuration) * 100, 0), 100)
  }, [configuredDuration, remainingSeconds])

  const filteredRecentSessions = useMemo(() => {
    if (!currentCycle?.discipline) return []

    return [...recentSessions]
      .filter((session) => session.discipline === currentCycle.discipline)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5)
  }, [recentSessions, currentCycle])

  function clearTimerInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remaining = seconds % 60

    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(remaining).padStart(
        2,
        '0'
      )}s`
    }

    return `${minutes}m ${String(remaining).padStart(2, '0')}s`
  }

  function formatConfiguredDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)

    if (minutes < 60) {
      return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours}h`
    }

    return `${hours}h ${remainingMinutes}min`
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  function handleApplyDuration() {
    if (isRunning || isSaving || isAdvancingCycle || isSettingCurrentCycle) return

    const parsedMinutes = Number(durationInput)

    if (!parsedMinutes || parsedMinutes <= 0) {
      setMessage('Informe uma duração válida em minutos.')
      return
    }

    const parsedDurationInSeconds = parsedMinutes * 60

    setConfiguredDuration(parsedDurationInSeconds)
    setRemainingSeconds(parsedDurationInSeconds)
    hasSavedRef.current = false
    setMessage(`Tempo configurado para ${parsedMinutes} minuto(s).`)
  }

  function handleStart() {
    if (!selectedCycleId || !selectedMethodId) {
      setMessage('Selecione uma disciplina e um método de estudo.')
      return
    }

    if (remainingSeconds <= 0) {
      setMessage('Clique em Aplicar ou Resetar antes de iniciar novamente.')
      return
    }

    setMessage('')
    setIsRunning(true)
  }

  function handlePause() {
    setIsRunning(false)
  }

  function handleReset() {
    setIsRunning(false)
    clearTimerInterval()
    hasSavedRef.current = false
    setRemainingSeconds(configuredDuration)
    setMessage('Timer resetado.')
  }

  async function handleAdvanceCycle() {
    if (cycles.length === 0) return

    setIsAdvancingCycle(true)
    setMessage('')

    const activeCycle = currentCycle ?? cycles[0]
    const currentIndex = cycles.findIndex((cycle) => cycle.id === activeCycle.id)

    if (currentIndex === -1) {
      setMessage('Não foi possível identificar a disciplina atual do ciclo.')
      setIsAdvancingCycle(false)
      return
    }

    const nextIndex = (currentIndex + 1) % cycles.length
    const nextCycle = cycles[nextIndex]

    const { error } = await supabase
      .from('profiles')
      .update({
        current_cycle_id: nextCycle.id,
      })
      .eq('id', userId)

    if (error) {
      setMessage(`Erro ao avançar o ciclo: ${error.message}`)
      setIsAdvancingCycle(false)
      return
    }

    setSelectedCycleId(String(nextCycle.id))
    setMessage(`Ciclo avançado para: ${nextCycle.discipline}`)
    setIsAdvancingCycle(false)
    router.refresh()
  }

  async function handleSetSelectedAsCurrentCycle() {
    if (!selectedCycle) return

    setIsSettingCurrentCycle(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        current_cycle_id: selectedCycle.id,
      })
      .eq('id', userId)

    if (error) {
      setMessage(`Erro ao atualizar disciplina atual do ciclo: ${error.message}`)
      setIsSettingCurrentCycle(false)
      return
    }

    setMessage(`Disciplina atual do ciclo definida como: ${selectedCycle.discipline}`)
    setIsSettingCurrentCycle(false)
    router.refresh()
  }

  async function handleDeleteSession(sessionId: number) {
    const confirmed = confirm('Tem certeza que deseja excluir esta sessão?')
    if (!confirmed) return

    setMessage('Excluindo sessão...')

    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) {
      setMessage(`Erro ao excluir sessão: ${error.message}`)
      return
    }

    setMessage('Sessão excluída com sucesso.')
    router.refresh()
  }

  useEffect(() => {
    if (!isRunning) {
      clearTimerInterval()
      return
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearTimerInterval()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearTimerInterval()
  }, [isRunning])

  useEffect(() => {
    async function saveStudySession() {
      if (remainingSeconds !== 0) return
      if (hasSavedRef.current) return

      hasSavedRef.current = true
      setIsRunning(false)
      setIsSaving(true)

      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          await audioRef.current.play()
        }
      } catch (error) {
        console.error('Não foi possível reproduzir o áudio:', error)
      }

      setMessage('Timer finalizado. Salvando sessão...')

      const { error } = await supabase.from('study_sessions').insert({
        user_id: userId,
        cycle_id: Number(selectedCycleId),
        study_method_id: Number(selectedMethodId),
        duration_seconds: configuredDuration,
      })

      if (error) {
        setMessage(`Erro ao salvar sessão: ${error.message}`)
        setIsSaving(false)
        return
      }

      setMessage('Sessão de estudo salva com sucesso.')
      setIsSaving(false)
      router.refresh()
    }

    saveStudySession()
  }, [remainingSeconds, configuredDuration, selectedCycleId, selectedMethodId, userId, router])

  const disabledAction = isSaving || isAdvancingCycle || isSettingCurrentCycle

  return (
    <div className="space-y-8">
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#04aa6d]">
            <Clock3 className="h-4 w-4" />
            Sessão de estudo
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Configure o tempo, registre a disciplina e acompanhe seu histórico recente.
          </p>
        </div>

        {cycles.length > 0 && (
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="bg-white/85 px-4 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Disciplina atual do ciclo
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {currentCycle?.discipline ?? cycles[0]?.discipline ?? 'Não definida'}
                </p>
              </div>

              <div className=" bg-white/85 px-4 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duração configurada
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatConfiguredDuration(configuredDuration)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdvanceCycle}
              disabled={isRunning || disabledAction}
              //className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 md:self-center"
            >
              <ArrowRight className="h-4 w-4 text-orange-500" />
              {isAdvancingCycle ? 'Avançando...' : 'Avançar para próxima disciplina'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {cycles.length === 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h2 className="text-lg font-semibold text-amber-900">Nenhuma disciplina cadastrada</h2>
              <p className="mt-2 text-sm text-amber-800">
                Você precisa cadastrar pelo menos uma disciplina no ciclo antes de iniciar
                uma sessão.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
            <section className="bg-emerald-100/85 p-5 shadow-[0_18px_40px_rgba(16,185,129,0.14)]">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-emerald-800/80">
                    Escolha a disciplina, o método e o tempo da sessão.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5">
                <div>
                  <label
                    htmlFor="cycle"
                    className="mb-2 block text-sm font-bold text-emerald-950"
                  >
                    Disciplina da sessão
                  </label>
                  <select
                    id="cycle"
                    value={selectedCycleId}
                    onChange={(event) => setSelectedCycleId(event.target.value)}
                    disabled={isRunning || disabledAction}
                    className="w-full rounded-2xl border border-emerald-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#04aa6d] focus:ring-2 focus:ring-emerald-200"
                  >
                    {cycles.map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>
                        {cycle.position} - {cycle.discipline}
                      </option>
                    ))}
                  </select>

                  {isOutsideCurrentCycle && (
                    <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                      <p className="text-sm text-orange-900">
                        Você está registrando uma sessão fora da disciplina atual do ciclo.
                      </p>

                      <button
                        type="button"
                        onClick={handleSetSelectedAsCurrentCycle}
                        disabled={isRunning || disabledAction}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-orange-800 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <BookOpen className="h-4 w-4" />
                        {isSettingCurrentCycle
                          ? 'Atualizando...'
                          : 'Definir como disciplina atual do ciclo'}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="method"
                    className="mb-2 block text-sm font-bold text-emerald-950"
                  >
                    Método de estudo
                  </label>
                  <select
                    id="method"
                    value={selectedMethodId}
                    onChange={(event) => setSelectedMethodId(event.target.value)}
                    disabled={isRunning || disabledAction}
                    className="w-full rounded-2xl border border-emerald-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#04aa6d] focus:ring-2 focus:ring-emerald-200"
                  >
                    {studyMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="mb-2 block text-sm font-medium text-emerald-800"
                  >
                    Duração da sessão (minutos)
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      id="duration"
                      type="number"
                      min="1"
                      value={durationInput}
                      onChange={(event) => setDurationInput(event.target.value)}
                      disabled={isRunning || disabledAction}
                      className="w-full rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#04aa6d] focus:ring-2 focus:ring-emerald-100"
                    />

                    <button
                      type="button"
                      onClick={handleApplyDuration}
                      disabled={isRunning || disabledAction}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <TimerReset className="h-4 w-4 text-orange-300" />
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className=" bg-orange-100/90 p-5 shadow-[0_18px_40px_rgba(251,146,60,0.18)]">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-orange-500 shadow-sm">
                  <Clock3 className="h-7 w-7" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-slate-900">Timer</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Mantenha o foco até o final da sessão.
                </p>

                <div className="mt-6 rounded-[2rem] border border-orange-200 bg-white/70 px-6 py-8 shadow-inner">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Tempo restante
                  </p>
                  <p className="mt-4 text-6xl font-bold tracking-tight text-slate-900 sm:text-7xl">
                    {formattedTime}
                  </p>

                  <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-orange-200">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#04aa6d] to-orange-400 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {Math.round(progressPercent)}% concluído
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    onClick={handleStart}
                    disabled={isRunning || disabledAction}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#04aa6d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#059862] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar
                  </button>

                  <button
                    onClick={handlePause}
                    disabled={!isRunning || disabledAction}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Pause className="h-4 w-4 text-orange-500" />
                    Pausar
                  </button>

                  <button
                    onClick={handleReset}
                    disabled={disabledAction}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RotateCcw className="h-4 w-4 text-orange-500" />
                    Resetar
                  </button>
                </div>
              </div>
            </section>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
                <History className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">Histórico recente da disciplina atual</h2>
                <p className="text-sm text-slate-500">
                  Últimas sessões da disciplina atual do ciclo.
                </p>
              </div>
            </div>

            {filteredRecentSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
                Nenhuma sessão recente encontrada para a disciplina atual do ciclo.
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredRecentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 border border-white/70 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="grid gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {session.discipline}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>{formatDate(session.created_at)}</span>
                        <span>•</span>
                        <span>{formatTime(session.created_at)}</span>
                        <span>•</span>
                        <span>{session.study_method}</span>
                        <span>•</span>
                        <span>{formatDuration(session.duration_seconds)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 md:self-center"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}