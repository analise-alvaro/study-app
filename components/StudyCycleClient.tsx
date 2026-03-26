'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  Palette,
  Hash,
  CircleAlert,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type StudyColor = {
  id: number
  name: string
  hex_value: string
}

type StudyColorRelation =
  | {
      id: number
      name: string
      hex_value: string
    }
  | {
      id: number
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

type Props = {
  initialCycles: CycleItem[]
  colors: StudyColor[]
  userId: string
}

function getStudyColor(studyColors: StudyColorRelation) {
  if (!studyColors) return null
  return Array.isArray(studyColors) ? studyColors[0] ?? null : studyColors
}

export default function StudyCycleClient({
  initialCycles,
  colors,
  userId,
}: Props) {
  const router = useRouter()

  const [discipline, setDiscipline] = useState('')
  const [position, setPosition] = useState('')
  const [studyColorId, setStudyColorId] = useState(
    colors.length > 0 ? String(colors[0].id) : ''
  )

  const [loading, setLoading] = useState(false)
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingDiscipline, setEditingDiscipline] = useState('')
  const [editingPosition, setEditingPosition] = useState('')
  const [editingStudyColorId, setEditingStudyColorId] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [message, setMessage] = useState('')

  async function handleCreateCycle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const normalizedDiscipline = discipline.trim()

    if (!normalizedDiscipline) {
      setMessage('Informe o nome da disciplina.')
      setLoading(false)
      return
    }

    if (!position || Number(position) <= 0) {
      setMessage('Informe uma posição válida.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('cycles').insert({
      user_id: userId,
      discipline: normalizedDiscipline,
      position: Number(position),
      study_color_id: Number(studyColorId),
    })

    if (error) {
      if (error.message.includes('cycles_unique_user_position')) {
        setMessage('Essa posição já está sendo usada.')
      } else if (error.message.includes('cycles_unique_user_discipline')) {
        setMessage('Essa disciplina já está cadastrada no seu ciclo.')
      } else {
        setMessage(error.message)
      }

      setLoading(false)
      return
    }

    setDiscipline('')
    setPosition('')
    setStudyColorId(colors.length > 0 ? String(colors[0].id) : '')
    setLoading(false)
    setMessage('Disciplina adicionada com sucesso.')
    router.refresh()
  }

  function handleStartEdit(item: CycleItem) {
    setEditingId(item.id)
    setEditingDiscipline(item.discipline)
    setEditingPosition(String(item.position))
    setEditingStudyColorId(String(item.study_color_id))
    setMessage('')
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditingDiscipline('')
    setEditingPosition('')
    setEditingStudyColorId('')
    setSavingEdit(false)
    setMessage('')
  }

  async function handleSaveEdit(id: number) {
    setSavingEdit(true)
    setMessage('')

    const normalizedDiscipline = editingDiscipline.trim()

    if (!normalizedDiscipline) {
      setMessage('Informe o nome da disciplina.')
      setSavingEdit(false)
      return
    }

    if (!editingPosition || Number(editingPosition) <= 0) {
      setMessage('Informe uma posição válida.')
      setSavingEdit(false)
      return
    }

    const { error } = await supabase
      .from('cycles')
      .update({
        discipline: normalizedDiscipline,
        position: Number(editingPosition),
        study_color_id: Number(editingStudyColorId),
      })
      .eq('id', id)

    if (error) {
      if (error.message.includes('cycles_unique_user_position')) {
        setMessage('Essa posição já está sendo usada.')
      } else if (error.message.includes('cycles_unique_user_discipline')) {
        setMessage('Essa disciplina já está cadastrada no seu ciclo.')
      } else {
        setMessage(`Erro ao editar: ${error.message}`)
      }

      setSavingEdit(false)
      return
    }

    setEditingId(null)
    setEditingDiscipline('')
    setEditingPosition('')
    setEditingStudyColorId('')
    setSavingEdit(false)
    setMessage('Disciplina atualizada com sucesso.')
    router.refresh()
  }

  async function handleDeleteCycle(id: number) {
    const confirmed = window.confirm(
      'Deseja realmente excluir esta disciplina do ciclo?'
    )

    if (!confirmed) return

    setDeleteLoadingId(id)
    setMessage('')

    try {
      const { error } = await supabase.from('cycles').delete().eq('id', id)

      if (error) {
        if (
          error.message.toLowerCase().includes('foreign key') ||
          error.message.toLowerCase().includes('violates')
        ) {
          setMessage(
            'Não é possível excluir esta disciplina porque ela já possui sessões de estudo vinculadas.'
          )
        } else {
          setMessage(`Erro ao excluir: ${error.message}`)
        }

        setDeleteLoadingId(null)
        return
      }

      setMessage('Disciplina excluída com sucesso.')
      setDeleteLoadingId(null)
      router.refresh()
    } catch (error) {
      console.error('Erro inesperado ao excluir disciplina:', error)
      setMessage('Ocorreu um erro inesperado ao excluir a disciplina.')
      setDeleteLoadingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#04aa6d]">
            <BookOpen className="h-4 w-4" />
            Ciclo de estudo
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Organize suas disciplinas
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Defina a ordem do seu ciclo e associe uma cor para facilitar a
            visualização.
          </p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total no ciclo
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {initialCycles.length} disciplina(s)
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-emerald-100/85 p-5 shadow-[0_18px_40px_rgba(16,185,129,0.14)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/70 p-3 text-[#04aa6d] shadow-sm">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-emerald-950">
                Adicionar disciplina
              </h2>
              <p className="text-sm text-emerald-800/80">
                Monte seu ciclo com posição e cor personalizada.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateCycle} className="mt-6 grid gap-5">
            <div>
              <label
                htmlFor="discipline"
                className="mb-2 block text-sm font-bold text-emerald-950"
              >
                Disciplina
              </label>
              <input
                id="discipline"
                type="text"
                value={discipline}
                onChange={(event) => setDiscipline(event.target.value)}
                required
                className="w-full rounded-2xl border border-emerald-300 bg-white/90 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#04aa6d] focus:ring-2 focus:ring-emerald-200"
                placeholder="Ex.: Direito Constitucional"
              />
            </div>

            <div>
              <label
                htmlFor="position"
                className="mb-2 block text-sm font-bold text-emerald-950"
              >
                Posição no ciclo
              </label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
                <input
                  id="position"
                  type="number"
                  min="1"
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-emerald-300 bg-white/90 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#04aa6d] focus:ring-2 focus:ring-emerald-200"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="studyColorId"
                className="mb-2 block text-sm font-medium text-emerald-800"
              >
                Cor da disciplina
              </label>
              <div className="relative">
                <Palette className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
                <select
                  id="studyColorId"
                  value={studyColorId}
                  onChange={(event) => setStudyColorId(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-emerald-200 bg-white/80 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#04aa6d] focus:ring-2 focus:ring-emerald-100"
                >
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name} ({color.hex_value})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4 text-orange-300" />
              {loading ? 'Salvando...' : 'Adicionar ao ciclo'}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white p-3 text-orange-600 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
              <BookOpen className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Disciplinas do ciclo
              </h2>
              <p className="text-sm text-slate-500">
                Edite, reorganize ou exclua suas disciplinas.
              </p>
            </div>
          </div>

          {initialCycles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              Você ainda não cadastrou nenhuma disciplina no ciclo.
            </div>
          ) : (
            <div className="grid gap-4">
              {initialCycles.map((item) => {
                const isEditing = editingId === item.id
                const resolvedColor = getStudyColor(item.study_colors)

                return (
                  <div
                    key={item.id}
                    className="p-4 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm"
                  >
                    {isEditing ? (
                      <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Disciplina
                            </label>
                            <input
                              type="text"
                              value={editingDiscipline}
                              onChange={(event) =>
                                setEditingDiscipline(event.target.value)
                              }
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#04aa6d]"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Posição
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={editingPosition}
                              onChange={(event) =>
                                setEditingPosition(event.target.value)
                              }
                              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#04aa6d]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Cor
                          </label>
                          <select
                            value={editingStudyColorId}
                            onChange={(event) =>
                              setEditingStudyColorId(event.target.value)
                            }
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#04aa6d]"
                          >
                            {colors.map((color) => (
                              <option key={color.id} value={color.id}>
                                {color.name} ({color.hex_value})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={savingEdit}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Save className="h-4 w-4 text-orange-300" />
                            {savingEdit ? 'Salvando...' : 'Salvar'}
                          </button>

                          <button
                            onClick={handleCancelEdit}
                            disabled={savingEdit}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X className="h-4 w-4 text-orange-500" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className="mt-1 h-5 w-5 rounded-full border border-slate-200 shadow-sm"
                            style={{
                              backgroundColor:
                                resolvedColor?.hex_value ?? '#6B7280',
                            }}
                          />

                          <div className="space-y-1">
                            <p className="text-lg font-semibold text-slate-900">
                              {item.discipline}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                              <span>Posição {item.position}</span>
                              <span>•</span>
                              <span>{resolvedColor?.name ?? 'Sem cor'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4 text-orange-500" />
                            Editar
                          </button>

                          <button
                            onClick={() => handleDeleteCycle(item.id)}
                            disabled={deleteLoadingId === item.id}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            {deleteLoadingId === item.id
                              ? 'Excluindo...'
                              : 'Excluir'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}