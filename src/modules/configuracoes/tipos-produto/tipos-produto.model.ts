export default class TiposProdutoModel {
  id: number | null; tenant_id: number | null; name: string;

  constructor({ id = null, tenant_id = null, name = '' }: any = {}) {
    this.id = id; this.tenant_id = tenant_id; this.name = name;
  }

  static deRequisicao(body: any = {}) { return new TiposProdutoModel({ id: body.id || null, tenant_id: body.tenant_id || null, name: body.name }); }
  static deParametrosRequisicao(params: any = {}) { return new TiposProdutoModel({ id: params.id }); }
  toJSON() { return { id: this.id, tenant_id: this.tenant_id, name: this.name }; }
}
