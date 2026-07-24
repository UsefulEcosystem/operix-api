import { env } from '../config/env.js';
import { getModuleCatalog, rolePermissaoMap } from './permissoes.catalog.js';

export type PlanKey = 'free' | 'trial' | 'starter' | 'professional' | 'enterprise';

export type PlanCatalogItem = {
  key: PlanKey;
  label: string;
  description: string;
  module_keys: string[];
  feature_flags: string[];
};

const allModuleKeys = getModuleCatalog().map((module) => module.key);

const planCatalog: PlanCatalogItem[] = [
  {
    key: 'free',
    label: 'Free',
    description: 'Plano básico para manter acesso mínimo após trial vencido.',
    module_keys: ['painel', 'servicos'],
    feature_flags: ['usuarios.basico', 'servicos.basico'],
  },
  {
    key: 'trial',
    label: 'Trial',
    description: 'Trial gratuito de 30 dias com acesso completo.',
    module_keys: allModuleKeys,
    feature_flags: ['trial.acesso-completo', 'usuarios.completo', 'servicos.completo', 'estoque.completo'],
  },
  {
    key: 'starter',
    label: 'Starter',
    description: 'Plano inicial para operação enxuta.',
    module_keys: ['painel', 'servicos', 'status-servico', 'status-pagamento', 'tipos-produto', 'organizacao'],
    feature_flags: ['usuarios.basico', 'servicos.completo'],
  },
  {
    key: 'professional',
    label: 'Professional',
    description: 'Plano recomendado com estoque, vendas e informações do sistema.',
    module_keys: allModuleKeys,
    feature_flags: ['usuarios.completo', 'servicos.completo', 'estoque.completo', 'vendas.completo'],
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    description: 'Plano corporativo preparado para SSO avançado, billing e integrações.',
    module_keys: allModuleKeys,
    feature_flags: ['usuarios.completo', 'servicos.completo', 'estoque.completo', 'vendas.completo', 'sso.enterprise'],
  },
];

function getPlanCatalog() {
  return [...planCatalog];
}

function getPlan(planKey?: string | null): PlanCatalogItem {
  return planCatalog.find((plan) => plan.key === planKey) || planCatalog[0]!;
}

function isTrialActive(tenant: any, now = new Date()) {
  if (env.deploymentMode === 'LOCAL') {
    return false;
  }

  if (tenant?.subscription_status !== 'trialing') {
    return false;
  }

  return tenant?.trial_ends_at ? new Date(tenant.trial_ends_at).getTime() > now.getTime() : false;
}

function getFullAccessPlanContext() {
  const modules = allModuleKeys;
  return {
    plan: getPlan('enterprise'),
    enabled_modules: modules,
    feature_flags: ['local.acesso-completo', 'usuarios.completo', 'servicos.completo', 'estoque.completo', 'vendas.completo', 'sso.enterprise'],
    permission_keys: [...new Set(Object.values(rolePermissaoMap).flat().concat('painel.acesso'))],
    full_access: true,
    trial: {
      active: false,
      ends_at: null,
      days_remaining: null,
    },
  };
}

function buildPlanContext(tenant: any, now = new Date()) {
  if (env.deploymentMode === 'LOCAL') {
    return getFullAccessPlanContext();
  }

  const trialActive = isTrialActive(tenant, now);
  const plan = trialActive ? getPlan('trial') : getPlan(tenant?.plan_key);
  const enabledModules = Array.isArray(tenant?.enabled_modules) && tenant.enabled_modules.length > 0
    ? tenant.enabled_modules
    : plan.module_keys;
  const moduleRoleKeys = getModuleCatalog()
    .filter((module) => enabledModules.includes(module.key))
    .map((module) => module.role_key)
    .filter((roleKey): roleKey is string => Boolean(roleKey));
  const permissionKeys = [...new Set(
    moduleRoleKeys.flatMap((roleKey) => rolePermissaoMap[roleKey] || []).concat('painel.acesso'),
  )];
  const trialEndsAt = tenant?.trial_ends_at || null;
  const daysRemaining = trialActive && trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / 86_400_000))
    : 0;

  return {
    plan,
    enabled_modules: enabledModules,
    feature_flags: plan.feature_flags,
    permission_keys: permissionKeys,
    full_access: trialActive || plan.key === 'enterprise',
    trial: {
      active: trialActive,
      ends_at: trialEndsAt,
      days_remaining: daysRemaining,
    },
  };
}

export {
  buildPlanContext,
  getFullAccessPlanContext,
  getPlan,
  getPlanCatalog,
  isTrialActive,
};
