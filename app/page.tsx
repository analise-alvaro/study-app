import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ciclo de estudos para concurso | Bizurado App',
  description:
    'Aprenda como estudar por ciclo de estudos e organize suas sessões com o Bizurado App.',
  alternates: {
    canonical: 'https://bizuradoapp.vercel.app/',
  },
  openGraph: {
    title: 'Ciclo de estudos para concurso | Bizurado App',
    description:
      'Aprenda como estudar por ciclo de estudos e organize suas sessões com o Bizurado App.',
    url: 'https://bizuradoapp.vercel.app/',
    siteName: 'Bizurado App',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/bizurado-logo.svg"
              alt="Bizurado App"
              width={40}
              height={40}
            />
            <div>
              <p className="font-bold">Bizurado App</p>
              <p className="text-sm text-slate-500">
                Organização de estudos por ciclo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Entrar
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Criar conta
            </Link>
          </div>
        </div>

        <section>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            Como estudar por ciclo de estudos com o Bizurado App
          </h1>

          <div className="mt-6">
            <Image
              src="/ciclopessoal.png"
              alt="Exemplo de Ciclo de estudos no Bizurado App"
              width={800}
              height={400}
              className="rounded-2xl border border-slate-200"
            />
          </div>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            O ciclo de estudos é uma forma simples, flexível e eficiente de
            organizar os estudos para concurso. Em vez de depender de um
            cronograma rígido, você segue uma sequência de disciplinas e avança
            conforme conclui cada sessão.
          </p>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            O Bizurado App foi criado para transformar esse método em algo
            prático no dia a dia: você monta seu ciclo, usa um timer para manter
            o foco e registra exatamente onde parou para continuar depois sem se
            perder.
          </p>

        </section>

        <section>
          <h2 className="text-2xl font-bold">O que é ciclo de estudos?</h2>

          <p className="mt-4 leading-7 text-slate-600">
            O ciclo de estudos é um método em que você organiza as matérias em
            uma ordem fixa e vai estudando uma após a outra. Quando termina uma
            sessão, avança para a próxima disciplina da sequência.
          </p>

          <p className="mt-4 leading-7 text-slate-600">
            Isso é muito útil para quem estuda para concurso, porque a rotina
            raramente é perfeita. Nem sempre dá para cumprir horários fechados
            todos os dias. Com o ciclo, você mantém continuidade mesmo quando a
            semana sai diferente do planejado.
          </p>

          <p className="mt-4 leading-7 text-slate-600">
            Por isso, o estudo por ciclo é muito valorizado no universo dos
            concursos: ele ajuda a distribuir melhor as disciplinas, evita
            abandono de matérias importantes e favorece constância no longo
            prazo. Veja pela imagem a seguir como é possível adicionar disciplinas
            e organizar a ordem delas no nosso aplicativo. Isso facilita sua 
            organização pessoal de estudos.
          </p>

          <div className="mt-6">
            <Image
              src="/ciclo.png"
              alt="Ciclo de estudos no Bizurado App"
              width={800}
              height={400}
              className="rounded-2xl border border-slate-200"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Por que o ciclo funciona tão bem?</h2>

          <div className="mt-6 space-y-6">
            <div>
              <p className="font-bold">Mais flexibilidade</p>
              <p className="text-slate-600">
                Você não fica preso a estudar uma matéria em um único dia da
                semana. Basta continuar a próxima do ciclo.
              </p>
            </div>

            <div>
              <p className="font-bold">Mais constância</p>
              <p className="text-slate-600">
                Mesmo que um dia dê errado, o planejamento não quebra. Você só
                retoma de onde parou. Mesmo que seja por poucos minutos.
              </p>
            </div>

            <div>
              <p className="font-bold">Melhor distribuição das disciplinas</p>
              <p className="text-slate-600">
                O ciclo ajuda a evitar excesso de foco em poucas matérias e
                abandono das demais. Você garante que está dando atenção a todas as disciplinas.
              </p>
            </div>

            <div>
              <p className="font-bold">Sensação de progresso real</p>
              <p className="text-slate-600">
                Cada sessão concluída empurra o estudo para frente, de forma
                objetiva e organizada, sem carga cognitiva. Você só se preocupa em estudar.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Como funciona na prática?</h2>

          <div className="mt-6 space-y-6">
            <div>
              <p className="font-bold">1. Você define a ordem das disciplinas</p>
              <p className="text-slate-600">
                Exemplo: Constitucional → Administrativo → Contabilidade →
                Tributário → Empresarial.
              </p>
            </div>

            <div>
              <p className="font-bold">2. Você estuda uma disciplina por vez</p>
              <p className="text-slate-600">
                Sem depender do dia da semana. O foco é seguir a sequência do
                ciclo.
              </p>
            </div>

            <div>
              <p className="font-bold">3. Você avança para a próxima matéria</p>
              <p className="text-slate-600">
                Terminou a sessão? Na próxima vez, segue o fluxo natural do seu
                ciclo.
              </p>
            </div>

            <div>
              <p className="font-bold">Nosso temporizador (timer) é projetado para os ciclos</p>
              <p className="text-slate-600">
                Com o timer projetado para os ciclos, você não tem distrações.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mt-6">
            <Image
              src="/timer.png"
              alt="Sessão de estudo com timer"
              width={800}
              height={400}
              className="rounded-2xl border border-slate-200"
            />
          </div>
        </section>


        <section>
          <h2 className="text-2xl font-bold">Registro do estudo</h2>

          <p className="mt-4 leading-7 text-slate-600">
            Estudar por ciclo não é só escolher a próxima disciplina. Também é
            importante saber exatamente onde continuar. Quando você registra o
            ponto em que parou, a próxima sessão começa com muito menos atrito.
          </p>

          <p className="mt-4 leading-7 text-slate-600">
            Isso evita perda de tempo tentando lembrar página, aula, questão ou
            assunto. Em concursos, esse tipo de continuidade faz diferença no
            longo prazo. Por exemplo, na imagem a seguir registramos que paramos
            no vídeo 11 no minuto 15. Quando você for estudar de novo, é só checar
            o histórico recente.
          </p>

          

          <div className="mt-6">
            <Image
              src="/registro.png"
              alt="Registro da sessão de estudo"
              width={800}
              height={400}
              className="rounded-2xl border border-slate-200"
            />
          </div>
        </section>

                <section>
          <h2 className="text-2xl font-bold">Seleção do Método de Estudo</h2>

          <p className="mt-4 leading-7 text-slate-600">
            Com o seletor do método de estudos, você consegue estar atento
            às leituras, às video-aulas, aos exercícios e às revisões.
          </p>

          <p className="mt-4 leading-7 text-slate-600">
            Tem pessoas que separam o tempo para cada método de estudo. Isso
            realmente é o mais indicado. Quem quer passar resolve muitos exercícios.
          </p>

          

<div className="mt-6 flex justify-center">
  <Image
    src="/metodoestudo2.png"
    alt="Escolha do método de estudo"
    width={600}
    height={300}
    className="rounded-2xl border border-slate-200 w-full max-w-md h-auto object-contain"
  />
</div>
        </section>

        <section>
          <div className="rounded-2xl bg-emerald-100 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-800">
              Ponto mais importante
            </p>

            <p className="mt-3 leading-7 text-slate-700">
              <span className="font-bold uppercase text-emerald-800">
                É essencial registrar exatamente onde você parou.
              </span>{' '}
              Isso garante continuidade real no estudo e evita perda de tempo
              revendo conteúdo já estudado sem necessidade.
            </p>
          </div>
        </section>

        <section>
          <div className="rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">
              Bizurado App
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Seu sistema de estudos por ciclo
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              O Bizurado App une método e prática: organiza o ciclo, transforma
              o estudo em sessões objetivas e ajuda você a continuar sempre do
              ponto certo.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold">Comece agora</h2>

          <p className="mt-4 text-slate-600">
            Monte seu ciclo, mantenha constância e estude com mais clareza usando
            o Bizurado App.
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Entrar
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Criar conta
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}