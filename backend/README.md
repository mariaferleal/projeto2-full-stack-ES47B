# Backend - Projeto 2 ES47B (Rick and Morty)

API REST em **Express.js** com acesso direto ao **PostgreSQL**. Responsavel pelo login, pela busca e pela insercao de personagens, alem das regras de seguranca, cache e compressao de respostas.

## Requisitos

- Node.js 18+ (testado com Node 22)
- PostgreSQL em execucao

## Instalacao

```bash
npm install
```

## Configuracao

Copie `.env.example` para `.env` e ajuste os valores conforme a sua instalacao:

```env
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=troque-esta-chave
JWT_EXPIRES_IN=2h

# HTTPS (opcional) - gere com "npm run certs"
SSL_KEY_PATH=./certs/localhost-key.pem
SSL_CERT_PATH=./certs/localhost-cert.pem

# Banco de dados
PGHOST=localhost
PGPORT=5432
PGDATABASE=rickandmorty
PGUSER=postgres
PGPASSWORD=sua-senha
DB_POOL_SIZE=10
CACHE_TTL_MS=60000
```

Ao iniciar, o backend cria automaticamente o banco (se nao existir), as tabelas `users`, `revoked_tokens` e `characters`, e popula um usuario e personagens iniciais.

## Scripts

```bash
npm run dev     # inicia com hot-reload (node --watch)
npm start       # inicia em modo producao
npm run certs   # gera certificados HTTPS autoassinados em ./certs
```

## HTTPS

```bash
npm run certs
```

Gera `certs/localhost-key.pem` e `certs/localhost-cert.pem`. Com `SSL_KEY_PATH` e `SSL_CERT_PATH` definidos no `.env`, o servidor sobe em `https://localhost:3001`. Sem essas variaveis, sobe em HTTP.

## Usuario de teste

```text
E-mail: rick@citadel.com
Senha: portal123
```

## Endpoints

| Metodo | Rota | Autenticado | Descricao |
|---|---|---|---|
| POST | `/api/login` | Nao | Autentica e retorna um token JWT |
| POST | `/api/logout` | Sim | Revoga o token atual |
| GET | `/api/characters` | Sim | Lista todos os personagens locais |
| GET | `/api/characters/search` | Sim | Busca por `name`, `status`, `species` e `page` |
| POST | `/api/characters` | Sim | Insere um novo personagem |

Rotas autenticadas exigem o cabecalho:

```text
Authorization: Bearer <token>
```

## Exemplos de requisicao

Os exemplos usam `https://localhost:3001` com a flag `-k` do `curl` (necessaria por causa do certificado autoassinado). Se o backend estiver em HTTP, troque para `http://localhost:3001` e remova o `-k`.

### 1. Login (obter o token)

```bash
curl -k -X POST https://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rick@citadel.com","password":"portal123"}'
```

Resposta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "name": "Rick Sanchez", "email": "rick@citadel.com" }
}
```

### 2. Buscar personagens

```bash
curl -k "https://localhost:3001/api/characters/search?name=rick&status=alive&page=1" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Listar todos os personagens

```bash
curl -k https://localhost:3001/api/characters \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Inserir um personagem

```bash
curl -k -X POST https://localhost:3001/api/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Pickle Rick",
    "status": "alive",
    "species": "Human",
    "origin": "Earth (C-137)",
    "image": "https://rickandmortyapi.com/api/character/avatar/265.jpeg",
    "notes": "Rick transformado em picles."
  }'
```

### 5. Logout (revoga o token)

```bash
curl -k -X POST https://localhost:3001/api/logout \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

> Dica: para encadear login e busca automaticamente, capture o token em uma variavel (Linux/macOS):
>
> ```bash
> TOKEN=$(curl -ks -X POST https://localhost:3001/api/login \
>   -H "Content-Type: application/json" \
>   -d '{"email":"rick@citadel.com","password":"portal123"}' | jq -r .token)
>
> curl -k "https://localhost:3001/api/characters" -H "Authorization: Bearer $TOKEN"
> ```

## Estrutura

```text
backend/
  server.js              # configuracao do Express, middlewares e bootstrap
  generate-certs.js      # geracao de certificados HTTPS locais
  src/
    routes/              # rotas + controladores (auth.js, characters.js)
    models/              # acesso ao banco (User, Session, Character)
    config/              # database (pool), cache e logger
```

## Seguranca

- **Senhas** com hash `bcryptjs`.
- **HTTPS** via certificados locais (opcional).
- **SQL Injection**: queries parametrizadas.
- **XSS**: `validator.escape` nas entradas + `helmet`.
- **Forca bruta**: `express-rate-limit`.
- **Sessao**: revogacao de token JWT no logout (tabela `revoked_tokens`).
- **Logs de seguranca**: `logSecurityEvent` registra login, busca, insercao, logout e erros.

## Otimizacao

- **Compressao de respostas** com `compression()`.
- **Cache** em memoria com TTL na busca, invalidado a cada insercao.
- **Pool de conexoes** PostgreSQL configuravel via `DB_POOL_SIZE`.