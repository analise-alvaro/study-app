import { BookOpen, Layers3, Timer, CheckCircle2 } from 'lucide-react'

type Props = {
  compact?: boolean
}

export default function AppUsageGuide({ compact = false }: Props) {
  return (
    <section
      className={`rounded-3xl border border-emerald-200/60 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm ${
        compact ? 'p-5' : 'p-6 md:p-8'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-[#04aa6d]">
          <BookOpen className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#04aa6d]">
            Como usar o app
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">
            Comece em 3 passos
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            O fluxo é simples: monte seu ciclo, estude com o timer e salve seu progresso.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <Layers3 className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-900">1. Cadastre suas disciplinas</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Vá em <span className="font-semibold text-slate-800">Ciclo de Estudo</span> e
            adicione as disciplinas na ordem que deseja estudar.
          </p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
            <Timer className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-900">2. Inicie sua sessão</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Entre em <span className="font-semibold text-slate-800">Sessão de Estudo</span>,
            escolha a disciplina, o método e defina o tempo da sessão.
          </p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-900">3. Salve onde parou</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
  Quando o tempo terminar, escreva uma observação rápida e salve a sessão para
  continuar depois do ponto certo.{' '}
  <span className="block mt-2 font-bold uppercase text-emerald-700">
    É Importantíssimo registrar onde você parou!
  </span>
</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-700">
          <span className="font-bold text-slate-900">Dica:</span> primeiro monte seu ciclo.
          Depois, use a página de sessão para estudar todos os dias.
        </p>
      </div>
    </section>
  )
}