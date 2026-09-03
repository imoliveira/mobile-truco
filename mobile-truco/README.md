# mobile-truco

Reescrita do Truco-Play como app nativo em React Native (Expo).

## Status: Fase 2 — Tela de Auth completa

O que já existe:

- Projeto Expo configurado (`app.json`, `babel.config.js`)
- Navegação (`@react-navigation`) com fluxo de autenticação (Auth → Lobby → Table)
- `SocketProvider` — conexão com o backend via `socket.io-client`, com persistência de sessão via
  `AsyncStorage` (equivalente ao `localStorage` da versão web)
- `src/game/deck.js` — lógica pura de cartas, portada do backend
- **`AuthScreen` completa**: login/cadastro, máscaras de CPF/celular, validação de CPF/e-mail,
  captcha matemático, modal de regras, e login social via Google (`expo-auth-session`)
- Telas placeholder (`LobbyScreen`, `TableScreen`) só pra validar o fluxo de navegação

O que falta (próximas fases):

- Fase 3: Lobby completo (mesas, chat, ranking)
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
