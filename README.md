# mobile-truco

Reescrita do Truco-Play como app nativo em React Native (Expo).

## Status: Fase 3 — Lobby completo

O que já existe:

- Projeto Expo configurado (`app.json`, `babel.config.js`)
- Navegação (`@react-navigation`) com fluxo de autenticação (Auth → Lobby → Table)
- `SocketProvider` — conexão com o backend via `socket.io-client`, com persistência de sessão via
  `AsyncStorage` (equivalente ao `localStorage` da versão web)
- `src/game/deck.js` — lógica pura de cartas, portada do backend
- **`AuthScreen`** completa: login/cadastro, máscaras de CPF/celular, validação de CPF/e-mail,
  captcha matemático, modal de regras, e login social via Google (`expo-auth-session`)
- **`LobbyScreen`** completa: header com avatar/stats/nível, abas Mesas/Chat/Ranking (a versão web
  usa 3 colunas lado a lado, adaptei pra abas porque não cabe tudo de uma vez numa tela de celular),
  criação de mesa, lista de mesas, chat global, ranking Top 10, seletor de avatar
- `TableScreen` ainda é placeholder

O que falta (próximas fases):

- Fase 4: Mesa de jogo (cartas, truco, sinais, animações)
- Fase 5: apontar `EXPO_PUBLIC_BACKEND_URL` pro backend publicado

## Configuração necessária pra você fazer

O login com Google **não funciona ainda** até você configurar:

1. Cria um projeto (ou usa o mesmo do Firebase)
   no [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Cria um **OAuth Client ID** do tipo apropriado pra cada plataforma que for testar (Web, iOS,
   Android) — isso é diferente do client ID que já existe no `firebase.js` da versão web
3. Cola o Client ID no `.env` (veja abaixo)

Sem isso, o botão "Entrar com Google" mostra um erro amigável em vez de travar o app — login por
usuário/senha funciona normalmente assim que o backend estiver publicado.

## Como rodar

```bash
npm install
npx expo start
```

Escaneia o QR code com o app **Expo Go** (Android/iOS) pra testar no celular, ou aperta `w` pra
abrir no navegador.

## Variáveis de ambiente

Cria um arquivo `.env` na raiz com:

```
EXPO_PUBLIC_BACKEND_URL=https://sua-url-do-backend.onrender.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

(Enquanto o backend não estiver publicado, o app usa um placeholder e a conexão de socket/fetch vai
falhar — normal nessa fase.)

## Arquitetura e Hospedagem (Atenção: Vercel)

### 1. Fluxo de Autenticação (Google Sign-In Nativo)
- **SDK Nativo**: O app utiliza `@react-native-google-signin/google-signin`. Ele invoca o Google Play Services nativamente no Android.
- **Geração do Token**: O Play Services valida a chave de assinatura (SHA-1) e retorna um `idToken` (JWT) e dados do perfil (email, foto).
- **Integração com Backend**: O app faz um POST para `/api/auth/social` enviando o token.
- **Sessão Socket**: Após aprovação, o frontend inicia a conexão persistente via WebSocket (`SocketContext.login()`).

### 2. Backend (Node.js, Express e Socket.io)
O backend é um servidor Node.js **stateful** (estado em memória RAM).
- **REST API (Express)**: Resolve ações curtas (`/api/login`, `/api/auth/social`).
- **Tempo Real (Socket.io)**: Toda a partida de Truco flui por uma conexão persistente TCP (WebSockets).
- **Memória**: Estruturas como `tables` e `userStatsMap` vivem na memória RAM. Elas não sobrevivem a reinícios da aplicação.

### 3. Deploy e Limitações do Vercel ⚠️
- **Frontend no Vercel?** Sim, mas apenas a versão Web (HTML/JS estáticos compilados com `npx expo export -p web`). Para o login Google funcionar na Web, você precisa do client OAuth 2.0 de Web configurado no Google Cloud Console com as origens do Vercel.
- **Backend no Vercel? NÃO.** O Vercel usa arquitetura *Serverless* (Funções sem Servidor).
  - **Incompatível com WebSockets**: As funções morrem após responder. Não conseguem manter a conexão contínua exigida pelo Socket.io.
  - **Perda de Memória**: O estado do jogo (`tables`) seria zerado a cada clique, destruindo as salas de Truco ativas constantemente.

#### Onde hospedar o Backend?
Para manter o Socket.io e as variáveis em memória, é necessário um servidor contínuo (VPS ou PaaS Stateful) ligado 24/7:
- **Render.com** (Recomendado, tem plano gratuito para Web Services contínuos)
- **Railway.app** (Ótimo suporte para Node.js e Socket.io)
- **DigitalOcean App Platform** ou **Heroku**
