export type ServiceClientUpdateDto = {
  product: string;
  client: string;
  telephone: string;
  adress?: string;
  observation?: string;
};

export type ServiceCreateDto = ServiceClientUpdateDto & {
  status_id: number;
};
