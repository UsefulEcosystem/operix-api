export type AgendaTaskWriteDto = {
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at?: string | null;
  completed?: boolean;
  color?: string;
  service_id?: number | null;
  sale_id?: number | null;
  recurrence_rule?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrence_until?: string | null;
};
