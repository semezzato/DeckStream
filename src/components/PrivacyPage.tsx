import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Database, KeyRound, Network, ShieldCheck } from 'lucide-react';

const sections = [
  {
    icon: Database,
    title: 'O que fica neste navegador',
    content: 'Perfis, botões, preferências de tema, itens da soundboard e os dados de conexão são guardados no armazenamento local do navegador (localStorage). Arquivos de áudio adicionados podem ser guardados como dados locais junto às configurações.',
  },
  {
    icon: KeyRound,
    title: 'Senha do OBS',
    content: 'Se você informar uma senha do OBS WebSocket, ela é salva no localStorage deste navegador para permitir reconexões. Esse armazenamento não é um cofre criptografado. Use o DeckStream apenas em um dispositivo e perfil de navegador em que confia; quem tiver acesso ao navegador pode acessar esses dados. Apagar os dados do site no navegador também remove essa configuração.',
  },
  {
    icon: Network,
    title: 'Conexões externas',
    content: 'A conexão de controle é feita pelo navegador diretamente ao endereço de OBS configurado. Áudios personalizados por URL são buscados nessa URL quando carregados. A página também solicita fontes ao Google Fonts. Não encontramos envio de perfis ou senhas para um servidor do DeckStream no código atual.',
  },
  {
    icon: ShieldCheck,
    title: 'Métricas e conta',
    content: 'A versão atual não exige conta e não inclui ferramenta de analytics no frontend. Se isso mudar, a página deverá ser atualizada para explicar os dados envolvidos.',
  },
];

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacidade e dados locais — DeckStream';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Entenda como o DeckStream armazena configurações, perfis, senha do OBS e dados da soundboard no navegador.');
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', 'Privacidade e dados locais — DeckStream');
  }, []);

  return (
  <main className="min-h-dvh bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-[#07080c] dark:text-slate-100 sm:px-6 sm:py-16">
    <article className="mx-auto max-w-3xl">
      <a href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 outline-none transition-colors hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Voltar ao DeckStream
      </a>

      <header className="mt-8 border-b border-zinc-200 pb-8 dark:border-white/10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">DeckStream</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Privacidade e dados locais</h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
          Este resumo descreve o comportamento da versão atual do app. As configurações ficam no navegador que você usa para acessar o DeckStream.
        </p>
      </header>

      <div className="mt-8 space-y-4">
        {sections.map(({ icon: Icon, title, content }) => (
          <section key={title} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{content}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        Para remover os dados locais, use as configurações do navegador para apagar os dados do site. Isso também remove perfis, botões e conexão salva.
      </p>

      <a href="/app" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
        Abrir o app <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </a>
    </article>
  </main>
  );
};
