# Frontend - Projeto 2 ES47B (Rick and Morty)

Single-Page Application (SPA) em **React** com **Vite**. Consome a API REST do backend para login, busca e insercao de personagens. Toda a comunicacao com o servidor e feita via requisicoes HTTP (`fetch`).

## Requisitos

- Node.js 18+ (testado com Node 22)
- Backend em execucao (por padrao em `localhost:3001`)

## Instalacao

```bash
npm install
```

## Scripts

```bash
npm run dev       # inicia o servidor de desenvolvimento (Vite) em http://localhost:5173
npm run build     # gera o build de producao + arquivos comprimidos (.gz e .br)
npm run preview   # serve localmente o build de producao
npm run lint      # roda o ESLint
```

## Comunicacao com o backend

As requisicoes sao feitas para `/api`, e o Vite faz proxy para o backend. A configuracao fica em `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'https://localhost:3001',
      changeOrigin: true,
      secure: false, // aceita o certificado HTTPS autoassinado
    },
  },
}
```

Se o backend estiver rodando em HTTP, troque o `target` para `http://localhost:3001`.

## Compressao de arquivos estaticos

O `npm run build` executa o `compress-dist.cjs` apos o build do Vite, gerando versoes `.gz` (gzip) e `.br` (brotli) dos arquivos estaticos em `dist/`.

## Estrutura

```text
frontend/
  index.html
  vite.config.js
  compress-dist.cjs        # compressao gzip/brotli pos-build
  src/
    main.jsx               # ponto de entrada, providers
    App.jsx                # layout e fluxo principal
    index.css
    contexts/
      AuthContext.jsx      # sessao, login e logout
      CharacterContext.jsx # estado de busca e insercao
    components/
      LoginForm.jsx
      SearchForm.jsx
      CharacterForm.jsx
      CharacterList.jsx
      CharacterCard.jsx
      Pagination.jsx
      Loading.jsx
      ErrorMessage.jsx
```

## Funcionalidades

- **Login** com validacao de formulario (`react-hook-form` + `yup`) e sessao guardada no `localStorage`.
- **Busca** autenticada de personagens por nome, status e especie, com paginacao.
- **Insercao** autenticada de novos personagens, com validacao de campos.
- Mensagens de erro e sucesso vindas do backend.

## Usuario de teste

```text
E-mail: rick@citadel.com
Senha: portal123
```