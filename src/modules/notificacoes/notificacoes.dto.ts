export type NotificationDto = {
  id: number;
  product: string;
  client: string;
  telephone: string;
  order_of_service: number | null;
  created_at: string;
  status_id: number | null;
  days: number;
};
