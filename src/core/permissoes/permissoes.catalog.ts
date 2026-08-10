export type ModuleCatalogItem = {
  key: string;
  label: string;
  description: string;
  role_key: string | null;
};

export type CatalogoPermissaoItem = {
  key: string;
  module_key: string;
  module_label: string;
  module_description: string;
  role_key: string | null;
  label: string;
  description: string;
  route: string | null;
};

const manageableModuleKeys = [
  'servicos',
  'status-servico',
  'status-pagamento',
  'tipos-produto',
  'estoque',
  'vendas',
  'ponto',
  'notificacoes',
] as const;

const moduleCatalog: ModuleCatalogItem[] = [
  {
    key: 'painel',
    label: 'Painel',
    description: 'Visão consolidada do sistema.',
    role_key: null,
  },
  {
    key: 'servicos',
    label: 'Serviços',
    description: 'Atendimentos e execução de serviços.',
    role_key: 'modulo:servicos',
  },
  {
    key: 'status-servico',
    label: 'Status de Serviço',
    description: 'Status usados no fluxo dos serviços.',
    role_key: 'modulo:status-servico',
  },
  {
    key: 'status-pagamento',
    label: 'Status de Pagamento',
    description: 'Status usados no acompanhamento de pagamentos.',
    role_key: 'modulo:status-pagamento',
  },
  {
    key: 'tipos-produto',
    label: 'Tipos de Produto',
    description: 'Tipos de produto atendidos pelos serviços.',
    role_key: 'modulo:tipos-produto',
  },
  {
    key: 'estoque',
    label: 'Estoque',
    description: 'Itens e saldos disponíveis.',
    role_key: 'modulo:estoque',
  },
  {
    key: 'vendas',
    label: 'Vendas',
    description: 'Vendas avulsas de itens do estoque.',
    role_key: 'modulo:vendas',
  },
  {
    key: 'organizacao',
    label: 'Organização',
    description: 'Usuários, unidades e dados da organização.',
    role_key: 'modulo:organizacao',
  },
  {
    key: 'notificacoes',
    label: 'Notificações',
    description: 'Alertas e informações internas do sistema.',
    role_key: 'modulo:notificacoes',
  },
  {
    key: 'ponto',
    label: 'Ponto',
    description: 'Registros de jornada e solicitações de ajuste.',
    role_key: 'modulo:ponto',
  },
];

const moduleMap = new Map(moduleCatalog.map((module) => [module.key, module]));

function permission(
  key: string,
  moduleKey: string,
  label: string,
  description: string,
  route: string | null,
): CatalogoPermissaoItem {
  const module = moduleMap.get(moduleKey)!;
  return {
    key,
    module_key: moduleKey,
    module_label: module.label,
    module_description: module.description,
    role_key: module.role_key,
    label,
    description,
    route,
  };
}

const permissionCatalog: CatalogoPermissaoItem[] = [
  permission('painel.acesso', 'painel', 'Painel', 'Acessar a visão inicial do locatário.', '/painel'),
  permission('servicos.acesso', 'servicos', 'Serviços', 'Visualizar e operar serviços e orçamentos.', '/servicos'),
  permission('clientes.acesso', 'servicos', 'Clientes', 'Cadastrar e gerenciar clientes.', '/clientes'),
  permission('status-servico.acesso', 'status-servico', 'Status de Serviço', 'Gerenciar status de serviço.', '/dados-basicos'),
  permission('status-pagamento.acesso', 'status-pagamento', 'Status de Pagamento', 'Gerenciar status de pagamento.', '/dados-basicos'),
  permission('tipos-produto.acesso', 'tipos-produto', 'Tipos de Produto', 'Gerenciar tipos de produto.', '/dados-basicos'),
  permission('estoque.acesso', 'estoque', 'Estoque', 'Cadastrar, consultar e atualizar itens do estoque.', '/estoque'),
  permission('vendas.acesso', 'vendas', 'Vendas', 'Registrar vendas e baixar itens do estoque.', '/vendas'),
  permission('usuarios.acesso', 'organizacao', 'Usuários', 'Administrar usuários do locatário.', '/usuarios'),
  permission('cargos.acesso', 'organizacao', 'Cargos', 'Administrar cargos dos usuários.', '/configuracoes'),
  permission('configuracoes.acesso', 'organizacao', 'Configurações', 'Administrar perfil e dados da empresa.', '/configuracoes'),
  permission('locatarios.acesso', 'organizacao', 'Unidades', 'Administrar unidades da organização.', null),
  permission('fornecedores.acesso', 'estoque', 'Fornecedores', 'Administrar fornecedores e dados de abastecimento.', '/dados-basicos'),
  permission('ponto.acesso', 'ponto', 'Ponto', 'Gerenciar lançamentos e ajustes de ponto.', '/ponto'),
  permission(
    'notificacoes.acesso',
    'notificacoes',
    'Notificações',
    'Consultar alertas internos do sistema.',
    null,
  ),
];

const authenticatedPermissaoKeys = ['painel.acesso'];

const rolePermissaoMap: Record<string, string[]> = {
  'modulo:servicos': ['servicos.acesso', 'clientes.acesso', 'ponto.acesso'],
  'modulo:status-servico': ['status-servico.acesso'],
  'modulo:status-pagamento': ['status-pagamento.acesso'],
  'modulo:tipos-produto': ['tipos-produto.acesso'],
  'modulo:estoque': ['estoque.acesso', 'fornecedores.acesso'],
  'modulo:vendas': ['vendas.acesso', 'clientes.acesso'],
  'modulo:organizacao': ['usuarios.acesso', 'cargos.acesso', 'configuracoes.acesso', 'locatarios.acesso'],
  'modulo:ponto': ['ponto.acesso'],
  'modulo:notificacoes': ['notificacoes.acesso'],
};

const manageableModuleCatalog = moduleCatalog.filter((module) => module.role_key && module.key !== 'organizacao');

function obterCatalogooPermissao() {
  return [...permissionCatalog];
}

function getModuleCatalog() {
  return [...moduleCatalog];
}

function getManageableModuleCatalog() {
  return [...manageableModuleCatalog];
}

function getPermissaoKeysForRoles(roles: string[] = []) {
  const permissions = new Set<string>(authenticatedPermissaoKeys);
  roles.forEach((role) => {
    (rolePermissaoMap[role] || []).forEach((permissionKey) => permissions.add(permissionKey));
  });
  return [...permissions];
}

function isPermissaoKey(permissionKey: string) {
  return permissionCatalog.some((item) => item.key === permissionKey);
}

function obterCatalogooPermissaoItem(permissionKey: string) {
  return permissionCatalog.find((item) => item.key === permissionKey) || null;
}

function getRoleKeyForModule(moduleKey: string) {
  return moduleCatalog.find((module) => module.key === moduleKey)?.role_key || null;
}

export {
  authenticatedPermissaoKeys,
  getManageableModuleCatalog,
  getModuleCatalog,
  obterCatalogooPermissao,
  obterCatalogooPermissaoItem,
  getPermissaoKeysForRoles,
  getRoleKeyForModule,
  isPermissaoKey,
  manageableModuleKeys,
  rolePermissaoMap,
};
