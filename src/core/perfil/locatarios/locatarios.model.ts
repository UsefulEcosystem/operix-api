export default class LocatarioModel {
  id: number | null;
  name: string;
  cnpj?: string | null;
  description?: string | null;
  logo_url?: string | null;
  plan_key?: string | null;
  subscription_status?: string | null;
  trial_started_at?: string | Date | null;
  trial_ends_at?: string | Date | null;
  enabled_modules?: string[] | null;

  constructor(
    { id = null,
      name = '',
      cnpj = null,
      description = null,
      logo_url = null,
      plan_key = null,
      subscription_status = null,
      trial_started_at = null,
      trial_ends_at = null,
      enabled_modules = null,
    }: any = {}) {
    this.id = id;
    this.name = name;
    this.cnpj = cnpj;
    this.description = description;
    this.logo_url = logo_url;
    this.plan_key = plan_key;
    this.subscription_status = subscription_status;
    this.trial_started_at = trial_started_at;
    this.trial_ends_at = trial_ends_at;
    this.enabled_modules = enabled_modules;
  }

  static deRequisicao(body: any = {}) {
    return new LocatarioModel({
      id: body.id || null,
      name: body.name,
      cnpj: body.cnpj || null,
      description: body.description || null,
      logo_url: body.logo_url || null,
      plan_key: body.plan_key || null,
      subscription_status: body.subscription_status || null,
      trial_started_at: body.trial_started_at || null,
      trial_ends_at: body.trial_ends_at || null,
      enabled_modules: body.enabled_modules || null,
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      cnpj: this.cnpj,
      description: this.description,
      logo_url: this.logo_url,
      plan_key: this.plan_key,
      subscription_status: this.subscription_status,
      trial_started_at: this.trial_started_at,
      trial_ends_at: this.trial_ends_at,
      enabled_modules: this.enabled_modules,
    };
  }
}
