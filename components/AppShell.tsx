'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  Clock3,
  FolderKanban,
  User,
  UserCircle2,
  LogOut,
  Loader2,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Props = {
  username: string
  totalHours: string
  children: ReactNode
}

export default function AppShell({ username, totalHours, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  async function handleLogout() {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const links = [
    { href: '/profile', label: 'Perfil', icon: User },
    { href: '/study-session', label: 'Sessão de estudo', icon: Clock3 },
    { href: '/study-cycle', label: 'Ciclo de estudo', icon: FolderKanban },
    { href: '/statistics', label: 'Estatísticas', icon: BarChart3 },
  ]

  const isPageNavigating = pendingHref !== null

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f1f1f1] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.28),transparent_28%),radial-gradient(circle_at_top_right,rgba(221,214,254,0.22),transparent_26%),radial-gradient(circle_at_bottom_center,rgba(251,207,232,0.16),transparent_24%)]" />
      </div>

      {(isPageNavigating || isLoggingOut) && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-50 h-1 overflow-hidden bg-transparent">
          <div className="h-full w-1/3 animate-[loadingBar_1.1s_ease-in-out_infinite] rounded-full bg-[#04aa6d]" />
        </div>
      )}

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* SIDEBAR */}
        <aside className="w-full border-b border-slate-700 bg-[#1d2a35] text-white lg:min-h-screen lg:w-72 lg:flex-shrink-0 lg:border-r lg:border-b-0">
          <div className="flex h-full flex-col">
            {/* LOGO */}
            <div className="border-b border-slate-700 px-4 py-4 sm:px-6 sm:py-5">
              <Link
                href="/profile"
                onClick={() => setPendingHref('/profile')}
                className="flex items-center gap-3"
              >
                <img
                  src="/bizurado-logo.svg"
                  alt="Bizurado App"
                  className="h-11 w-11 object-contain"
                />

                <div>
                  <p className="text-sm font-bold text-white">BIZURADO APP</p>
                  <p className="text-xs text-slate-400">Timer de controle de estudos</p>
                </div>
              </Link>
            </div>

            {/* USUÁRIO */}
            <div className="px-4 py-4">
              <div className="bg-[#24313d] p-4 shadow-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <UserCircle2 className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wide">Usuário</p>
                </div>

                <p className="mt-2 break-words text-base font-semibold text-white">
                  {username}
                </p>

                <div className="bg-[#24313d] p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    <p className="text-xs">Total estudado</p>
                  </div>

                  <p className="mt-1 text-xl font-bold">{totalHours}h</p>
                </div>
              </div>
            </div>

            {/* NAVEGAÇÃO + LOGOUT */}
            <nav className="flex flex-1 flex-col px-2 pb-6">
              <p className="px-4 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Navegação
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {links.map((link) => {
                  const isActive = pathname === link.href
                  const isPending = pendingHref === link.href
                  const Icon = link.icon

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setPendingHref(link.href)}
                      aria-busy={isPending}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-[#04aa6d] text-white shadow-sm'
                          : 'text-slate-100 hover:bg-[#38444d]'
                      } ${isPending ? 'opacity-90' : ''}`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? 'text-white' : 'text-orange-400'
                          }`}
                        />
                        <span>{link.label}</span>
                      </span>

                      {isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      )}
                    </Link>
                  )
                })}
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-2 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-red-500/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-orange-400" />
                  <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
                </span>

                {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>

              {/* ASSINATURA */}
              <div className="mt-auto border-t border-slate-700 px-4 py-4">
                <p className="text-xs text-slate-500">Criado por</p>
                <p className="mt-1 text-sm font-bold text-[#04aa6d]">
                  Alvaro Cavalcante
                </p>
                <p className="text-xs text-slate-500">analise.alvaro@gmail.com</p>
              </div>
            </nav>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <div className="flex min-h-0 flex-1 flex-col">
          <header className="border-slate-300 bg-white/90 backdrop-blur">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Bem-vindo de volta</p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Continue sua rotina de estudos
                  </h2>
                </div>

                {(isPageNavigating || isLoggingOut) && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isLoggingOut ? 'Saindo...' : 'Carregando...'}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="p-4">{children}</div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(420%);
          }
        }
      `}</style>
    </div>
  )
}