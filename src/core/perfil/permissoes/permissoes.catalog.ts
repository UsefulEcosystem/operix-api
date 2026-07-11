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

const manageableModuleKeys = ['operational', 'inventory', 'organization', 'notifications'] as const;

const moduleCatalog: ModuleCatalogItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Painel principal com visão consolidada do sistema.',
    role_key: null,
  },
  {
    key: 'operational',
    label: 'Operacional',
    description: 'Fluxos operacionais, parâmetros de atendimento e execução de serviços.',
    role_key: 'module:operational',
  },
  {
    key: 'inventory',
    label: 'Inventário',
    description: 'Gestão de estoque e itens disponíveis para operação.',
    role_key: 'module:inventory',
  },
  {
    key: 'organization',
    label: 'Organização',
    description: 'Estrutura organizacional, usuários e unidades do tenant.',
    role_key: 'module:organization',
  },
  {
    key: 'notifications',
    label: 'Notificações',
    description: 'Informações internas do sistema e futuros canais de notificação.',
    role_key: 'module:notifications',
  },
];

const moduleMap = new Map(moduleCatalog.map((module) => [module.key, module]));

const permissionCatalog: CatalogoPermissaoItem[] = [
  {
    key: 'dashboard.access',
    module_key: 'dashboard',
    module_label: moduleMap.get('dashboard')!.label,
    module_description: moduleMap.get('dashboard')!.description,
    role_key: moduleMap.get('dashboard')!.role_key,
    label: 'Dashboard',
    description: 'Acessar a visão inicial com atalhos, indicadores e contexto geral do tenant.',
    route: '/dashboard',
  },
  {
    key: 'operational.services.access',
    module_key: 'operational',
    module_label: moduleMap.get('operational')!.label,
    module_description: moduleMap.get('operational')!.description,
    role_key: moduleMap.get('operational')!.role_key,
    label: 'Serviços',
    description: 'Visualizar e operar serviços, orçamento e movimentação entre oficina e depósito.',
    route: '/operacional/servicos',
  },
  {
    key: 'operational.status.access',
    module_key: 'operational',
    module_label: moduleMap.get('operational')!.label,
    module_description: moduleMap.get('operational')!.description,
    role_key: moduleMap.get('operational')!.role_key,
    label: 'Situações',
    description: 'Gerenciar status de serviço e status de pagamento utilizados no fluxo operacional.',
    route: '/operacional/situacoes',
  },
  {
    key: 'operational.types-products.access',
    module_key: 'operational',
    module_label: moduleMap.get('operational')!.label,
    module_description: moduleMap.get('operational')!.description,
    role_key: moduleMap.get('operational')!.role_key,
    label: 'Tipos de Produto',
    description: 'Gerenciar os tipos de produtos vinculados aos serviços e atendimentos.',
    route: '/operacional/tipos-de-produto',
  },
  {
    key: 'inventory.stock.access',
    module_key: 'inventory',
    module_label: moduleMap.get('inventory')!.label,
    module_description: moduleMap.get('inventory')!.description,
    role_key: moduleMap.get('inventory')!.role_key,
    label: 'Estoque',
    description: 'Cadastrar, consultar e atualizar itens do estoque.',
    route: '/inventario/estoque',
  },
  {
    key: 'inventory.sales.access',
    module_key: 'inventory',
    module_label: moduleMap.get('inventory')!.label,
    module_description: moduleMap.get('inventory')!.description,
    role_key: moduleMap.get('inventory')!.role_key,
    label: 'Vendas',
    description: 'Registrar vendas avulsas de peças, baixar estoque e gerar garantias vinculadas.',
    route: '/inventario/vendas',
  },
  {
    key: 'inventory.warranties.access',
    module_key: 'inventory',
    module_label: moduleMap.get('inventory')!.label,
    module_description: moduleMap.get('inventory')!.description,
    role_key: moduleMap.get('inventory')!.role_key,
    label: 'Garantias',
    description: 'Consultar garantias geradas por vendas avulsas e peças utilizadas em serviços.',
    route: '/inventario/garantias',
  },
  {
    key: 'organization.users.access',
    module_key: 'organization',
    module_label: moduleMap.get('organization')!.label,
    module_description: moduleMap.get('organization')!.description,
    role_key: moduleMap.get('organization')!.role_key,
    label: 'Usuários',
    description: 'Visualizar, cadastrar e administrar usuários vinculados ao tenant.',
    route: '/configuracoes/usuarios',
  },
  {
    key: 'organization.settings.access',
    module_key: 'organization',
    module_label: moduleMap.get('organization')!.label,
    module_description: moduleMap.get('organization')!.description,
    role_key: moduleMap.get('organization')!.role_key,
    label: 'Configurações',
    description: 'Acessar perfil, empresa, permissões, módulos e contexto do plano.',
    route: '/configuracoes/configuracoes',
  },
  {
    key: 'organization.tenants.access',
    module_key: 'configurations',
    module_label: moduleMap.get('organization')!.label,
    module_description: moduleMap.get('organization')!.description,
    role_key: moduleMap.get('organization')!.role_key,
    label: 'Unidades',
    description: 'Gerenciar as unidades da operação e seus vínculos organizacionais.',
    route: '/configuracoes/unidades',
  },
  {
    key: 'notifications.system-info.access',
    module_key: 'notifications',
    module_label: moduleMap.get('notifications')!.label,
    module_description: moduleMap.get('notifications')!.description,
    role_key: moduleMap.get('notifications')!.role_key,
    label: 'Informações do Sistema',
    description: 'Consultar notificações internas e lembretes operacionais do sistema.',
    route: '/notificacoes/informacoes-do-sistema',
  },
];

const authenticatedPermissaoKeys = ['dashboard.access'];

const rolePermissaoMap: Record<string, string[]> = {
  'module:operational': [
    'operational.services.access',
    'operational.status.access',
    'operational.types-products.access',
  ],
  'module:inventory': ['inventory.stock.access', 'inventory.sales.access', 'inventory.warranties.access'],
  'module:organization': ['organization.users.access', 'organization.settings.access', 'organization.tenants.access'],
  'module:notifications': ['notifications.system-info.access'],
};

const manageableModuleCatalog = moduleCatalog.filter((module) => module.role_key);

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
    (rolePermissaoMap[role] || []).forEach((permission) => permissions.add(permission));
  });

  return [...permissions];
}

function isPermissaoKey(permissionKey: string) {
  return permissionCatalog.some((permission) => permission.key === permissionKey);
}

function obterCatalogooPermissaoItem(permissionKey: string) {
  return permissionCatalog.find((permission) => permission.key === permissionKey) || null;
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
