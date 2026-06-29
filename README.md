# Operix Service API

API REST do Operix Service para autenticação, multi-tenancy, RBAC, módulos, planos, trial, gestão operacional, estoque, notificações e configurações organizacionais.

## Visão Geral

O backend é o ponto central de segurança e regra de negócio. Ele valida tokens Keycloak via JWKS, resolve o tenant do usuário, aplica permissões granulares, calcula módulos habilitados por plano/trial/modo de implantação e protege todas as rotas privadas independentemente do frontend.

Responsabilidades principais:

- autenticação via Keycloak e SSO Google;
- onboarding de empresa após primeiro login;
- criação e isolamento de tenants;
- RBAC com roles de módulo e overrides granulares por usuário;
- políticas de modo `LOCAL` e `SAAS`;
- plano/trial/feature flags;
- rotas operacionais, estoque, notificações, logs e profile;
- documentação OpenAPI em `/docs`.

Comunicação:

- frontend chama a API em `/api/*`;
- API valida JWT emitido pelo Keycloak;
- API usa PostgreSQL para dados locais;
- API usa Keycloak Admin API para grupos, usuários e roles;
- Socket.IO publica eventos por sala `tenant_<id>`.

## Arquitetura

```text
src/
  core/
    auth/                  Autenticação, callback OIDC, refresh, onboarding e integração Keycloak
    config/                Ambiente e modo de implantação
    database/              Pool PostgreSQL
    docs/                  OpenAPI agregado
    logs/                  Logs operacionais por tenant
    middlewares/           Auth, permissões, roles, segurança, erros e validação
    profile/
      permissions/         Catálogo de módulos, permissões, planos, trial e overrides
      tenants/             Tenants, policy LOCAL/SAAS, empresa e assinatura
      users/               Usuários do tenant, RBAC e acesso administrativo
      profile-settings.*   Perfil, empresa e sistema
    schemas/               Schemas de resposta e helpers Zod/OpenAPI
    utils/                 Sanitização, respostas, messaging e validação
  database/
    migrations/            Evolução do schema PostgreSQL
  modules/
    inventory/             Estoque
    notifications/         Informações e alertas do sistema
    operational/           Serviços, OS, status e tipos de produto
tests/
  unit/                    Policies, permissões, onboarding e services
  integration/             Rotas HTTP principais
```

Padrões usados:

- `controller`: HTTP e resposta;
- `service`: regra de negócio;
- `repository`: persistência;
- `schema`: validação de entrada;
- `middleware`: autenticação/autorização transversal;
- `catalog/policy`: regras estáveis e reutilizáveis.

## Fluxo de Autenticação e Cadastro

Existe um único fluxo de cadastro de empresa:

1. usuário acessa o app;
2. frontend inicia login Google via Keycloak usando Authorization Code + PKCE;
3. backend troca `code` por tokens em `/api/auth/callback`;
4. backend valida o token pelo JWKS;
5. se o usuário não tem tenant, retorna `onboarding_required`;
6. frontend exibe onboarding;
7. `/api/auth/onboarding` cria tenant, grupo Keycloak, usuário local proprietário e roles;
8. usuário passa a acessar o sistema com permissões calculadas.

O endpoint público legado `/api/auth/register` foi removido para evitar duplicidade. Usuários internos da empresa são criados por administradores em `/api/users`.

## Modos de Implantação

`DEPLOYMENT_MODE=LOCAL`

- permite apenas um tenant;
- após o primeiro tenant, onboarding/cadastro de empresa fica bloqueado;
- proprietário/root tem acesso completo;
- planos, cobrança e assinatura não bloqueiam recursos;
- todos os módulos ficam habilitados.

`DEPLOYMENT_MODE=SAAS`

- permite múltiplos tenants;
- permissões dependem de plano, trial, roles e overrides;
- trial gratuito dura 30 dias;
- trial ativo libera acesso completo;
- trial vencido cai para o plano configurado, atualmente `free` por padrão.

## Planos, Trial e Feature Flags

Catálogo em `src/core/profile/permissions/plans.catalog.ts`:

- `free`: acesso básico;
- `trial`: acesso completo por 30 dias;
- `starter`: operação e organização;
- `professional`: operação, organização, estoque e notificações;
- `enterprise`: acesso completo e base para SSO corporativo.

Cada plano define:

- `module_keys`;
- `feature_flags`;
- permissões máximas permitidas.

O snapshot efetivo do usuário fica em `/api/permissions/me`:

```json
{
  "effective_permissions": ["dashboard.access"],
  "access": {
    "enabled_modules": ["dashboard", "operational"],
    "feature_flags": ["users.basic"],
    "trial": { "active": true, "days_remaining": 30 }
  }
}
```

## RBAC e Permissões

Roles de módulo:

- `module:operational`;
- `module:inventory`;
- `module:organization`;
- `module:notifications`.

Permissões granulares atuais:

- `dashboard.access`;
- `operational.services.access`;
- `operational.status.access`;
- `operational.types-products.access`;
- `inventory.stock.access`;
- `organization.users.access`;
- `organization.settings.access`;
- `organization.tenants.access`;
- `notifications.system-info.access`.

Regras:

- frontend esconde menus sem permissão;
- backend sempre valida com `PermissionsMiddleware.requirePermission`;
- overrides por usuário podem permitir/negar permissões dentro dos limites do plano;
- em `LOCAL`, proprietário/root tem full access.

## Profile e Configurações

Rotas:

- `GET /api/profile/me`;
- `PATCH /api/profile/me`;
- `GET /api/profile/company`;
- `PATCH /api/profile/company`;
- `GET /api/profile/system`.

Cobrem:

- perfil: nome, email, avatar, cargo, preferências;
- empresa: nome, CNPJ, descrição, logo, módulos;
- sistema: plano, trial, feature flags, permissões e catálogo.

## Ambiente Local

Pré-requisitos:

- Bun `>=1.3.9`;
- Docker;
- Docker Compose;
- PostgreSQL via compose;
- Keycloak via compose.

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
- health: `http://localhost:3333/health`;
- docs: `http://localhost:3333/docs`;
- Keycloak: `http://localhost:8080`;
- PgAdmin: conforme compose.

Variáveis principais:

```env
APP_NAME=operix-service
PORT=3333
NODE_ENV=development
ORIGIN=http://localhost:3000,http://localhost:5173
DEPLOYMENT_MODE=LOCAL
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://admin:admin@localhost:5432/operix-service
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=operix-service
KEYCLOAK_CLIENT_ID=operix-service-app
KEYCLOAK_JWKS_URI=http://localhost:8080/realms/operix-service/protocol/openid-connect/certs
KEYCLOAK_ISSUER=http://localhost:8080/realms/operix-service
```

Keycloak:

- importe `config/realm-export.json`;
- configure o Identity Provider Google com alias `google`;
- configure redirect URI do frontend;
- mantenha o client público com PKCE `S256`.
- o client `operix-admin-client` precisa da service account com roles de `realm-management` como `query-groups`, `manage-groups`, `query-users` e `manage-users`;
- se o volume do Keycloak já existir, recrie o ambiente para reimportar o realm atualizado: `docker compose -f compose.yaml down -v` e depois `bun run docker:dev`.

- Em desenvolvimento, crie o certificado localmente para acessar o keycloak com https
``` 
mkdir certs

openssl req \
  -x509 \
  -nodes \
  -newkey rsa:4096 \
  -days 365 \
  -keyout certs/keycloak.key \
  -out certs/keycloak.crt \
  -subj "/CN=localhost"
```

## SaaS e Produção

Checklist recomendado:

- `DEPLOYMENT_MODE=SAAS`;
- Keycloak externo ou clusterizado;
- PostgreSQL gerenciado com backups automáticos;
- reverse proxy com Nginx, Traefik ou ingress;
- HTTPS obrigatório;
- `ORIGIN` restrito aos domínios reais;
- segredos fora do repositório;
- rotação de credenciais Keycloak/Admin;
- logs centralizados;
- métricas de API, banco e fila futura;
- migrations versionadas no deploy;
- healthcheck no orquestrador;
- backups testados;
- hardening de headers e rate limit na borda;
- CI/CD com typecheck, testes, build e migrações controladas.

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

Cobertura atual relevante:

- onboarding com Keycloak;
- restrição de tenant em `LOCAL`;
- permissões e overrides;
- plano/trial;
- queda para plano free após trial;
- typecheck e build.

Comandos:

```bash
bun run typecheck
bun test tests/unit/auth.service.test.ts tests/unit/tenant-policy.service.test.ts tests/unit/permissions.service.test.ts
bun run build
```

Observação: alguns testes de integração usam `supertest` com porta dinâmica e podem falhar em sandboxes que bloqueiam `listen(0)`.

## Segurança

- JWT validado por issuer e JWKS;
- token sem tenant só acessa onboarding/me;
- rotas privadas passam por auth global;
- permissões validadas no backend;
- isolamento por `tenant_id`;
- respostas de usuário passam por sanitização;
- criação de tenant em `LOCAL` usa advisory lock;
- rollback remove tenant/grupo quando onboarding falha;
- senha não é persistida localmente;
- login social é delegado ao Keycloak.

## Troubleshooting

- `Token inválido`: confira `KEYCLOAK_ISSUER`, realm e relógio dos containers.
- `onboarding bloqueado`: em `LOCAL`, já existe tenant.
- `sem permissão`: confira `/api/permissions/me`, roles Keycloak e overrides.
- `Google não abre`: confirme alias `google` no Keycloak.
- `CORS`: ajuste `ORIGIN`.
- `migration falha`: confira ordem e banco definido em `DATABASE_URL`.

## Roadmap

- billing com gateway de pagamento;
- upgrade/downgrade de planos;
- webhooks de pagamento;
- auditoria detalhada por entidade;
- analytics de uso por tenant;
- PWA/mobile;
- SSO corporativo SAML/OIDC enterprise;
- white-label por tenant;
- marketplace de módulos;
- API pública com tokens por integração;
- filas assíncronas para notificações e relatórios;
- dashboards avançados;
- observabilidade com tracing;
- rate limiting por tenant;
- feature toggles operacionais;
- automações de atendimento;
- IA para resumo de OS, sugestões e classificação;
- permissões avançadas por escopo, campo e ação.
