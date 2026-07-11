export default class StatusPagamentoModel {
  id: number | null;
  tenant_id: number | null;
  description: string;
  color: string;
  is_default: boolean;

  constructor({
    id = null,
    tenant_id = null,
    description = "",
    color = "",
    is_default = false,
  }: any = {}) {
    this.id = id;
    this.tenant_id = tenant_id;
    this.description = description;
    this.color = color;
    this.is_default = is_default;
  }

  static deRequisicao(body: any = {}) {
    return new StatusPagamentoModel({
      id: body.id || null,
      tenant_id: body.tenant_id || null,
      description: body.description,
      color: body.color,
      is_default: body.default ?? false,
    });
  }

  static deParametrosRequisicao(params: any = {}) {
    return new StatusPagamentoModel({ id: params.id });
  }

  toJSON() {
    return {
      id: this.id,
      tenant_id: this.tenant_id,
      description: this.description,
      color: this.color,
      is_default: this.is_default,
    };
  }
}
