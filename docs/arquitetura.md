# Arquitetura de domínio

## Organização

Os módulos da API representam entidades ou agregados com responsabilidade própria.
Os agrupamentos amplos `inventario`, `operacional` e `configuracoes` foram
eliminados. Estoque, vendas, serviços, peças de serviço, ordens de serviço,
status e tipos de produto possuem módulos independentes.

Perfil, locatários e usuários também são módulos de domínio. O `core` mantém
somente capacidades transversais, como autenticação, permissões, banco,
middlewares e logs. A entidade antes chamada `registros` foi padronizada como
`logs`, inclusive na rota HTTP `/logs`.

`notificacoes` é o nome canônico da entidade, da rota HTTP
`/notificacoes`, da permissão `notificacoes.acesso` e do papel
`modulo:notificacoes`.

## Contratos HTTP

- Schemas Zod permanecem na borda HTTP para validação e documentação OpenAPI.
- DTOs ficam em arquivos `*.dto.ts` fora dos schemas e definem entradas, saídas e
  projeções usadas pelos casos de uso.
- Repositories retornam somente os campos necessários ao contrato ou à regra de
  negócio, evitando expor diretamente o modelo de persistência.
- Peças de serviço pertencem ao agregado de serviço e dependem do estoque apenas
  para consultar e baixar saldo.

## Permissões

As chaves públicas e internas usam português, por exemplo
`servicos.acesso`, `estoque.acesso` e `vendas.acesso`. A migration de
localização converte overrides, módulos habilitados e papéis legados sem perder
configurações existentes.

No modo `LOCAL`, o plano disponibiliza todo o catálogo, mas não ignora as
permissões individuais. Somente proprietário e administrador recebem acesso
completo; usuários internos continuam limitados aos módulos selecionados.

## Acesso interno

Funcionários usam uma credencial composta por código da empresa, nome de usuário
e senha. O código `OPE-XXXX-XXXX` identifica o tenant, enquanto o nome de usuário
é único somente dentro desse tenant. Usuários internos não precisam de e-mail e
não entram no onboarding do proprietário. E-mail permanece como identidade do
responsável para login externo e recuperação de conta.

## Remoções

Garantias foram removidas das rotas, serviços, repositories, schemas, DTOs,
permissões e interface. A migration de limpeza remove tabela e colunas antigas.
A migration histórica que originalmente criou esses objetos mantém seu nome
porque o Sequelize usa o nome do arquivo como identidade da migration; seu
conteúdo foi ajustado para instalações novas.

## Onboarding

O estado de conclusão é persistido em `users.onboarding_completed_at`. A API
expõe `onboarding_required` no usuário sanitizado e o frontend protege a rota
`/onboarding` com esse estado, inclusive depois de renovar a sessão.
