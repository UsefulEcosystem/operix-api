export type SaleItemCreateDto = {
  stock_id: number;
  quantity: number;
  unit_price?: number;
  serial_number?: string | null;
  warranty_days?: number;
};

export type SaleCreateDto = {
  attendant_user_id?: number | null;
  client_id?: number | null;
  customer_name: string;
  customer_document?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  sold_at?: string;
  items: SaleItemCreateDto[];
};
