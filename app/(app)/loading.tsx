import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 px-8 py-10 shadow-sm backdrop-blur">
        <Loader2 className="h-10 w-10 animate-spin text-[#04aa6d]" />
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">Carregando página</p>
          <p className="mt-1 text-sm text-slate-500">
            Aguarde um instante...
          </p>
        </div>
      </div>
    </div>
  )
}