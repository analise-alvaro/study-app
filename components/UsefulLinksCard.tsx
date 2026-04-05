'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, BookOpen, Lightbulb, TimerReset, ListChecks } from 'lucide-react'

type UsefulLink = {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const usefulLinks: UsefulLink[] = [
  {
    title: 'Como estudar por ciclos',
    description: 'Entenda como funciona o método de ciclos e organize melhor sua rotina.',
    href: '/',
    icon: TimerReset,
  },
 /*  {
    title: 'Métodos de estudo',
    description: 'Veja como distribuir leitura, exercícios, revisão e videoaula.',
    href: '/',
    icon: BookOpen,
  },
  {
    title: 'Dicas para render mais',
    description: 'Boas práticas para estudar com mais consistência e menos desgaste.',
    href: '/',
    icon: Lightbulb,
  }, */
]

export default function UsefulLinksCard() {
  const router = useRouter()

  return (
    <section className="mt-8  p-6">
      <div>
        <div className="flex items-center gap-2">
  <ListChecks className="h-6 w-6 text-[#04aa6d]" />
  <h2 className="text-2xl font-bold text-slate-900">
    Links úteis
  </h2>
</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Acesse conteúdos rápidos para entender melhor a lógica do aplicativo e
          aprimorar seus estudos.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {usefulLinks.map((link) => {
          const Icon = link.icon

          return (
            <button
              key={link.title}
              type="button"
              onClick={() => router.push(link.href)}
              className="group flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-emerald-100">
                <Icon className="h-5 w-5 text-slate-600 transition group-hover:text-[#04aa6d]" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-800 transition group-hover:text-[#04aa6d]">
                  {link.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {link.description}
                </p>
              </div>

              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#04aa6d]" />
            </button>
          )
        })}
      </div>
    </section>
  )
}