export type ServicePartCreateDto = {
  stock_id: number;
  quantity: number;
  unit_price?: number;
  serial_number?: string | null;
  used_at?: string;
};
