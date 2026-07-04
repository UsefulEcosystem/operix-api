export default class ServicoModel {
  id: number | null;
  tenant_id: number | null;
  product: string;
  client: string;
  telephone: string;
  adress: string;
  status: number | null;
  payment_status: number | null;
  order_of_service: number | null;
  observation: string;
  warehouse_status: boolean;
  created_at: string | null;
  updated_at_service: string | null;
  updated_at_payment: string | null;
  created_at_warehouse: string | null;
  typeTable?: number;

  constructor({ id = null, tenant_id = null, product = '', client = '', telephone = '', adress = '', status = null, payment_status = null, order_of_service = null, observation = '', warehouse_status = false, created_at = null, updated_at_service = null, updated_at_payment = null, created_at_warehouse = null, typeTable = undefined }: any = {}) {
    this.id = id; this.tenant_id = tenant_id; this.product = product; this.client = client;
    this.telephone = telephone; this.adress = adress; this.status = status;
    this.payment_status = payment_status; this.order_of_service = order_of_service;
    this.observation = observation; this.warehouse_status = warehouse_status;
    this.created_at = created_at; this.updated_at_service = updated_at_service;
    this.updated_at_payment = updated_at_payment; this.created_at_warehouse = created_at_warehouse;
    this.typeTable = typeTable;
  }

  static deRequisicao(body: any = {}) {
    return new ServicoModel({ id: body.id || null, tenant_id: body.tenant_id || null, product: body.product, client: body.client, telephone: body.telephone, adress: body.adress, status: body.status, payment_status: body.payment_status || 1, order_of_service: body.order_of_service || null, observation: body.observation, warehouse_status: body.warehouse_status || false, created_at: body.created_at || null, typeTable: body.typeTable });
  }

  static deParametrosRequisicao(params: any = {}) { return new ServicoModel({ id: params.id }); }

  toJSON() { return { id: this.id, tenant_id: this.tenant_id, product: this.product, client: this.client, telephone: this.telephone, adress: this.adress, status: this.status, payment_status: this.payment_status, order_of_service: this.order_of_service, observation: this.observation, warehouse_status: this.warehouse_status, created_at: this.created_at, updated_at_service: this.updated_at_service, updated_at_payment: this.updated_at_payment, created_at_warehouse: this.created_at_warehouse, typeTable: this.typeTable }; }
}
