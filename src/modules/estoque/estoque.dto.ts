export type StockWriteDto = {
  name: string;
  code: string;
  description?: string | null;
  supplier_name?: string | null;
  supplier_id?: number | null;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  warranty_days: number;
};
