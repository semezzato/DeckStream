# Barra de Navegação em Ícones Foscos & Central de Conexão Automática Plug-and-Play

Plano de modernização visual e funcional para transformar a navegação principal em um dock moderno e simplificar a conexão USB/Wi-Fi para ser 100% plug-and-play.

---

## 1. Visão Geral e Necessidade do Usuário

### Problema Atual:
- **Navbar ocupando espaço com textos**: No celular e telas menores, as abas com texto ("Deck", "Mixer", "Soundboard", "Ajustes") consomem espaço horizontal precioso e criam poluição visual.
- **Conexão manual burocrática**: Para conectar o celular ao computador via cabo USB ou Wi-Fi, o usuário precisava configurar IP, portas e comandos manualmente, o que quebra a experiência fluida de ligar o cabo e usar instantaneamente.

### Soluções Definidas com o Usuário:
1. **Navbar Minimalista em Dock com Vidro Fosco**:
   - Ícones limpos para cada aba:
     - **Deck**: Ícone `LayoutGrid` (ou `Grid3X3`) representando os pads do Stream Deck.
     - **Mixer**: Ícone `SlidersHorizontal` (ou `Sliders`) representando áudio e canais.
     - **Soundboard**: Ícone `Volume2` (ou `Disc3` / `Music`) representando efeitos sonoros.
     - **Ajustes**: Ícone `Settings` (ou `SlidersVertical` / `Wrench`) representando opções do app.
   - Design em dock arredondado (`rounded-2xl` / `backdrop-blur-xl`) com superfície translúcida, indicador ativo com micro-luz e relevo sutil.
   - Posicionamento compacto no topo no celular para liberar a área de toque dos botões do deck.
   - Tooltips flutuantes no desktop e feedback tátil ao trocar de aba no celular.

2. **Central de Conexão Plug-and-Play (USB & Wi-Fi)**:
   - **Varredura Automática de Portas**: Varredura instantânea das portas padrão do OBS WebSocket (4455, 4444, 4454) tanto em `localhost` (para USB via ADB reverse) quanto no gateway/IP local do host Wi-Fi detectado.
   - **Auto-Handshake Instantâneo**: Assim que a porta responde com o protocolo OBS WebSocket v5, o app se conecta imediatamente sem exigir cliques adicionais.
   - **Assistente USB com Detecção de Status**: Guia visual com detecção de cabo USB conectado, gerador de comando de encaminhamento automático e modo sem fricção.
   - **Reconexão Transparente em Segundo Plano**: Se o cabo USB for desconectado e reconectado ou o Wi-Fi oscilar, o DeckStream recupera a sessão automaticamente em < 1s.

---

## 2. Mudanças Arquiteturais e Componentes

### A. `src/components/HeaderNav.tsx`
- **Substituição dos botões de texto por ícones táteis**:
  - `deck`: `LayoutGrid` (com badge de página atual ou indicador luminoso).
  - `mixer`: `SlidersHorizontal`.
  - `soundboard`: `Disc3` (com indicador quando houver som tocando).
  - `config`: `Settings`.
- **Estilo Dock de Vidro Fosco**:
  - Container encapsulado em cápsula `bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5`.
  - Botão ativo com realce suave (`bg-white dark:bg-white/15 text-blue-500 dark:text-blue-400 shadow-sm`).
  - Efeito de hover e escala (`active:scale-95 transition-transform`).
- **Otimização para Mobile**:
  - Barra superior enxuta de altura reduzida (`h-12`), mantendo o perfil, o dock central e o status de conexão perfeitamente alinhados sem quebras de linha em celulares estreitos (360px+).

### B. `src/services/obsAutoDiscovery.ts` (Novo Serviço)
- **Engine de Auto-Detecção Plug-and-Play**:
  - Lista de alvos candidatos a conexão:
    1. `localhost:4455` (Padrão USB ADB reverse)
    2. `localhost:4444` (Legado OBS WebSocket v4)
    3. `127.0.0.1:4455`
    4. Hostname atual da janela (`window.location.hostname:4455`)
    5. IPs locais comuns em LAN configuráveis.
  - Provedor de ping WebSocket assíncrono com timeout curto (1000ms por tentativa em paralelo).
  - Ao identificar uma resposta válida com `op: 0` (Hello do OBS v5), dispara a conexão definitiva e armazena os dados validados.

### C. `src/components/ConnectionModal.tsx`
- **Redesenho do Hub de Conexão Plug-and-Play**:
  - Botão de **Varredura Rápida Plug & Play** com feedback visual pulsante em tempo real (mostrando portas sendo testadas: `localhost:4455 [OK]`).
  - Abas inteligentes:
    - **Conexão Rápida / Automática**: Um clique ou ativação automática ao ligar o app, mostrando diagrama animado de cabo USB e Wi-Fi.
    - **Cabo USB Direto**: Passo a passo ultrarrápido com auto-cópia e detecção do handshake `adb reverse`.
    - **Wi-Fi LAN**: Entrada simplificada com detecção automática do IP do computador.
    - **Simulador OBS**: Mantido para testes sem computador por perto.
  - Indicador de latência em milissegundos e taxa de quadros em tempo real quando conectado.

### D. `src/context/OBSContext.tsx`
- Adicionar rotina de **auto-conexão silenciosa na inicialização**:
  - Tenta varrer e conectar automaticamente na última porta bem-sucedida ou na porta 4455.
  - Se o usuário plugar o cabo USB ou abrir o OBS depois do app já aberto, um listener periódico (a cada 3s em background quando desconectado) detecta e conecta sem intervenção manual.

---

## 3. Plano Passo a Passo de Execução

1. **Criação do Serviço de Descoberta Automática (`src/services/obsAutoDiscovery.ts`)**:
   - Implementar método `scanAndConnect()` que testa portas paralelas com timeout e escolhe o canal ativo.
   - Retornar eventos de status para alimentar animações na UI.

2. **Refatoração da `HeaderNav.tsx`**:
   - Substituir os textos de abas por ícones modernos (`LayoutGrid`, `SlidersHorizontal`, `Disc3`, `Settings`).
   - Aplicar o visual de dock de vidro fosco (`backdrop-blur-xl`, bordas sutis e cantos arredondados).
   - Ajustar espaçamento e responsividade para garantir que tudo caiba confortavelmente em telas mobile a partir de 320px de largura.
   - Adicionar atributos `title` e `aria-label` para acessibilidade e tooltips em mouse hover.

3. **Modernização da `ConnectionModal.tsx`**:
   - Implementar visualizador de status de varredura plug-and-play.
   - Adicionar botão de auto-varredura com animação de radar/escaneamento.
   - Exibir feedback claro quando uma conexão via USB ou Wi-Fi for identificada.

4. **Integração no `OBSContext.tsx`**:
   - Integrar suporte a auto-conexão transparente em background.
   - Manter compatibilidade com o simulador e configurações manuais existentes.

5. **Validação & Testes**:
   - Compilação com `compile_applet` e validação com `lint_applet`.
   - Teste de troca de abas via ícones.
   - Teste de simulação e reconexão automática.

---

## 4. Métricas de Sucesso
- Navegação fluida sem textos, com ícones claros e autoexplicativos no dock fosco.
- Mais espaço vertical para os botões do Deck no smartphone.
- Conexão do OBS estabelecida automaticamente ao escanear a porta do cabo USB ou Wi-Fi sem necessidade de preencher formulários complexos.
