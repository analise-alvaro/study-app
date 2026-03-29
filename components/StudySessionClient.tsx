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
  session_date: string
  duration_seconds: number
  cycle_id: number | null
  study_method_id: number | null
  session_note: string
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

type MessageType = 'success' | 'error' | 'info'

const STUDY_DURATION_STORAGE_KEY = 'study_duration_minutes'
const DEFAULT_DURATION_MINUTES = 25
const DEFAULT_DURATION_SECONDS = DEFAULT_DURATION_MINUTES * 60

export default function StudySessionClient({
  userId,
  cycles,
  studyMethods,
  currentCycleId,
  recentSessions,
}: Props) {
  const router = useRouter()

  const [selectedCycleId, setSelectedCycleId] = useState(() => {
    if (currentCycleId) return String(currentCycleId)
    if (cycles.length > 0) return String(cycles[0].id)
    return ''
  })

  const [selectedMethodId, setSelectedMethodId] = useState(
    studyMethods.length > 0 ? String(studyMethods[0].id) : ''
  )

  const [durationInput, setDurationInput] = useState(String(DEFAULT_DURATION_MINUTES))
  const [configuredDuration, setConfiguredDuration] = useState(DEFAULT_DURATION_SECONDS)
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_DURATION_SECONDS)
  const [hasHydratedDuration, setHasHydratedDuration] = useState(false)

  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAdvancingCycle, setIsAdvancingCycle] = useState(false)
  const [isSettingCurrentCycle, setIsSettingCurrentCycle] = useState(false)
  const [effectiveCurrentCycleId, setEffectiveCurrentCycleId] = useState<number | null>(
    currentCycleId
  )
  const [isReadyToSave, setIsReadyToSave] = useState(false)
  const [sessionNote, setSessionNote] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('info')
  const [savePromptMessage, setSavePromptMessage] = useState('')
  const [savePromptType, setSavePromptType] = useState<MessageType>('info')

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasCompletedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const selectedCycle = cycles.find((cycle) => String(cycle.id) === selectedCycleId)
  const currentCycle =
    cycles.find((cycle) => cycle.id === effectiveCurrentCycleId) ?? null

  const referenceCycleId = currentCycle?.id ?? cycles[0]?.id ?? null

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
    if (!referenceCycleId) return []

    return [...recentSessions]
      .filter((session) => session.cycle_id === referenceCycleId)
      .sort(
        (a, b) =>
          new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
      )
      .slice(0, 5)
  }, [recentSessions, referenceCycleId])

  function clearTimerInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function setFeedback(text: string, type: MessageType = 'info') {
    setMessage(text)
    setMessageType(type)
  }

  function setSavePrompt(text: string, type: MessageType = 'info') {
    setSavePromptMessage(text)
    setSavePromptType(type)
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
      setFeedback('Informe uma duração válida em minutos.', 'error')
      return
    }

    const parsedDurationInSeconds = parsedMinutes * 60

    localStorage.setItem(STUDY_DURATION_STORAGE_KEY, String(parsedMinutes))

    setConfiguredDuration(parsedDurationInSeconds)
    setRemainingSeconds(parsedDurationInSeconds)
    setIsReadyToSave(false)
    hasCompletedRef.current = false
    setSessionNote('')
    setSavePrompt('', 'info')
    setFeedback(`Tempo configurado para ${parsedMinutes} minuto(s).`, 'success')
  }

  function handleStart() {
    if (!selectedCycleId || !selectedMethodId) {
      setFeedback('Selecione uma disciplina e um método de estudo.', 'error')
      return
    }

    if (isReadyToSave) {
      setSavePrompt(
        'A sessão terminou. Agora informe onde você parou e clique em salvar sessão.',
        'info'
      )
      return
    }

    if (remainingSeconds <= 0) {
      setFeedback('Clique em Aplicar ou Resetar antes de iniciar novamente.', 'error')
      return
    }

    setFeedback('', 'info')
    setSavePrompt('', 'info')
    setIsRunning(true)
  }

  function handlePause() {
    setIsRunning(false)
  }

  function handleReset() {
    setIsRunning(false)
    clearTimerInterval()
    hasCompletedRef.current = false
    setIsReadyToSave(false)
    setSessionNote('')
    setSavePrompt('', 'info')
    setRemainingSeconds(configuredDuration)
    setFeedback('Timer resetado.', 'success')
  }

  async function handleAdvanceCycle() {
    if (cycles.length === 0) return

    setIsAdvancingCycle(true)
    setFeedback('', 'info')

    const activeCycle = currentCycle ?? cycles[0]
    const currentIndex = cycles.findIndex((cycle) => cycle.id === activeCycle.id)

    if (currentIndex === -1) {
      setFeedback('Não foi possível identificar a disciplina atual do ciclo.', 'error')
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
      setFeedback(`Erro ao avançar o ciclo: ${error.message}`, 'error')
      setIsAdvancingCycle(false)
      return
    }

    setSelectedCycleId(String(nextCycle.id))
    setEffectiveCurrentCycleId(nextCycle.id)
    setFeedback(`Ciclo avançado para: ${nextCycle.discipline}`, 'success')
    setIsAdvancingCycle(false)
    router.refresh()
  }

  async function handleSetSelectedAsCurrentCycle() {
    if (!selectedCycle) return

    setIsSettingCurrentCycle(true)
    setFeedback('', 'info')

    const { error } = await supabase
      .from('profiles')
      .update({
        current_cycle_id: selectedCycle.id,
      })
      .eq('id', userId)

    if (error) {
      setFeedback(`Erro ao atualizar disciplina atual do ciclo: ${error.message}`, 'error')
      setIsSettingCurrentCycle(false)
      return
    }

    setEffectiveCurrentCycleId(selectedCycle.id)
    setFeedback(
      `Disciplina atual do ciclo definida como: ${selectedCycle.discipline}`,
      'success'
    )
    setIsSettingCurrentCycle(false)
    router.refresh()
  }

  async function handleDeleteSession(sessionId: number) {
    const confirmed = confirm('Tem certeza que deseja excluir esta sessão?')
    if (!confirmed) return

    setFeedback('Excluindo sessão...', 'info')

    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) {
      setFeedback(`Erro ao excluir sessão: ${error.message}`, 'error')
      return
    }

    setFeedback('Sessão excluída com sucesso.', 'success')
    router.refresh()
  }

  async function handleSaveCompletedSession() {
    if (!selectedCycleId || !selectedMethodId) {
      setFeedback('Selecione uma disciplina e um método de estudo.', 'error')
      return
    }

    if (!sessionNote.trim()) {
      setSavePrompt(
        'Sessão concluída. Escreva a observação antes de salvar a sessão.',
        'error'
      )
      return
    }

    setIsSaving(true)
    setSavePrompt('Salvando sessão...', 'info')

    const { error } = await supabase.from('study_sessions').insert({
      user_id: userId,
      cycle_id: Number(selectedCycleId),
      study_method_id: Number(selectedMethodId),
      duration_seconds: configuredDuration,
      session_note: sessionNote.trim(),
    })

    if (error) {
      setSavePrompt(`Erro ao salvar sessão: ${error.message}`, 'error')
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    setIsReadyToSave(false)
    setSessionNote('')
    setSavePrompt('', 'info')
    setFeedback('Sessão de estudo salva com sucesso.', 'success')
    router.refresh()
  }

  useEffect(() => {
    const savedDuration = localStorage.getItem(STUDY_DURATION_STORAGE_KEY)
    const savedMinutes = Number(savedDuration)

    if (savedDuration && Number.isFinite(savedMinutes) && savedMinutes > 0) {
      const savedDurationInSeconds = savedMinutes * 60

      setDurationInput(String(savedMinutes))
      setConfiguredDuration(savedDurationInSeconds)
      setRemainingSeconds(savedDurationInSeconds)
    }

    setHasHydratedDuration(true)
  }, [])

  useEffect(() => {
    setEffectiveCurrentCycleId(currentCycleId)
  }, [currentCycleId])

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
    async function prepareCompletedSession() {
      if (remainingSeconds !== 0) return
      if (hasCompletedRef.current) return

      hasCompletedRef.current = true
      setIsRunning(false)
      setIsReadyToSave(true)

      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          await audioRef.current.play()
        }
      } catch (error) {
        console.error('Não foi possível reproduzir o áudio:', error)
      }

      setSavePrompt(
        'Sessão concluída. Agora informe onde você parou e clique em salvar sessão.',
        'success'
      )
    }

    prepareCompletedSession()
  }, [remainingSeconds])

  const disabledAction = isSaving || isAdvancingCycle || isSettingCurrentCycle

  const messageStyles =
    messageType === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : messageType === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-blue-200 bg-blue-50 text-blue-800'

  const savePromptStyles =
    savePromptType === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : savePromptType === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-blue-200 bg-blue-50 text-blue-800'

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

              <div className="bg-white/85 px-4 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duração configurada
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatConfiguredDuration(
                    hasHydratedDuration ? configuredDuration : DEFAULT_DURATION_SECONDS
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdvanceCycle}
              disabled={isRunning || disabledAction || isReadyToSave}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 md:self-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowRight className="h-4 w-4 text-orange-500" />
              {isAdvancingCycle ? 'Avançando...' : 'Avançar para próxima disciplina'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${messageStyles}`}
        >
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
                    Escolha a disciplina, o método, o tempo e registre onde você parou.
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
                    disabled={isRunning || disabledAction || isReadyToSave}
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
                        disabled={isRunning || disabledAction || isReadyToSave}
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
                    disabled={isRunning || disabledAction || isReadyToSave}
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
                      disabled={isRunning || disabledAction || isReadyToSave}
                      className="w-full rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#04aa6d] focus:ring-2 focus:ring-emerald-100"
                    />

                    <button
                      type="button"
                      onClick={handleApplyDuration}
                      disabled={isRunning || disabledAction || isReadyToSave}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <TimerReset className="h-4 w-4 text-orange-300" />
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-orange-100/90 p-5 shadow-[0_18px_40px_rgba(251,146,60,0.18)]">
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

                <div className="mt-5 text-left">
                  <label
                    htmlFor="sessionNote"
                    className="mb-2 block text-sm font-bold text-slate-900"
                  >
                    Observação da sessão
                  </label>

                  <textarea
                    id="sessionNote"
                    value={sessionNote}
                    onChange={(event) => setSessionNote(event.target.value)}
                    placeholder="Ex.: Videoaula 12, parei em 18:43 / PDF de Tributário, página 37 / Livro X, capítulo 3"
                    rows={4}
                    disabled={disabledAction}
                    className="w-full rounded-2xl border border-orange-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-2 text-xs text-slate-600">
                    Ao terminar a sessão, informe exatamente onde você parou.
                  </p>
                </div>

                {isReadyToSave && savePromptMessage && (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-left ${savePromptStyles}`}
                  >
                    <p className="text-sm font-semibold">Sessão concluída</p>
                    <p className="mt-1 text-sm">{savePromptMessage}</p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={handleSaveCompletedSession}
                    disabled={!isReadyToSave || disabledAction}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSaving ? 'Salvando...' : 'Salvar sessão'}
                  </button>

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
                <h2 className="text-lg font-semibold text-slate-900">
                  Histórico recente da disciplina atual
                </h2>
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
                        <span>{formatDate(session.session_date)}</span>
                        <span>•</span>
                        <span>{formatTime(session.session_date)}</span>
                        <span>•</span>
                        <span>{session.study_method}</span>
                        <span>•</span>
                        <span>{formatDuration(session.duration_seconds)}</span>
                      </div>

                      {session.session_note && (
                        <div className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 shadow-sm">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                            Observação da sessão
                          </p>
                          <p className="mt-2 text-base font-bold leading-relaxed text-slate-900">
                            {session.session_note}
                          </p>
                        </div>
                      )}
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