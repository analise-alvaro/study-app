'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { KeyRound, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ChangePasswordCard() {
  const [isOpen, setIsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setMessage('')
    setMessageType('')

    if (newPassword.length < 6) {
      setMessage('A nova senha deve ter pelo menos 6 caracteres.')
      setMessageType('error')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('As senhas não coincidem.')
      setMessageType('error')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
      setLoading(false)
      return
    }

    setMessage('Senha alterada com sucesso.')
    setMessageType('success')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Segurança
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            Altere sua senha de acesso
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev)
            setMessage('')
            setMessageType('')
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <KeyRound className="h-4 w-4" />
          {isOpen ? 'Cancelar' : 'Alterar senha'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nova senha
            </label>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#04aa6d] focus-within:ring-2 focus-within:ring-emerald-100">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                disabled={loading}
                className="text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirmar nova senha
            </label>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#04aa6d] focus-within:ring-2 focus-within:ring-emerald-100">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={loading}
                className="text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#04aa6d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#059862] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Alterando senha...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                Salvar nova senha
              </>
            )}
          </button>
        </form>
      )}

      {message && (
        <div
          className={`mt-4 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
            messageType === 'error'
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {messageType === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}