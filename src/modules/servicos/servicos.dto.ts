export type ServiceClientUpdateDto = {
  product: string;
  client: string;
  telephone: string;
  adress?: string;
  observation?: string;
  responsible_user_id?: number | null;
};

export type ServiceCreateDto = ServiceClientUpdateDto & {
  status_id: number;
};
