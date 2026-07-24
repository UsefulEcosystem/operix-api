export type StockWriteDto = {
  name: string;
  code: string;
  description?: string | null;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
};
