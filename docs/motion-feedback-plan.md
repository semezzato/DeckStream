# Plano de motion e feedback tátil

## Objetivo

Fazer cada toque parecer imediato e compreensível durante a operação do OBS, sem atrasar comandos, distrair da transmissão ou aumentar o peso da interface. Motion deve explicar estado e resposta; não decorar cada área.

## Princípios

- **Resposta primeiro:** o feedback visual começa no toque; a confirmação do resultado vem do estado real retornado pelo app/OBS.
- **Curto e discreto:** movimentos de pressão ficam entre 80–120 ms; mudanças de estado entre 140–220 ms; entradas/saídas de modal entre 160–240 ms.
- **Leve no navegador:** priorizar `transform` e `opacity`; evitar animação contínua, blur pesado, partículas, spring complexo e dependência adicional.
- **Tato opcional:** usar `navigator.vibrate` apenas após gesto do usuário e quando suportado. A UI precisa continuar clara sem vibração, inclusive no iOS.
- **Acessível:** respeitar `prefers-reduced-motion`, manter foco visível e não comunicar sucesso/erro somente por cor, movimento ou vibração.
- **Sem bloquear:** nenhum efeito deve atrasar ou impedir o comando de OBS.

## Linguagem proposta

| Situação | Feedback visual | Tato sugerido |
|---|---|---|
| Pressionar botão do deck | Redução leve até `scale(0.97)` e retorno rápido; borda/fundo muda no mesmo instante. | Toque curto de 10–20 ms, se disponível. |
| Cena selecionada | Estado ativo permanece evidente; pequeno realce único na confirmação. | Um toque curto. |
| Mute, live ou gravação | Atualizar rótulo/ícone/cor com o estado confirmado; sem pulso infinito. | Toque curto na mudança confirmada. |
| Efeito sonoro | Pressão e indicação enquanto o efeito toca; retorno simples ao terminar. | Um toque curto, sem repetição. |
| Conectando / varredura | Indicador de progresso discreto; animação contínua só enquanto a operação estiver ativa. | Sem vibração contínua. |
| Sucesso / falha de conexão | Mensagem clara e ícone; entrada curta. Erro permanece visível até nova tentativa/fechamento. | Sucesso: toque único; falha: padrão breve duplo, apenas se útil. |
| Abrir/fechar modal | Fade e deslocamento pequeno, sem escala dramática. | Nenhum por padrão. |
| Trocar aba/página | Destaque do destino ativo e transição curta; conteúdo muda imediatamente. | Opcional e leve, nunca necessário para entender a troca. |

## Etapas de implementação

1. **Navbar:** já recebe uma resposta de toque curta (`scale` sutil e transição de 150 ms); movimento e transição são removidos quando `prefers-reduced-motion` está ativo. Indicadores de conexão deixam de pulsar/girar nessa preferência.
2. **Deck:** alinhar o feedback de pressão e estados ativos; garantir que o resultado reflita o estado do OBS, não apenas o clique.
3. **Estados de operação:** padronizar confirmação de cena, mute, live/gravação e conexão; eliminar animação infinita fora de tarefas em andamento.
4. **Modais e mensagens:** padronizar entrada/saída e feedback de sucesso/erro, sem atrasar fechamento ou comandos.
5. **Ajuste em dispositivo:** testar Android com vibração e aparelhos sem suporte; avaliar conforto com usuários durante operação real.

## Critérios de aceite

- Toque recebe resposta visual perceptível sem espera artificial.
- Movimento normal é curto e usa propriedades compostas (`transform`, `opacity`) sempre que possível.
- A opção de movimento reduzido remove deslocamento, escala decorativa e animação contínua sem ocultar o estado.
- Nenhum feedback depende exclusivamente de vibração, cor ou animação.
- Vibração é curta, contextual e não se repete em loops ou enquanto a conexão está pendente.
- Ações repetidas continuam responsivas e não causam flashes persistentes ou mudança de layout.
- Rever em celular em paisagem, tema claro/escuro, conexão real e simulador.

## Estado atual

O deck já chama a API de vibração em interações de botão; suporte e intensidade variam por navegador/dispositivo. A navbar passou a ter indicação ativa mais clara e microfeedback; isso ainda precisa de revisão em aparelho. O restante deste plano está pendente de implementação e validação com usuários.
