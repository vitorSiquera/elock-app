# elock-app (React Native / Expo)

README com instruções para configurar, executar e entender a aplicação móvel `elock-app`.

## Visão geral

`elock-app` é o aplicativo móvel (Expo / React Native) para gerenciamento de fechaduras (locks). Ele consome a API REST disponível no repositório `elock-api` e fornece telas de autenticação, lista de fechaduras, detalhe da fechadura, compartilhamento e gerenciamento de acessos.

Este projeto não implementa WebSocket/Socket.IO por padrão — a comunicação é via REST/HTTP. Se você precisa de tempo real, há nota na seção "Tempo real" abaixo.

## Requisitos

- Node.js (recomendo v18 ou v20 LTS)
- npm (ou yarn)
- Expo CLI (opcional, pode usar via `npx expo`)
- Emulador Android / Xcode (opcional) ou um dispositivo físico com o app Expo Go

## Dependências principais (versões do `package.json`)

- `expo` ~54.x
- `react` 19.1.0
- `react-native` 0.81.5
- `axios` ^1.13.2
- `@react-navigation/native` ^7.1.20
- `@react-navigation/native-stack` ^7.6.3
- `@react-native-async-storage/async-storage` 2.2.0
- `expo-linear-gradient` ~15.0.7

Consulte `package.json` para a lista completa de dependências e versões.

## Estrutura principal

- `src/` - código TypeScript/React Native
  - `api/` - cliente HTTP (`httpClient.ts`) e módulos para chamadas (`auth`, `doorLocks`, `users`, `doorLockUser`)
  - `navigation/` - `RootNavigator.tsx` com navegação autenticada/guest
  - `screens/` - telas (Auth, Locks, Users, etc.)
  - `context/` - `AuthContext.tsx` para gerenciamento de sessão/usuário
  - `assets/` - imagens e logos

## Configuração local (API URL)

O client usa um `axios` instance em `src/api/httpClient.ts`. Atualize a `baseURL` nesse arquivo para apontar para a API local durante o desenvolvimento.

- Emulador Android (Android Studio): `localhost` do emulador é `10.0.2.2`.
- Emulador Expo (Expo Go / device físico): use o IP local da sua máquina, por exemplo `http://192.168.0.100:8000`.

Exemplo (em `src/api/httpClient.ts`):

```powershell
# abra e ajuste a constante baseURL
# export const http = axios.create({ baseURL: 'http://192.168.0.100:8000' })
```

## Instalação e execução

No Windows PowerShell, a partir da pasta `elock-app`:

```powershell
# instalar dependências
npm install

# iniciar o Metro/Expo
npm start

# iniciar no Android (se tiver emulador/adb conectado)
npm run android

# iniciar no iOS (macOS + Xcode)
npm run ios

# iniciar web
npm run web
```

Se preferir yarn:

```powershell
yarn
yarn start
```

Para reiniciar o cache do Expo (útil em caso de erros estranhos):

```powershell
npx expo start -c
```

## Autenticação e armazenamento

- A autenticação usa JWT. O fluxo implementado no app é: `POST /auth/login` → receber `access_token` → `setAuthToken()` no cliente HTTP → `GET /auth/profile` para buscar dados do usuário.
- O token é armazenado (memória/contexto) e `AsyncStorage` é usado para persistência, conforme implementado em `src/context/AuthContext.tsx`.

## Tela de Locks e atualização

- A lista de fechaduras (`LocksListScreen`) faz fetch via `GET /door-locks` quando a tela é exibida (usa `useFocusEffect`) — ou seja, ela recarrega automaticamente ao entrar na tela.








