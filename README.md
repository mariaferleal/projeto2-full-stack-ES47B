# Projeto 2 Full Stack ES47B - Rick and Morty

Aplicacao web em 3 camadas criada a partir do projeto Rick and Morty original:

- `frontend`: SPA em React/Vite.
- `backend`: API REST em Express.
- `PostgreSQL`: banco relacional acessado pelo backend e gerenciavel pelo pgAdmin.

## Funcionalidades

- Login com usuario previamente cadastrado no banco.
- Busca autenticada de personagens no banco local, usando Rick and Morty como tema dos dados.
- Insercao autenticada de personagens locais com campos similares aos da API.
- Validacao de campos no servidor e mensagens de erro para o frontend.
- Senhas criptografadas com `bcryptjs`.
- Tokens JWT com logout por lista de tokens revogados.
- Sanitizacao de entradas, `helmet`, limite de requisicoes, logs de seguranca, HTTPS opcional, compressao e cache em memoria.
- Build do frontend gera arquivos estaticos `.gz` e `.br` para gzip e brotli.
- Pool de conexoes PostgreSQL configurado em `backend/src/config/database.js`.
- Tabelas e dados iniciais tematicos sao criados automaticamente no PostgreSQL para permitir busca antes de novas insercoes.

## Usuario de teste

```text
E-mail: rick@citadel.com
Senha: portal123
```

## Instalar

Na pasta `projeto2-full-stack-ES47B-main`:

```bash
npm run install:all
```

## Configurar PostgreSQL

Crie um banco no PostgreSQL pelo pgAdmin antes de iniciar o backend. O nome sugerido e:

```text
rickandmorty
```

Depois, copie `backend/.env.example` para `backend/.env` e ajuste usuario, senha, host e porta conforme a sua instalacao do PostgreSQL:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/rickandmorty
```

Ao iniciar, o backend cria automaticamente as tabelas `users`, `revoked_tokens` e `characters`, alem do usuario e personagens iniciais.

## HTTPS

Gere certificados locais autoassinados (commonName `localhost`) com:

```bash
npm run certs
```

Isso cria `backend/certs/localhost-key.pem` e `backend/certs/localhost-cert.pem`. Em seguida, habilite no `backend/.env`:

```env
SSL_KEY_PATH=./certs/localhost-key.pem
SSL_CERT_PATH=./certs/localhost-cert.pem
```

Com essas variaveis definidas, o backend sobe em `https://localhost:3001`. O proxy do Vite ja esta configurado para aceitar o certificado autoassinado (`secure: false`). Sem essas variaveis, o backend continua iniciando em HTTP para desenvolvimento local.

## Build do frontend

O build do frontend tambem gera versoes comprimidas dos arquivos estaticos:

```bash
npm run build:frontend
```

Os arquivos `.gz` e `.br` ficam em `frontend/dist`.

## Executar

Em um terminal, inicie o backend:

```bash
npm run dev:backend
```

Em outro terminal, inicie o frontend:

```bash
npm run dev:frontend
```

Depois acesse:

```text
http://localhost:5173
```

## Endpoints principais

- `POST /api/login`
- `POST /api/logout`
- `GET /api/characters/search`
- `GET /api/characters`
- `POST /api/characters`

As rotas de personagens exigem o cabecalho:

```text
Authorization: Bearer <token>
```

## Estrutura

```text
projeto2-full-stack-ES47B-main/
  backend/
    src/
      config/
      models/
      routes/
  frontend/
    src/
      components/
      contexts/
```
