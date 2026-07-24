export type SaleItemCreateDto = {
  stock_id: number;
  quantity: number;
  unit_price?: number;
  serial_number?: string | null;
};

export type SaleCreateDto = {
  customer_name: string;
  customer_document?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  sold_at?: string;
  items: SaleItemCreateDto[];
};
