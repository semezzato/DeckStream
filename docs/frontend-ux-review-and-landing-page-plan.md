# DeckStream — revisão de UX e plano de evolução do frontend

**Data da revisão:** 23/10/2026
**Escopo:** interface React/Vite atual, temas, navegação responsiva, telas principais e plano para uma landing page.
**Tipo de revisão:** leitura estática do código e pesquisa de referências; não inclui inspeção visual em aparelhos nem teste com usuários.

## 1. Resumo executivo

O DeckStream já tem uma base funcional ampla: deck configurável, mixer, soundboard, perfis, configurações, simulador e integração direta com o OBS. O frontend está mais perto de um protótipo avançado do que de uma experiência pronta para distribuição ampla.

Há duas causas prioritárias para a sensação de inconsistência visual:

1. O `ThemeContext` alterna a classe `.dark` no elemento `<html>`, mas o Tailwind CSS 4 ainda está com sua variante `dark:` no padrão baseado em `prefers-color-scheme`. Nesse cenário, o tema escolhido no app e o tema do sistema podem disputar o resultado.
2. O `HeaderNav` tenta acomodar marca, seletor de perfil, quatro abas, conexão, tema, bloqueio de tela e tela cheia em uma única linha. Em telas estreitas, isso reduz o espaço do deck e pode causar compressão ou overflow. As abas também dependem de ícones sem rótulo visível.

**Ordem recomendada:** corrigir o contrato de tema; redefinir a navegação para celular e desktop; validar acessibilidade e layouts estreitos; depois desenhar a landing page com mensagem e CTA definidos.

## 2. O que foi analisado

- `src/App.tsx`: composição do app, navegação entre Deck, Mixer, Soundboard e Ajustes.
- `src/components/HeaderNav.tsx`: marca, perfil, abas, conexão e ações globais.
- `src/context/ThemeContext.tsx`, `src/index.css` e `index.html`: estado e aplicação dos temas, estilos globais e configuração da página.
- `MobileDeck`, `DeckButtonComponent`, `AudioMixer`, `SoundboardView`, `GridConfigView`, `ConnectionModal`, `ButtonEditModal` e `QuickVolumeModal`: principais telas, estados e padrões de interação.
- `src/hooks/usePWA.ts`: instalação, tela cheia, wake lock e retorno tátil.
- `src/context/OBSContext.tsx`, `src/services/obsClient.ts` e `obsSimulator.ts`: estado que alimenta a interface e diferença entre demonstração e conexão real.

Não encontrei documentação de produto, guia de marca ou uma landing page no repositório. A proposta de página abaixo é um plano inicial, não uma especificação de marketing validada.

## 3. Achados e ações

| Prioridade | Achado | Evidência no projeto | Ação prática |
|---|---|---|---|
| P0 | A classe de tema manual não está alinhada com a configuração padrão do Tailwind 4. | `ThemeContext.tsx` adiciona/remove `.dark`; `index.css` importa Tailwind, mas não declara `@custom-variant dark`. | Escolher um único mecanismo. Para preservar o contexto atual, declarar a variante manual `.dark` no CSS e validar `dark:` em cada tema. A documentação do Tailwind descreve explicitamente esse override. |
| P1 | A primeira pintura parte sempre do tema escuro. | `index.html` fixa `class="dark"`; o tema salvo só é aplicado no `useEffect` do provider. | Resolver tema salvo/sistema antes da primeira pintura, atualizar classe e `theme-color` no mesmo bootstrap e remover o estado inicial contraditório. |
| P1 | O cabeçalho concentra muitos controles e não muda de composição em telas pequenas. | `HeaderNav.tsx` mantinha três zonas numa linha; as quatro abas exibiam apenas ícones; perfil e ações globais continuavam presentes no mobile. | Decisão atual: manter toda a navegação no topo. Usar duas faixas no retrato estreito e uma faixa compacta em paisagem; manter perfil no Deck e utilitários em Ajustes/suas telas de uso. |
| P1 | Alvos de toque das ações da barra são pequenos para uma interface usada segurando o celular. | Vários controles usam `p-1.5` (aprox. 28 px incluindo ícone de 16 px) e os itens de navegação usam `p-2` (aprox. 32 px). | Projetar os alvos prioritários em torno de 44–48 CSS px, com espaçamento suficiente. WCAG 2.2 AA define 24×24 CSS px como mínimo com exceções; Apple recomenda 44×44 pt para botões e Android recomenda 48×48 dp para controles de toque. |
| P1 | O zoom do navegador está desativado no viewport. | `index.html` define `maximum-scale=1.0` e `user-scalable=no`. | Remover as restrições de zoom e verificar reflow/uso com zoom de texto. O deck pode manter gestos próprios sem bloquear ampliação da página. |
| P2 | Há cores globais fixas que não acompanham o tema. | `index.html` define fundo e texto escuros no `body`; `index.css` define thumb de scrollbar branca translúcida; a UI também usa muitas cores diretas em utilitários. | Criar tokens semânticos de página, superfície, texto, borda, foco e status e consumir esses tokens nas telas. Manter cores de estado (ao vivo, mudo, gravando) com significado consistente nos dois temas. |
| P2 | A configuração de tema pode ficar apertada no celular. | `GridConfigView.tsx` apresenta três opções lado a lado, com rótulos longos. `ConnectionModal.tsx` apresenta quatro modos em uma grade. | Testar a 320 CSS px; permitir quebra em duas linhas/colunas ou usar controles compactos sem cortar rótulos. |
| P2 | Alguns controles são reconhecíveis pelo ícone ou tooltip, mas não pelo texto visível. | `HeaderNav.tsx` usa títulos para conexão, tema, wake lock e tela cheia; abas ocultam rótulos em todas as larguras. | Usar rótulos visíveis na navegação principal. Para ícones utilitários, manter nome acessível, estado (`aria-pressed` quando aplicável) e foco de teclado visível. Evitar usar o ícone de sol tanto para tema claro quanto para manter a tela ligada. |
| P2 | O modo personalizado de botões permite combinações de cor sem garantia de contraste. | `DeckButtonComponent.tsx` usa `customBg` e texto branco como fallback. | Mostrar preview e medir contraste ao salvar; indicar combinações que falham e oferecer texto escuro/claro sugerido. Validar texto normal em 4,5:1 e componentes/estados em 3:1. |
| P2 | Não há landing page nem separação entre marketing e aplicação. | `src/main.tsx` monta o app atual na raiz; não há página de marketing ou roteamento visível no projeto. | Definir `/` como landing page e `/app` como produto, ou separar por subdomínio. Preservar um caminho direto para abrir o simulador. |
| P2 | A experiência mobile ainda é web-first, sem evidência de suporte offline ou app nativo. | Há manifesto e hooks de instalação, mas não encontrei service worker nem projeto Android nativo. | Na landing, descrever como web app/PWA apenas após validar instalação por navegador; não prometer suporte offline ou app nativo enquanto não estiver implementado. |
| P3 | Seleção de texto está desativada globalmente. | `src/index.css` define `user-select: none` no `body`; `App.tsx` também usa `select-none`. | Aplicar bloqueio apenas à superfície interativa do deck. Permitir seleção em ajuda, formulários, nomes e mensagens de erro. |

### Evidência técnica sobre o tema

O Tailwind 4 documenta que `dark:` usa `prefers-color-scheme` por padrão. Para controlar o tema por uma classe, a documentação orienta declarar `@custom-variant dark (&:where(.dark, .dark *));`.[^tailwind]

Na versão atual, `ThemeContext` alterna classe e salva `dark`, `light` ou `system`, enquanto a página já começa com `.dark`. Isso explica plausivelmente a disputa entre preferência salva, preferência do sistema e primeira pintura. É necessário validar a correção nos três modos e em todas as telas; a leitura do código não mede contraste/renderização real.

## 4. Proposta de navegação responsiva

O produto é controlado principalmente por toque e tem quatro destinos de primeiro nível. A pesquisa de NN/g recomenda expor a navegação ou adotar uma composição híbrida quando existem quatro ou cinco opções principais; ocultar tudo atrás de um menu pode reduzir a descoberta.[^nng]

| Largura de referência | Composição proposta | Prioridade de espaço |
|---|---|---|
| Celular, 320–639 px | Navegação sempre no topo e sem wordmark. Em retrato estreito, conexão na primeira faixa e quatro destinos rotulados na segunda. Em paisagem baixa, uma faixa compacta com os destinos e conexão por ícone. | Priorizar o uso do Deck em paisagem; evitar quebra ou corte dos destinos; alvos de toque de ao menos 44 px; destacar destino atual sem depender só da cor. |
| Tablet, 640–1023 px | Abas horizontais visíveis com ícone e rótulo curto; estado de conexão no cabeçalho; perfil junto dos controles do Deck. | Evitar ícones sem contexto e manter ações globais fora da navegação principal. |
| Desktop, 1024 px ou mais | Navegação superior com rótulos; marca à esquerda; perfil e estado em áreas separadas; utilitários agrupados à direita. | Aproveitar espaço horizontal e expor os destinos principais diretamente. |

### Regras para implementação

1. Não esconder as quatro áreas principais em um menu hambúrguer no celular: elas são poucas e usadas durante a operação.
2. Usar rótulos visíveis, estado selecionado semântico (`aria-current="page"`) e ordem de foco previsível.
3. Manter conexão com o OBS fácil de localizar, mas retirar do cabeçalho comandos pouco frequentes. Tema, wake lock e tela cheia podem ficar em um menu de utilitários; wake lock só deve aparecer em plataforma compatível.
4. O seletor de perfil deve ficar junto do deck, pois altera a superfície que a pessoa está operando.
5. Dimensionar alvos em 44–48 CSS px como meta de conforto móvel. A regra WCAG 2.2 AA é no mínimo 24×24 CSS px (com exceções), não 44 px.[^wcag][^apple][^android]
6. Verificar também paisagem, recortes/áreas seguras, zoom de 200%, teclado e leitor de tela.

## 5. Plano de consistência de temas

### Decisão recomendada

Manter os três modos já existentes — **Escuro**, **Claro** e **Sistema** — e fazer da classe no elemento raiz a única fonte para os utilitários `dark:`. O modo Sistema resolve o tema conforme `prefers-color-scheme`; os modos Claro/Escuro prevalecem sobre o sistema.

### Sequência

1. Configurar a variante manual do Tailwind 4 no `src/index.css`.
2. Inicializar o tema antes de renderizar a aplicação para evitar flash; manter a lógica de armazenamento em um único lugar.
3. Definir variáveis CSS semânticas: `--app-bg`, `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--border`, `--focus`, `--status-live`, `--status-muted` e `--status-recording`.
4. Aplicar `color-scheme` e atualizar `meta[name="theme-color"]` de acordo com o tema efetivo.
5. Substituir fundos/textos globais fixos e scrollbar hardcoded por tokens.
6. Rever estilos customizados de botão: preview em ambos os temas, contraste e estados ativos/desativados.

### Matriz de validação visual

Revisar **Deck, Mixer, Soundboard, Ajustes, ConnectionModal e ButtonEditModal** nos modos Claro, Escuro e Sistema, alternando também a preferência do sistema. Usar larguras de 320, 375, 390, 768, 1024 e 1440 CSS px. Conferir texto, inputs, selects, sliders, modais, estados ativos, foco, bordas, scrollbars e `theme-color` do navegador.

Critérios mínimos: texto normal com contraste de 4,5:1; texto grande com 3:1; controles/indicadores gráficos relevantes com 3:1; sem perda de conteúdo a 320 CSS px e sem bloqueio de zoom.[^wcag]

## 6. Plano de landing page

### Objetivo e público — hipótese inicial

**Objetivo:** ajudar uma pessoa que usa OBS Studio a entender em poucos segundos que o DeckStream transforma o celular em um painel touch configurável e levá-la a experimentar o produto.

**Público inicial:** streamers e criadores que usam OBS no computador e querem acionar cenas, áudio e efeitos sem voltar ao teclado/mouse. Isso ainda precisa de validação com usuários.

**Proposta de valor inicial:** “Controle o OBS pelo celular com um deck de cenas, áudio e efeitos que você organiza do seu jeito.” É um rascunho baseado nas capacidades atuais, não texto final aprovado.

**CTA principal implementado:** **Abrir o DeckStream**, levando a `/app`. Na primeira utilização o produto abre no simulador; neste mesmo navegador, uma conexão salva é retomada.
**CTA secundário implementado:** navegar para “Como conectar” ou abrir diretamente o assistente em `/app?connect=1`.
Evitar promessa de “instalação nativa”, conexão automática garantida, uso sem configuração ou compatibilidade que ainda não foi testada.

### Ordem sugerida das seções

1. **Cabeçalho:** logotipo/nome, Como funciona, Recursos e CTA principal. No celular, manter a ação principal visível e não repetir a navegação interna do app.
2. **Hero:** uma frase que diga o que é e para quem; subtítulo com o benefício; CTA; demonstração real da interface em uso. Exemplo de título: **“Controle o OBS com o toque do celular.”**
3. **Demonstração:** gravação curta ou mockup fiel mostrando troca de cena, mute/volume e um efeito sonoro. Preferir produto real a imagem genérica.
4. **Três benefícios escaneáveis:** acionar cenas; controlar áudio; personalizar páginas e botões. Descrever resultado primeiro e detalhe depois.
5. **Como funciona:** abrir no celular; escolher simulador ou informar conexão; conectar à mesma rede/configuração compatível; controlar o OBS. Confirmar o fluxo real antes de publicar instruções definitivas.
6. **Compatibilidade e transparência:** requisitos do OBS WebSocket, navegadores/dispositivos testados, diferença entre PWA e app nativo, onde os perfis são salvos e limitações conhecidas.
7. **Dúvidas comuns:** conexão e senha; Wi-Fi/USB; instalação; simulador; compatibilidade; privacidade e armazenamento local.
8. **Fechamento:** repetir o CTA principal com uma frase curta de benefício; rodapé com documentação, privacidade e contato quando esses materiais existirem.

Não inventar depoimentos, métricas, marcas de clientes ou selos. Até haver prova social verificável, usar uma demonstração do produto e uma explicação honesta da conexão como prova.

### Método alinhado ao artigo fornecido

O artigo propõe quatro fases: esclarecer o **quê/por quê** e o público; alinhar objetivo e wireframe; criar conteúdo e ativos; finalizar com checklist, métricas e teste com usuários. Como princípios de página, destaca mobile-first, proposta de valor forte, simplicidade, CTA claro, hierarquia lógica e uso de visuais.[^landing]

Aplicação ao DeckStream:

- **Clareza:** confirmar público, diferencial e a ação que significa sucesso antes de desenhar.
- **Alinhamento:** aprovar um wireframe mobile e desktop e decidir para onde o CTA leva.
- **Conteúdo/ativos:** escrever benefícios verificáveis, capturar telas reais e mostrar o produto em contexto.
- **Entrega:** revisar links, conexão, carregamento, contraste, zoom e tamanhos; validar a compreensão com pessoas que ainda não conhecem o app.

### Medição inicial

- Visitas que acionam o CTA principal.
- Aberturas do simulador e tentativas de conexão ao OBS.
- Cliques em “Como conectar”.
- Abandono por seção e por largura de tela.
- Tempo de carregamento e erros de navegação.

Definir evento e métrica antes de escolher ferramenta de analytics; coletar apenas o necessário e revisar requisitos de privacidade aplicáveis.

## 7. Backlog prático

| Etapa | Entrega | Critério de aceite |
|---|---|---|
| 1 — Tema | Variante Tailwind manual, bootstrap inicial e tokens semânticos. | Claro/Escuro ignoram a preferência oposta do sistema; Sistema acompanha mudança do sistema; sem flash perceptível; seis telas revisadas. |
| 2 — Navbar | Navbar no topo em todas as dimensões, duas faixas em retrato estreito e uma faixa compacta em paisagem; perfil e utilitários reposicionados. | Sem overflow em 320 px; destinos principais sempre descobertos; cada ação tem nome acessível, estado e foco visível; alvos móveis próximos de 44–48 px. |
| 3 — Mobile/accessibilidade | Reflow, zoom, cards compactos, modais, contraste e interações. | Sem perda em 320 px e zoom de 200%; revisão dos contrastes; telas testadas em retrato/paisagem e com teclado/leitor de tela. |
| 4 — Landing | Wireframe, copy, demo do produto e requisitos de publicação. | Pessoas novas identificam o produto, o público e a próxima ação sem explicação; CTA e requisitos de conexão estão corretos. |
| 5 — Lançamento e iteração | Métricas, SEO básico, privacidade e validação. | Links e eventos revisados; desempenho e acessibilidade verificados; primeira rodada de feedback registrada. |

**Estado da etapa 4:** `/` apresenta a landing page e `/app` abre o produto. O hero agora usa uma prévia larga do deck para comunicar o uso em paisagem; há benefícios, uma representação conceitual de perfis/páginas/botões, fluxo de conexão, requisitos, transparência local e FAQ. As artes estão identificadas como ilustrativas, não como captura real. O manifesto PWA abre o produto em `/app`. Ainda faltam validação visual em dispositivos reais, demo capturada do produto, revisão do conteúdo com usuários e definição dos materiais de privacidade/contato antes de divulgação pública.

**Estado da etapa 5:** metadados básicos de compartilhamento foram adicionados; `/privacidade` resume os dados guardados no navegador, a senha do OBS, conexões externas e a ausência de analytics no frontend atual. Nenhum serviço de métricas foi integrado. Antes de lançamento público, definir domínio para canonical/sitemap, responsável e canal de contato, revisar o texto de privacidade para o contexto de distribuição e validar a experiência com usuários e navegadores/dispositivos reais.

**Navbar atualizada:** o cabeçalho centraliza os destinos e agrupa conexão/estados ativos à direita. Em retrato, contexto do Deck e conexão ficam na primeira faixa e as quatro áreas na segunda; em paisagem baixa, tudo cabe em uma faixa. A paginação direta fica no cabeçalho quando há mais de uma página. Perfil, tela cheia e organização estão no menu “Ações do Deck”; o símbolo compacto aparece no espaço contextual das outras abas. O destino atual recebe preenchimento azul de alto contraste.

**Simplificação da faixa do Deck:** a faixa de controles foi removida do conteúdo do deck para liberar área vertical (cerca de 44 px líquidos, variando por orientação). Cena atual e estados inativos (“offline”/“REC.”) não ocupam espaço fixo; “LIVE” e “REC” aparecem junto à conexão somente enquanto ativos. A cena atual segue indicada pelo destaque do botão correspondente no deck.

**Motion:** o plano inicial está em [`motion-feedback-plan.md`](./motion-feedback-plan.md). A primeira etapa cobre feedback curto da navbar e movimento reduzido; o deck, os estados de operação e os modais precisam de uma rodada própria.

**Mixer atualizado:** a tela usa toda a área abaixo da navbar, sem largura máxima centralizada. Os canais viraram faixas verticais em uma grade responsiva, com rolagem quando não couberem na área disponível. O fader vertical usa um painel escuro retangular inspirado no controle de volume do [Uiverse](https://uiverse.io/seyed-mohsen-mousavi/chatty-frog-63), com trilho visual de 50 px e preenchimento proporcional ao nível. A porcentagem e os decibéis ficam junto ao fader; os botões de preset (0/50/75/100%) foram removidos. Permanecem o mute por canal, mute geral, reset geral para 0 dB e o estado vazio quando o OBS não fornece fontes de áudio.

## 8. Decisões ainda necessárias

- Quais sistemas/navegadores e versões do OBS serão oficialmente suportados?
- O produto será apresentado como PWA/web app ou haverá plano de app nativo?
- Quais ativos reais podem ser usados na demonstração?
- Há posicionamento de preço, gratuito ou plano futuro que possa ser comunicado?

Até essas respostas existirem, usar texto provisório e evitar promessas comerciais definitivas.

## 9. Referências

- [Isha Beniwal / UX Collective — “Landing the second click: a guide to designing better landing pages”](https://uxdesign.cc/landing-the-second-click-a-guide-to-designing-better-landing-pages-5396d2b902b8) — artigo fornecido; publicado em 10/10/2022.
- [Tailwind CSS — Dark mode](https://tailwindcss.com/docs/dark-mode) — comportamento padrão e seletor manual no Tailwind 4.
- [Nielsen Norman Group — How to Make Navigation (Even a Hamburger) Discoverable on Mobile](https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/) — visibilidade, rótulos, saliência e navegação combinada.
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) — contraste, reflow, zoom e dimensão mínima dos alvos de ponteiro.
- [Apple Human Interface Guidelines — Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) e [UI Design Dos and Don’ts](https://developer.apple.com/design/tips/) — alvos de toque e legibilidade.
- [Android Developers — Make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps) — recomendação de alvo de toque de 48 dp.

[^landing]: As recomendações são uma síntese do artigo citado, não uma garantia de conversão. O próprio artigo recomenda pesquisa, alinhamento de objetivo, layout/mobile-first, conteúdo, ativos, CTA, hierarquia, analytics e testes com usuários.
[^tailwind]: O comportamento citado é documentado na versão 4.3 consultada em 23/10/2026; confirmar ao atualizar Tailwind.
[^nng]: O estudo citado pela NN/g é de 2016 e seus autores ressalvam que a escolha depende do contexto. Usar como orientação inicial e validar com usuários do DeckStream.
[^wcag]: WCAG 2.2 é a referência de conformidade; recomendações de 44–48 px/dp são metas de conforto de plataformas, não o limiar WCAG.
[^apple]: As medidas da Apple usam pontos de interface iOS, que não são necessariamente idênticos a CSS px.
[^android]: Android recomenda 48 dp; dp também não é a mesma unidade que CSS px.
