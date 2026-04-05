import AppUsageGuide from '@/components/AppUsageGuide'

export default function UserGuidePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-[#04aa6d]">Guia do Usuário</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Como usar o Bizurado App
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Aprenda rapidamente como organizar seus estudos utilizando o método de ciclo.
        </p>
      </div>

      <AppUsageGuide />
    </div>
  )
}