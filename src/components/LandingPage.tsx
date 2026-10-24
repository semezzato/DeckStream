import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Check,
  CircleHelp,
  Layers3,
  Music2,
  Mic,
  MonitorPlay,
  Radio,
  SlidersHorizontal,
  Sparkles,
  Wifi,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Layers3,
    title: 'Troque de cena',
    description: 'Acesse suas cenas do OBS em botões grandes, organizados no seu próprio deck.',
    tone: 'text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/15',
  },
  {
    icon: AudioLines,
    title: 'Ajuste o áudio',
    description: 'Controle o volume e o mute dos canais do mixer sem sair da transmissão.',
    tone: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/15',
  },
  {
    icon: Music2,
    title: 'Dispare efeitos',
    description: 'Organize sons e vinhetas na soundboard para acioná-los com um toque.',
    tone: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/15',
  },
];

const faqs = [
  {
    question: 'Posso experimentar sem conectar ao OBS?',
    answer: 'Sim. Na primeira utilização, o DeckStream abre no simulador, que permite explorar o deck e seus controles sem enviar comandos ao OBS. Se você já configurou uma conexão neste navegador, o app retoma essa configuração.',
  },
  {
    question: 'Como o celular se conecta ao OBS?',
    answer: 'O OBS precisa estar com o servidor WebSocket v5 habilitado. Use o assistente do app para configurar uma conexão pela rede local ou por USB com ADB; o firewall do computador também pode precisar permitir a conexão.',
  },
  {
    question: 'Preciso instalar um app nativo?',
    answer: 'Não. O DeckStream atual é uma aplicação web que funciona pelo navegador. A opção de instalação como PWA depende do suporte oferecido pelo navegador e pelo dispositivo.',
  },
  {
    question: 'Onde ficam minhas configurações?',
    answer: 'Perfis, botões e configuração de conexão são salvos no armazenamento local deste navegador. Se você informar uma senha do OBS, ela também fica salva localmente neste dispositivo.',
  },
];

const PreviewButton: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; tone: string }> = ({ icon, title, subtitle, tone }) => (
  <div className={`flex min-h-[4.5rem] items-center gap-2.5 rounded-xl border border-white/10 p-2.5 text-left shadow-lg sm:min-h-20 sm:gap-3 sm:p-3 ${tone}`}>
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/15 sm:h-10 sm:w-10">{icon}</span>
    <span className="min-w-0">
      <span className="block truncate text-[10px] font-bold leading-tight text-white sm:text-xs">{title}</span>
      <span className="mt-1 block truncate text-[9px] font-medium text-white/60 sm:text-[10px]">{subtitle}</span>
    </span>
  </div>
);

export const LandingPage: React.FC = () => (
  <div className="min-h-dvh bg-zinc-50 text-zinc-900 transition-colors dark:bg-[#07080c] dark:text-zinc-100">
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-zinc-50/90 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#07080c]/90">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="DeckStream, início" className="inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-zinc-950 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20"><Layers3 aria-hidden="true" className="h-4 w-4" /></span>
          <span>Deck<span className="text-blue-500">Stream</span></span>
        </a>
        <nav aria-label="Navegação da página" className="hidden items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300 sm:flex">
          <a href="#recursos" className="transition-colors hover:text-blue-600 dark:hover:text-blue-300">Recursos</a>
          <a href="#como-funciona" className="transition-colors hover:text-blue-600 dark:hover:text-blue-300">Como funciona</a>
          <a href="#perguntas" className="transition-colors hover:text-blue-600 dark:hover:text-blue-300">Perguntas</a>
        </nav>
        <a href="/app" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          Abrir app <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    </header>

    <main>
      <section className="relative isolate overflow-hidden border-b border-zinc-200/70 dark:border-white/[0.06]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_5%,rgba(59,130,246,0.12),transparent_38%),radial-gradient(ellipse_at_90%_35%,rgba(124,58,237,0.10),transparent_35%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12 lg:pb-20 lg:pt-20">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
            <MonitorPlay aria-hidden="true" className="h-3.5 w-3.5" /> Seu painel de controle para OBS
          </div>
          <h1 className="max-w-xl text-[2.55rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-zinc-950 dark:text-white sm:text-6xl lg:text-[4.25rem]">
            Comande sua live. <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-500 bg-clip-text text-transparent">Sem sair dela.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg sm:leading-8">
            Transforme o celular em um painel touch para trocar cenas, controlar o áudio e acionar seus efeitos no OBS — com os comandos organizados do seu jeito.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="/app" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              Abrir o DeckStream <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <a href="#como-funciona" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/[0.06]">
              Veja como funciona <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">Sem conta. Na primeira utilização, você começa pelo simulador; conexões já salvas neste navegador são retomadas.</p>
        </div>

        <div className="relative mx-auto w-full max-w-2xl lg:pl-2">
          <div aria-hidden="true" className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-blue-500/25 via-cyan-500/10 to-violet-500/20 blur-3xl" />
          <div className="relative rotate-0 overflow-hidden rounded-[1.65rem] border border-zinc-200 bg-white p-2 shadow-2xl shadow-zinc-950/10 dark:border-white/10 dark:bg-[#10131c] dark:shadow-black/50 sm:rounded-[2rem] sm:p-3">
            <div className="overflow-hidden rounded-[1.15rem] bg-[#0b0e15] p-3 text-white sm:rounded-[1.45rem] sm:p-4">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300"><Layers3 aria-hidden="true" className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white sm:text-sm">Meu deck</p>
                  <p className="mt-0.5 truncate text-[9px] font-medium text-zinc-500 sm:text-[10px]">Prévia ilustrativa · simulador</p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/15 bg-amber-300/10 px-2.5 py-1.5 text-[9px] font-bold text-amber-200 sm:text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> OBS desconectado
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="truncate text-[10px] font-semibold text-zinc-300 sm:text-xs">Página 1 <span className="font-normal text-zinc-500">/ Principal</span></span>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-medium text-zinc-500 sm:text-[10px]"><SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" /> Grade personalizável</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
              <PreviewButton icon={<Layers3 aria-hidden="true" className="h-4 w-4 text-blue-200" />} title="Gameplay" subtitle="Trocar cena" tone="bg-gradient-to-br from-blue-900/90 to-blue-950/80" />
              <PreviewButton icon={<Radio aria-hidden="true" className="h-4 w-4 text-rose-200" />} title="Gravação" subtitle="Iniciar / parar" tone="bg-gradient-to-br from-rose-900/80 to-rose-950/80" />
              <PreviewButton icon={<Mic aria-hidden="true" className="h-4 w-4 text-emerald-200" />} title="Microfone" subtitle="Mute e volume" tone="bg-gradient-to-br from-emerald-900/80 to-emerald-950/80" />
              <PreviewButton icon={<AudioLines aria-hidden="true" className="h-4 w-4 text-cyan-200" />} title="Áudio desktop" subtitle="Mixer de áudio" tone="bg-gradient-to-br from-cyan-900/80 to-cyan-950/80" />
              <PreviewButton icon={<Music2 aria-hidden="true" className="h-4 w-4 text-violet-200" />} title="Vinheta" subtitle="Soundboard" tone="bg-gradient-to-br from-violet-900/80 to-violet-950/80" />
              <div className="flex min-h-[4.5rem] items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.025] text-[10px] font-semibold text-zinc-500 sm:min-h-20 sm:text-xs">Seu próximo atalho</div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-[9px] font-semibold text-zinc-300 sm:text-[10px]"><AudioLines aria-hidden="true" className="h-3.5 w-3.5 text-blue-300" /> Mixer rápido <span className="hidden text-zinc-500 sm:inline">· Desktop</span></span>
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10 sm:w-28"><span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" /></span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-white/[0.07] pt-3" aria-hidden="true">
              <span className="h-1 w-5 rounded-full bg-blue-400" /><span className="h-1 w-1 rounded-full bg-white/25" /><span className="h-1 w-1 rounded-full bg-white/25" />
            </div>
            </div>
          </div>
          <div className="relative mt-3 flex items-center justify-center gap-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 sm:text-xs"><Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-blue-500" /> Concebido para aproveitar a tela do celular na horizontal</div>
        </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-7 gap-y-3 border-t border-zinc-200/70 px-4 py-5 text-[10px] font-semibold text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400 sm:gap-x-12 sm:px-6 sm:py-6 sm:text-xs">
          <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="h-4 w-4 text-emerald-500" /> Sem conta</span>
          <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="h-4 w-4 text-emerald-500" /> Simulador para conhecer</span>
          <span className="inline-flex items-center gap-2"><Check aria-hidden="true" className="h-4 w-4 text-emerald-500" /> Configuração no seu navegador</span>
        </div>
      </section>

      <section id="recursos" className="scroll-mt-20 border-y border-zinc-200 bg-white py-16 dark:border-white/[0.06] dark:bg-white/[0.015] sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">Controles à mão</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">O que você precisa, no mesmo painel.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">Organize os comandos mais usados para manter o foco no que está acontecendo ao vivo.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, tone }) => (
              <article key={title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/[0.07] dark:bg-[#0c0f16] sm:p-6">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
                <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 py-16 dark:border-white/[0.06] dark:from-blue-950/20 dark:via-[#090b12] dark:to-violet-950/15 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">Seu fluxo, seu deck</p>
            <h2 className="mt-3 max-w-lg text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">Os atalhos que fazem sentido para a sua live.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">Monte páginas para diferentes momentos, organize botões e escolha os comandos que quer deixar à mão. A tela acompanha o jeito como você opera.</p>
            <ul className="mt-6 space-y-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-2.5"><Check aria-hidden="true" className="h-4 w-4 text-emerald-500" /> Crie e alterne entre perfis e páginas</li>
              <li className="flex items-center gap-2.5"><Check aria-hidden="true" className="h-4 w-4 text-emerald-500" /> Ajuste a grade e a aparência dos botões</li>
              <li className="flex items-center gap-2.5"><Check aria-hidden="true" className="h-4 w-4 text-emerald-500" /> Salve suas configurações neste navegador</li>
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-blue-500/15 to-violet-500/15 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-[#10131c] sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-white/[0.07]">
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Exemplo de organização</p><p className="mt-1 text-sm font-bold">Momentos da live</p></div>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">3 páginas</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Principal', 'Intervalo', 'Encerramento'].map((page, index) => <span key={page} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${index === 0 ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-white/[0.05] dark:text-zinc-400'}`}>{page}</span>)}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { icon: <Layers3 aria-hidden="true" className="h-4 w-4" />, label: 'Cena' },
                  { icon: <Mic aria-hidden="true" className="h-4 w-4" />, label: 'Microfone' },
                  { icon: <Music2 aria-hidden="true" className="h-4 w-4" />, label: 'Vinheta' },
                ].map(({ icon, label }, index) => <div key={label} className={`flex aspect-[1.25] flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 text-[10px] font-bold dark:border-white/[0.07] ${index === 0 ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' : 'bg-zinc-50 text-zinc-600 dark:bg-white/[0.025] dark:text-zinc-300'}`}>{icon}{label}</div>)}
                <div className="flex aspect-[1.25] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-300 text-zinc-400 dark:border-white/15"><span className="text-lg leading-none">+</span><span className="text-[9px] font-semibold">Novo botão</span></div>
              </div>
              <p className="mt-4 text-center text-[10px] leading-5 text-zinc-400">Prévia conceitual da personalização, não uma captura do app.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">Comece por aqui</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">Do primeiro toque à conexão.</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">Na primeira utilização, explore o painel no simulador. Você também pode configurar a conexão com o computador quando quiser.</p>
            <a href="/app?connect=1" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/[0.06]">
              Abrir assistente de conexão <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
          <ol className="space-y-3">
            {[
              ['Abra o DeckStream', 'Entre pelo navegador do celular. Na primeira utilização, o simulador permite conhecer as telas sem enviar comandos ao OBS; conexões já salvas são retomadas.'],
              ['Prepare o OBS', 'Ative o servidor WebSocket v5 no OBS Studio e escolha a conexão pela rede local ou pelo fluxo USB/ADB disponível no assistente.'],
              ['Organize e opere', 'Escolha um perfil, ajuste seus botões e use o painel touch. As configurações ficam salvas neste navegador.'],
            ].map(([title, description], index) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/[0.07] dark:bg-white/[0.02] sm:p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-extrabold text-white">{index + 1}</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="compatibilidade-title" className="border-y border-zinc-200 bg-white py-14 dark:border-white/[0.06] dark:bg-white/[0.015] sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[0.7fr_1.3fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">Antes de conectar</p>
            <h2 id="compatibilidade-title" className="mt-3 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">O que você precisa saber</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/[0.07]">
              <Wifi aria-hidden="true" className="h-5 w-5 text-blue-500" />
              <h3 className="mt-3 text-sm font-bold">Conexão local</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">A conexão real depende do OBS WebSocket v5 e do acesso entre celular e computador pela rede ou pelo fluxo USB/ADB.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/[0.07]">
              <CircleHelp aria-hidden="true" className="h-5 w-5 text-purple-500" />
              <h3 className="mt-3 text-sm font-bold">Web app, sem conta</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">Não há app nativo nem sincronização em nuvem neste projeto. A instalação como PWA varia conforme navegador e dispositivo.</p>
            </div>
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/[0.07] sm:col-span-2">
              <Check aria-hidden="true" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="mt-3 text-sm font-bold">Seus dados ficam neste navegador</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">Perfis, botões e conexão são armazenados localmente no dispositivo. A senha WebSocket também é salva localmente se você decidir informá-la.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="perguntas" className="scroll-mt-20 mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-300">Dúvidas comuns</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">Perguntas antes de começar</h2>
        </div>
        <div className="mt-8 space-y-3">
          {faqs.map(({ question, answer }) => (
            <details key={question} className="group rounded-xl border border-zinc-200 bg-white px-4 open:bg-zinc-50 dark:border-white/[0.07] dark:bg-white/[0.02] dark:open:bg-white/[0.04] sm:px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100">
                {question}<CircleHelp aria-hidden="true" className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-12" />
              </summary>
              <p className="pb-4 pr-8 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl bg-blue-700 p-6 text-white shadow-xl shadow-blue-950/15 sm:p-10 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-100"><Zap aria-hidden="true" className="h-4 w-4" /> Explore o painel</span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Controle o OBS pelo celular.</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">Abra o app no navegador. Na primeira utilização, o simulador ajuda você a conhecer os controles.</p>
          </div>
          <a href="/app" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-800 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700">
            Abrir o DeckStream <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>

    <footer className="border-t border-zinc-200 py-6 dark:border-white/[0.07]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="font-bold text-zinc-700 dark:text-zinc-300">DeckStream</span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <span>Controle web para OBS Studio · Configurações armazenadas no navegador</span>
          <a href="/privacidade" className="font-semibold text-zinc-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-300">Privacidade</a>
        </div>
      </div>
    </footer>
  </div>
);
