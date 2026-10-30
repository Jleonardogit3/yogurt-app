export type YogurtFlavor =
  | 'Piña'
  | 'Durazno'
  | 'Fresa'
  | 'Mora'
  | 'Piña con coco'
  | 'Durazno con fresa'
  | 'Piña con fresa'
  | 'Natural';

export const FLAVORS: YogurtFlavor[] = [
  'Piña',
  'Durazno',
  'Fresa',
  'Mora',
  'Piña con coco',
  'Durazno con fresa',
  'Piña con fresa',
  'Natural',
];

export type YogurtSize = '120g' | '350g' | '500g';

export const SIZES: YogurtSize[] = ['120g', '350g', '500g'];

export const SIZE_WEIGHT_MAP: Record<YogurtSize, number> = {
  '120g': 120,
  '350g': 350,
  '500g': 500,
};

export const SIZE_LABELS: Record<YogurtSize, string> = {
  '120g': 'Pequeño (120g)',
  '350g': 'Mediano (350g)',
  '500g': 'Grande (500g)',
};

export interface AppSettings {
  id?: string;
  bcv_rate: number;
  price_120g: number;
  price_350g: number;
  price_500g: number;
  supabase_url?: string;
  supabase_anon_key?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  created_at: string;
}

export interface ProductionBatch {
  id: string;
  batch_code: string;
  prep_date: string;
  notes?: string;
  created_at: string;
}

export interface ProductionItem {
  id: string;
  batch_id: string;
  size: YogurtSize;
  flavor: YogurtFlavor;
  quantity_produced: number;
  quantity_remaining: number;
}

export type ExpenseCategory = 'Yogurts' | 'Casa';

export interface Expense {
  id: string;
  expense_date: string;
  description: string;
  category: ExpenseCategory;
  amount_usd: number;
  bcv_rate_used: number;
  batch_id?: string;
  created_at: string;
}

export type PaymentStatus = 'Pagado' | 'Pendiente';

export interface Sale {
  id: string;
  sale_date: string;
  client_id?: string;
  client_name: string;
  payment_status: PaymentStatus;
  total_usd: number;
  bcv_rate_used: number;
  paid_at?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  batch_id: string;
  production_item_id: string;
  size: YogurtSize;
  flavor: YogurtFlavor;
  quantity: number;
  unit_price_usd: number;
  subtotal_usd: number;
}

export type ActiveModule = 'productions' | 'sales' | 'expenses' | 'clients' | 'cloud';

export interface AppBackupData {
  version: string;
  exported_at: string;
  settings: AppSettings;
  clients: Client[];
  batches: ProductionBatch[];
  productionItems: ProductionItem[];
  expenses: Expense[];
  sales: Sale[];
  saleItems: SaleItem[];
}
