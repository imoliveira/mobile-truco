# mobile-truco

Reescrita do Truco-Play como app nativo em React Native (Expo).

## Status: Fase 1 — Scaffold

O que já existe:
- Projeto Expo configurado (`app.json`, `babel.config.js`)
- Navegação (`@react-navigation`) com fluxo de autenticação (Auth → Lobby → Table)
- `SocketProvider` — conexão com o backend via `socket.io-client`, com persistência de sessão via `AsyncStorage` (equivalente ao `localStorage` da versão web)
- `src/game/deck.js` — lógica pura de cartas, portada do backend
- Telas placeholder (`AuthScreen`, `LobbyScreen`, `TableScreen`) só pra validar o fluxo de navegação

O que falta (próximas fases):
- Fase 2: formulário de Auth completo (login/cadastro, máscaras, captcha, login social)
- Fase 3: Lobby completo (mesas, chat, ranking)
- Fase 4: Mesa de jogo (cartas, truco, sinais, animações)
- Fase 5: apontar `EXPO_PUBLIC_BACKEND_URL` pro backend publicado

## Como rodar

```bash
npm install
npx expo start
```

Escaneia o QR code com o app **Expo Go** (Android/iOS) pra testar no celular, ou aperta `w` pra abrir no navegador.

## Variável de ambiente

Cria um arquivo `.env` na raiz com:

```
EXPO_PUBLIC_BACKEND_URL=https://sua-url-do-backend.onrender.com
```

(Enquanto o backend não estiver publicado, o app usa um placeholder e a conexão de socket vai falhar silenciosamente — normal nessa fase.)
