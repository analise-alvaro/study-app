'use client'

import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setLoading(true)
    setMessage('')
    setMessageType('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
      setLoading(false)
      return
    }

    setMessage('Login realizado com sucesso. Redirecionando...')
    setMessageType('success')
    router.push('/profile')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-emerald-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.15)] backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto flex justify-center">
              <Image
                src="/bizurado-logo.svg"
                alt="Logo do Bizurado App"
                width={120}
                height={120}
                className="h-auto w-auto"
                priority
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Entrar no sistema
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Acesse sua conta para continuar seus estudos
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                E-mail
              </label>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#04aa6d] focus-within:ring-2 focus-within:ring-emerald-100">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="seu@email.com"
                  disabled={loading}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Senha
              </label>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#04aa6d] focus-within:ring-2 focus-within:ring-emerald-100">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
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
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/register')}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              Criar nova conta
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
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
      </div>
    </main>
  )
}