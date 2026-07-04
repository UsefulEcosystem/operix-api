# Operix Service API

API REST do Operix Service para autenticação, multi-tenancy, RBAC, módulos, planos, trial, gestão operacional, estoque, notificações e configurações organizacionais.

## Visão Geral

O backend é o ponto central de segurança e regra de negócio. Ele emite e valida JWT próprio, mantém refresh tokens opacos em cookie HttpOnly, resolve o tenant do usuário, aplica permissões granulares e protege todas as rotas privadas independentemente do frontend.

Responsabilidades principais:

- autenticação local com usuário/senha;
- autenticação social Google via OAuth/OIDC direto;
- access token JWT curto e refresh token opaco com rotação obrigatória;
- logout com revogação de refresh token e blacklist de access token até expirar;
- criação e isolamento de tenants;
- RBAC com roles locais e overrides granulares por usuário;
- políticas de modo `LOCAL` e `SAAS`;
- plano/trial/feature flags;
- rotas operacionais, estoque, notificações, logs e perfil;
- documentação OpenAPI em `/docs`.

## Arquitetura

```text
src/
  core/
    autenticacao/          Login local, Google OAuth, JWT, refresh e onboarding
    config/                Ambiente e modo de implantação
    database/              Pool PostgreSQL
    docs/                  OpenAPI agregado
    registros/             Logs operacionais por tenant
    middlewares/           Auth, permissões, roles, segurança, erros e validação
    perfil/
      permissoes/          Catálogo de módulos, permissões, planos, trial e overrides
      locatarios/          Tenants, política LOCAL/SAAS, empresa e assinatura
      usuarios/            Usuários do tenant, RBAC e acesso administrativo
    schemas/               Schemas de resposta e helpers Zod/OpenAPI
    utils/                 Sanitização, respostas, mensageria e validação
  database/
    migrations/            Evolução do schema PostgreSQL
  modules/
    inventario/            Estoque
    notificacoes/          Informações e alertas do sistema
    operacional/           Serviços, OS, status e tipos de produto
tests/
  unit/                    Policies, permissões, onboarding e services
  integration/             Rotas HTTP principais
```

## Autenticação

Fluxos disponíveis:

- `POST /api/autenticacao/onboarding`: cria o primeiro tenant e o usuário proprietário.
- `POST /api/autenticacao/login`: autentica por e-mail/usuário e senha.
- `POST /api/autenticacao/autorizar`: gera URL Google OAuth com PKCE.
- `POST /api/autenticacao/retorno`: troca o `code` Google por sessão local.
- `POST /api/autenticacao/renovar`: rotaciona refresh token e emite novo access token.
- `POST /api/autenticacao/sair`: revoga refresh token e coloca o access token em blacklist.
- `GET /api/autenticacao/eu`: retorna usuário, permissões efetivas e snapshot de acesso.

Contrato de sessão:

- o access token é retornado no JSON como `token`;
- o refresh token não é retornado no JSON;
- o refresh token é enviado em cookie `HttpOnly`, `SameSite=Lax`, `Secure` em produção;
- clientes web devem manter o access token em memória e chamar refresh com credenciais/cookies habilitados.

## Modos de Implantação

`DEPLOYMENT_MODE=LOCAL`

- permite apenas um tenant;
- após o primeiro tenant, onboarding/cadastro de empresa fica bloqueado;
- proprietário/root tem acesso completo;
- planos, cobrança e assinatura não bloqueiam recursos;
- todos os módulos ficam habilitados.

Google OAuth:

- o `redirect_uri` cadastrado no Google Cloud precisa ser um callback HTML real, sem fragmento `#`;
- ambiente local: `http://localhost:3000/oauth/callback.html`;
- produção: `https://seu-dominio/oauth/callback.html`;
- o callback HTML redireciona para `#/auth/callback` dentro do SPA.

`DEPLOYMENT_MODE=SAAS`

- permite múltiplos tenants;
- permissões dependem de plano, trial, roles locais e overrides;
- trial gratuito dura 30 dias;
- trial ativo libera acesso completo;
- trial vencido cai para o plano configurado, atualmente `free` por padrão.

## Ambiente Local

Pré-requisitos:

- Bun `>=1.3.9`;
- Docker;
- Docker Compose.

Setup:

```bash
cp .env.example .env
bun install
bun run docker:dev
bun run migrate
bun run dev
```

URLs:

- API: `http://localhost:3333`;
- health: `http://localhost:3333/saude`;
- docs: `http://localhost:3333/docs`.

Variáveis principais:

```env
APP_NAME=Operix Service
PORT=3333
NODE_ENV=development
ORIGIN=http://localhost:3000,http://localhost:5173
DEPLOYMENT_MODE=LOCAL
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://admin:admin@localhost:5432/operix-service
JWT_SECRET=change-this-secret-in-production
JWT_ISSUER=operix-service-api
JWT_AUDIENCE=operix-service-app
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_DAYS=30
REFRESH_COOKIE_NAME=operix_refresh_token
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Scripts

- `bun run dev`: API com watch;
- `bun run start`: API normal;
- `bun run build`: bundle em `dist/`;
- `bun run typecheck`: TypeScript;
- `bun run lint`: ESLint;
- `bun run test`: todos os testes;
- `bun run test:unit`: unitários;
- `bun run test:integration`: integração;
- `bun run migrate`: migrations;
- `bun run seed`: seeds;
- `bun run docker:dev`: compose local;
- `bun run docker:prod`: compose produção.

## Testes

Comandos recomendados:

```bash
bun run typecheck
bun run test
bun run build
```

Alguns testes de integração usam `supertest` com porta dinâmica e podem falhar em sandboxes que bloqueiam `listen(0)`.

## Segurança

- JWT local validado por issuer, audience, assinatura HS256 e `jti`;
- refresh token opaco persistido somente como hash;
- rotação obrigatória de refresh token;
- logout revoga refresh token e invalida access token até sua expiração;
- rotas privadas passam por auth global;
- permissões são validadas no backend;
- isolamento por `tenant_id`;
- respostas de usuário passam por sanitização;
- criação de tenant em `LOCAL` usa advisory lock.

## Troubleshooting

- `Token expirado`: chame `/api/autenticacao/renovar` com cookies habilitados.
- `Refresh token inválido ou expirado`: faça login novamente.
- `onboarding bloqueado`: em `LOCAL`, já existe tenant.
- `sem permissão`: confira `/api/permissoes/eu`, roles locais e overrides.
- `Google não abre`: confira `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e redirect URI no Google Cloud.
- `Erro 400 invalid_request no Google`: confirme que o `redirect_uri` cadastrado é exatamente `http://localhost:3000/oauth/callback.html` em local ou `https://seu-dominio/oauth/callback.html` em produção; não use `#/auth/callback`.
- `CORS`: ajuste `ORIGIN` e envie cookies pelo frontend.
- `migration falha`: confira ordem das migrations e banco definido em `DATABASE_URL`.
