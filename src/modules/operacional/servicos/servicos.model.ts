export default class ServicoModel {
  id: number | null;
  tenant_id: number | null;
  product: string;
  client: string;
  telephone: string;
  adress: string;
  status_id: number | null;
  payment_status_id: number | null;
  order_of_service: number | null;
  observation: string;
  created_at: string | null;
  updated_at_service: string | null;
  updated_at_payment: string | null;

  constructor({
    id = null,
    tenant_id = null,
    product = "",
    client = "",
    telephone = "",
    adress = "",
    status_id = null,
    payment_status_id = null,
    order_of_service = null,
    observation = "",
    created_at = null,
    updated_at_service = null,
    updated_at_payment = null,
  }: any = {}) {
    this.id = id;
    this.tenant_id = tenant_id;
    this.product = product;
    this.client = client;
    this.telephone = telephone;
    this.adress = adress;
    this.status_id = status_id;
    this.payment_status_id = payment_status_id;
    this.order_of_service = order_of_service;
    this.observation = observation;
    this.created_at = created_at;
    this.updated_at_service = updated_at_service;
    this.updated_at_payment = updated_at_payment;
  }

  static deRequisicao(body: any = {}) {
    return new ServicoModel({
      id: body.id || null,
      tenant_id: body.tenant_id || null,
      product: body.product,
      client: body.client,
      telephone: body.telephone,
      adress: body.adress,
      status_id: body.status_id,
      payment_status_id: body.payment_status_id || null,
      order_of_service: body.order_of_service || null,
      observation: body.observation,
      created_at: body.created_at || null,
    });
  }

  static deParametrosRequisicao(params: any = {}) {
    return new ServicoModel({ id: params.id });
  }

  toJSON() {
    return {
      id: this.id,
      tenant_id: this.tenant_id,
      product: this.product,
      client: this.client,
      telephone: this.telephone,
      adress: this.adress,
      status_id: this.status_id,
      payment_status_id: this.payment_status_id,
      order_of_service: this.order_of_service,
      observation: this.observation,
      created_at: this.created_at,
      updated_at_service: this.updated_at_service,
      updated_at_payment: this.updated_at_payment
    };
  }
}
