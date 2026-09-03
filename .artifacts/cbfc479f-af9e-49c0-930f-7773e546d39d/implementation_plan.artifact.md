# Fase 4: Implementação da Mesa de Jogo (Truco)

Esta fase transformará o placeholder atual da `TableScreen` em uma mesa funcional, com visualização de cartas, controle de turno e interação com o servidor via Socket.

## User Review Required

> [!IMPORTANT]
> A implementação assume um backend que segue o padrão de eventos do Socket.io para Truco (ex: `play_card`, `request_truco`). Se o seu backend usar nomes de eventos diferentes, precisaremos ajustar.

## Proposed Changes

### 1. Componentes de UI

#### [NEW] [Card.js](file:///C:/Users/ivanzito/Documents/ivanzito/github/mobile-truco/src/components/Card.js)
Componente para renderizar uma carta individual.
- Mostrará o valor (4, 5, 6...) e o naipe (Zap, Copas...).
- Estilo "cartão" com bordas arredondadas e cores baseadas no naipe.
- Suporte a estado "selecionado" ou "desabilitado".

#### [NEW] [PlayerSlot.js](file:///C:/Users/ivanzito/Documents/ivanzito/github/mobile-truco/src/components/PlayerSlot.js)
Representação de um jogador na mesa.
- Avatar, nome e indicador de "sua vez".
- Posicionamento dinâmico baseado na quantidade de jogadores (1x1, 2x2).

#### [NEW] [GameControls.js](file:///C:/Users/ivanzito/Documents/ivanzito/github/mobile-truco/src/components/GameControls.js)
Botões de ação rápida.
- Botão "Truco!" (muda para "Retruco", "Vale 9" conforme o estado).
- Botão "Fugir" (Recusar Truco / Abandonar mão).
- Botão "Esconder" (Jogar carta virada).

### 2. Tela de Jogo

#### [MODIFY] [TableScreen.js](file:///C:/Users/ivanzito/Documents/ivanzito/github/mobile-truco/src/screens/TableScreen.js)
Reescrita completa para gerenciar o estado do jogo.
- **Estado Local**: `hand` (minhas cartas), `tableCards` (cartas jogadas), `score` (pontos da partida), `turn` (quem joga), `trucoState` (valor atual da mão).
- **Socket Listeners**:
    - `game_start`: Inicializa a rodada.
    - `deal_cards`: Recebe as 3 cartas iniciais.
    - `player_action`: Atualiza quando alguém joga ou pede truco.
    - `round_end`: Mostra quem ganhou a vaza.
- **Layout**: Fundo verde de feltro, cartas no centro, controles na parte inferior.

## Verification Plan

### Manual Verification
1. Abrir dois emuladores (ou um emulador e o celular físico).
2. No Lobby, criar uma mesa 1x1.
3. Entrar com ambos os usuários.
4. Verificar se as cartas são distribuídas.
5. Testar jogar uma carta e ver se ela aparece para o outro jogador.
6. Testar o botão de Truco e a resposta (Aceitar/Correr).
