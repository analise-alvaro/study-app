'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
} from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [registrationCompleted, setRegistrationCompleted] = useState(false)

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setLoading(true)
    setMessage('')
    setMessageType('')

    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem.')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres.')
      setMessageType('error')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
      setLoading(false)
      return
    }

    if (data.user) {
      setMessage(
        'Cadastro realizado com sucesso. Verifique seu e-mail para confirmar a conta.'
      )
      setMessageType('success')
      setRegistrationCompleted(true)
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-emerald-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.15)] backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#04aa6d]/10 text-[#04aa6d]">
              <UserPlus className="h-6 w-6" />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Criar conta
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Cadastre-se para começar a organizar seus estudos
            </p>
          </div>

          {registrationCompleted ? (
            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                <p className="text-sm font-semibold text-slate-500">
                  Dados cadastrados
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <User className="h-4 w-4 text-[#04aa6d]" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Nome</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <Mail className="h-4 w-4 text-[#04aa6d]" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">E-mail</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Cadastro realizado com sucesso.</p>
                  <p className="mt-1">
                    Enviamos um e-mail de confirmação para <strong>{email}</strong>.
                    Verifique sua caixa de entrada e confirme o cadastro para
                    acessar o sistema.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#04aa6d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#059862]"
              >
                <LogIn className="h-4 w-4" />
                Ir para o login
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleRegister} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nome
                  </label>

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#04aa6d] focus-within:ring-2 focus-within:ring-emerald-100">
                    <User className="h-4 w-4 text-slate-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      placeholder="Seu nome"
                      disabled={loading}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    E-mail
                  </label>

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#04aa6d] focus-within:ring-2 focus-within:ring-emerald-100">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      id="email"
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
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      className="text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirmar senha
                  </label>

                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#04aa6d] focus-within:ring-2 focus-within:ring-emerald-100">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      id="confirmPassword"
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
                      aria-label={
                        showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
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
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Criar conta
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogIn className="h-4 w-4" />
                  Já tenho uma conta
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
            </>
          )}
        </div>
      </div>
    </main>
  )
}