# Opeflow API

API REST do Opeflow para autenticação, multi-tenancy, RBAC, módulos, planos, trial, gestão operacional, estoque, notificações e configurações organizacionais.

---

## 🚀 Como Iniciar (Setup Rápido)

### Pré-requisitos
- **Bun** (`>=1.3.9`)
- **Docker** e **Docker Compose**

### Passo a Passo
```bash
# 1. Clone o repositório e acesse a pasta
cd opeflow-api

# 2. Configure as variáveis de ambiente
cp .env.example .env

# 3. Instale as dependências
bun install

# 4. Suba o banco de dados PostgreSQL
bun run docker:dev

# 5. Execute as migrations do banco
bun run migrate

# 6. Inicie o servidor de desenvolvimento
bun run dev
```

- **API:** `http://localhost:3333`
- **Saúde:** `http://localhost:3333/saude`
- **Documentação OpenAPI:** `http://localhost:3333/docs`

---

## 🔐 Fluxo de Autenticação e Onboarding

O fluxo de autenticação foi reestruturado para ser previsível, seguro e com criação imediata de Tenants:

```
       [ Acesso do Usuário ]
                 │
        { Forma de Acesso? }
         /                \
 [ Continuar c/ Google ]  [ Continuar c/ E-mail ]
        │                           │
  (Valida Token)              (Verifica existência)
        │                           │
  { Novo Usuário? }           { Novo Usuário? }
   /             \             /             \
 (Sim)          (Não)        (Sim)          (Não)
   │              │            │              │
(Cria Tenant   (Cria       (Cria Tenant   (Login Direto)
 Placeholder   Sessão)     Placeholder     
 e Usuário)       │        e Usuário)
   │              │            │
   └──────┬───────┘            │
          │                    │
(Retorna Sessão)         (Retorna Sessão)
          │                    │
(Frontend: vai           (Frontend: vai
 para /onboarding)        para /onboarding)
```

- **Criação do Tenant:** O tenant é provisionado imediatamente com dados temporários (derivados do e-mail). O usuário já possui contexto de tenant desde o primeiro momento.
- **Onboarding Simplificado:** O onboarding tornou-se uma etapa visual de `UPDATE` com campos opcionais. Se o usuário pular, a conta continua funcional com os dados padrões.
- **Estado Persistido:** A API retorna `onboarding_required` no usuário sanitizado. O frontend usa esse estado em todas as sessões e a conclusão fica registrada em `onboarding_completed_at`.

---

## 🛠️ Scripts e Testes

### Scripts Disponíveis
- `bun run dev` - API com auto-reload (watch mode)
- `bun run start` - Inicia a API normalmente
- `bun run build` - Gera a build do projeto em `dist/`
- `bun run typecheck` - Validação de tipos do TypeScript
- `bun run lint` - Análise estática do código (ESLint)
- `bun run migrate` - Roda migrations pendentes
- `bun run seed` - Popula o banco com sementes de teste

### Executando os Testes
Os testes utilizam o **Bun Test** para máxima velocidade.
```bash
# Executar todos os testes
bun run test

# Executar apenas testes de integração
bun run test:integration

# Executar apenas testes unitários
bun run test:unit
```

---

## 🐞 Guia de Depuração no VS Code

Preparamos configurações específicas para depuração rápida no VS Code em ambos os projetos.

### A) Depurando a API (`opeflow-api`)
Abra a aba **Run and Debug (Ctrl+Shift+D)** e selecione:
1. **Debug API (Bun):** Inicializa a API localmente com o Bun no modo de inspeção (`--inspect-brk`), pausando na primeira linha do código.
2. **Attach API (Bun :6499):** Conecta o depurador do VS Code a um processo Bun já em execução (docker, terminal externo, etc) que exponha a porta `6499`.

### B) Depurando o Frontend (`opeflow-app`)
1. Inicie o servidor de desenvolvimento no terminal do frontend (`npm run dev`).
2. No VS Code do frontend, selecione a configuração **Debug App (Chrome)** e clique no Play. Isso permite que você coloque breakpoints diretamente no seu código `.vue` e `.js` no VS Code.

> [!TIP]
> **Dicas de Produtividade:**
> - Coloque breakpoints clicando na margem esquerda da linha no VS Code.
> - Passe o mouse sobre qualquer variável com o código pausado para ver o seu valor.
> - Use a aba **Debug Console** para avaliar expressões JS em tempo real.

---

## 📂 Estrutura do Projeto

```text
src/
  core/
    autenticacao/          Login local, Google OAuth, JWT, refresh e onboarding
    config/                Ambiente e modo de implantação
    database/              Pool PostgreSQL
    docs/                  OpenAPI agregado
    logs/                  Logs operacionais por tenant
    middlewares/           Auth, permissões, roles, segurança, erros e validação
    permissoes/            Catálogo, planos, policy e overrides de acesso
    schemas/               Schemas de resposta e helpers Zod/OpenAPI
    utils/                 Sanitização, respostas, mensageria e validação
  database/
    migrations/            Evolução do schema PostgreSQL
  modules/
    perfil/                Perfil pessoal e configurações da empresa
    locatarios/            Tenants, política LOCAL/SAAS e assinatura
    usuarios/              Usuários internos e administração de acesso
    estoque/               Itens e saldos disponíveis
    vendas/                Vendas avulsas
    servicos/              Atendimentos e execução
    pecas-servico/         Peças consumidas em serviços
    ordens-servico/        Orçamentos e ordens de serviço
    status-servico/        Catálogo de status de serviço
    status-pagamento/      Catálogo de status de pagamento
    tipos-produto/         Catálogo de tipos de produto
    notificacoes/          Alertas internos do sistema
tests/
  unit/                    Policies, permissões, onboarding e services
  integration/             Rotas HTTP principais
```

Cada módulo de domínio mantém rotas, controller, service, repository, schemas de
validação HTTP e DTOs de contrato próprios. As decisões da refatoração estão em
[`docs/arquitetura.md`](docs/arquitetura.md).

---

## ⚙️ Variáveis de Ambiente (.env)

| Variável | Descrição | Exemplo Padrão |
|----------|-----------|----------------|
| `DEPLOYMENT_MODE` | Modo da API (`LOCAL` ou `SAAS`) | `LOCAL` |
| `DATABASE_URL` | String de conexão do PostgreSQL | `postgresql://admin:admin@localhost:5432/opeflow` |
| `FRONTEND_URL` | URL de origem do painel frontend | `http://localhost:5173` |
| `JWT_SECRET` | Segredo de assinatura de Tokens | `change-this-secret-in-production` |
| `ACCESS_TOKEN_TTL_SECONDS` | Tempo de expiração do Token de Acesso | `900` (15 min) |
| `REFRESH_TOKEN_TTL_DAYS` | Tempo de expiração do Token de Renovação | `30` |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | (Opcional se local) |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth | (Opcional se local) |

---

## 🛡️ Segurança e Regras do Backend

- **Sessão por Cookie:** O refresh token é enviado exclusivamente por cookie `HttpOnly`, `SameSite=Lax` e `Secure` (em prod), protegendo a renovação de tokens contra ataques XSS.
- **Revogação & Blacklist:** O logout invalida ativamente o refresh token no banco de dados e adiciona o token JWT de acesso em uma lista negra temporária.
- **Isolamento de Tenants:** O banco de dados e as consultas filtram rigorosamente por `tenant_id` nas rotas autenticadas.
- **Modo LOCAL vs SAAS:**
  - `LOCAL`: Permite apenas um tenant. Se já configurado, novas criações de empresas são bloqueadas por locks de advisory. Todos os módulos e recursos ficam totalmente liberados.
  - `SAAS`: Permite múltiplos tenants. O acesso a recursos depende do plano contratado e regras de assinatura/trial (30 dias padrão).

---

## 🔍 Troubleshooting (Solução de Problemas)

- **Erro `onboarding bloqueado`:** Se a API está configurada em modo `LOCAL`, ela bloqueia a criação de novos tenants caso já exista um registrado. Delete ou reinicie o banco se deseja refazer o onboarding.
- **Token Expirado:** Chame o endpoint `/api/autenticacao/renovar` enviando cookies para rotacionar seu token.
- **CORS:** Certifique-se de que a variável `ORIGIN` no `.env` contém exatamente o domínio e porta do seu frontend.
- **Erro 400 invalid_request no Google:** Garanta que a URL de redirecionamento no console do desenvolvedor Google é exatamente `http://localhost:3000/oauth/callback.html` (para local) ou `https://seu-dominio/oauth/callback.html` (para produção).
