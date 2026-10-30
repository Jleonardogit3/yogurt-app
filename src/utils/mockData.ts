import type {
  AppSettings,
  Client,
  ProductionBatch,
  ProductionItem,
  Expense,
  Sale,
  SaleItem,
  AppBackupData,
} from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  bcv_rate: 44.50,
  price_120g: 1.50,
  price_350g: 3.50,
  price_500g: 5.00,
  updated_at: new Date().toISOString(),
};

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c-1', name: 'María Gómez', phone: '+58 412 1234567', created_at: '2026-10-15T09:00:00Z' },
  { id: 'c-2', name: 'Carlos Mendoza', phone: '+58 424 7654321', created_at: '2026-10-15T10:30:00Z' },
  { id: 'c-3', name: 'Valeria Rivas', phone: '+58 414 9988776', created_at: '2026-10-16T14:15:00Z' },
  { id: 'c-4', name: 'Roberto Díaz', phone: '+58 416 3322114', created_at: '2026-10-17T11:00:00Z' },
  { id: 'c-5', name: 'Elena Fernández', phone: '+58 412 5554433', created_at: '2026-10-18T16:20:00Z' },
];

export const INITIAL_BATCHES: ProductionBatch[] = [
  {
    id: 'batch-01',
    batch_code: 'Lote #01 - 15 Oct',
    prep_date: '2026-10-15',
    notes: 'Tanda inicial con leche pasteurizada doble crema',
    created_at: '2026-10-15T08:00:00Z',
  },
  {
    id: 'batch-02',
    batch_code: 'Lote #02 - 18 Oct',
    prep_date: '2026-10-18',
    notes: 'Producción de fin de semana con pulpa natural de fresa y durazno',
    created_at: '2026-10-18T07:30:00Z',
  },
];

export const INITIAL_PRODUCTION_ITEMS: ProductionItem[] = [
  // Lote 01
  {
    id: 'pi-101',
    batch_id: 'batch-01',
    size: '500g',
    flavor: 'Fresa',
    quantity_produced: 12,
    quantity_remaining: 3,
  },
  {
    id: 'pi-102',
    batch_id: 'batch-01',
    size: '500g',
    flavor: 'Durazno',
    quantity_produced: 10,
    quantity_remaining: 4,
  },
  {
    id: 'pi-103',
    batch_id: 'batch-01',
    size: '350g',
    flavor: 'Mora',
    quantity_produced: 15,
    quantity_remaining: 5,
  },
  {
    id: 'pi-104',
    batch_id: 'batch-01',
    size: '120g',
    flavor: 'Natural',
    quantity_produced: 20,
    quantity_remaining: 8,
  },
  {
    id: 'pi-105',
    batch_id: 'batch-01',
    size: '500g',
    flavor: 'Piña con coco',
    quantity_produced: 8,
    quantity_remaining: 2,
  },

  // Lote 02
  {
    id: 'pi-201',
    batch_id: 'batch-02',
    size: '500g',
    flavor: 'Fresa',
    quantity_produced: 16,
    quantity_remaining: 16,
  },
  {
    id: 'pi-202',
    batch_id: 'batch-02',
    size: '350g',
    flavor: 'Durazno con fresa',
    quantity_produced: 14,
    quantity_remaining: 14,
  },
  {
    id: 'pi-203',
    batch_id: 'batch-02',
    size: '350g',
    flavor: 'Piña',
    quantity_produced: 12,
    quantity_remaining: 10,
  },
  {
    id: 'pi-204',
    batch_id: 'batch-02',
    size: '120g',
    flavor: 'Piña con fresa',
    quantity_produced: 25,
    quantity_remaining: 21,
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  // Yogurts (Negocio)
  {
    id: 'exp-1',
    expense_date: '2026-10-14',
    description: 'Leche entera de cantina (30 Litros)',
    category: 'Yogurts',
    amount_usd: 24.00,
    bcv_rate_used: 44.50,
    batch_id: 'batch-01',
    created_at: '2026-10-14T10:00:00Z',
  },
  {
    id: 'exp-2',
    expense_date: '2026-10-14',
    description: 'Frutas frescas seleccionadas (Fresa, Durazno, Mora)',
    category: 'Yogurts',
    amount_usd: 16.50,
    bcv_rate_used: 44.50,
    batch_id: 'batch-01',
    created_at: '2026-10-14T11:30:00Z',
  },
  {
    id: 'exp-3',
    expense_date: '2026-10-15',
    description: 'Envases sellables 500g y 350g con tapas (50 unds)',
    category: 'Yogurts',
    amount_usd: 11.20,
    bcv_rate_used: 44.50,
    created_at: '2026-10-15T09:15:00Z',
  },
  {
    id: 'exp-4',
    expense_date: '2026-10-17',
    description: 'Cultivos probióticos y azúcar refinada 5kg',
    category: 'Yogurts',
    amount_usd: 8.50,
    bcv_rate_used: 44.50,
    batch_id: 'batch-02',
    created_at: '2026-10-17T15:00:00Z',
  },

  // Casa (Gastos Personales)
  {
    id: 'exp-home-1',
    expense_date: '2026-10-15',
    description: 'Compra de víveres del hogar / mercado familiar',
    category: 'Casa',
    amount_usd: 52.00,
    bcv_rate_used: 44.50,
    created_at: '2026-10-15T18:00:00Z',
  },
  {
    id: 'exp-home-2',
    expense_date: '2026-10-18',
    description: 'Recibo mensual de servicio eléctrico residencial',
    category: 'Casa',
    amount_usd: 14.00,
    bcv_rate_used: 44.50,
    created_at: '2026-10-18T19:00:00Z',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    sale_date: '2026-10-16',
    client_id: 'c-1',
    client_name: 'María Gómez',
    payment_status: 'Pagado',
    total_usd: 13.50,
    bcv_rate_used: 44.50,
    paid_at: '2026-10-16T12:00:00Z',
    created_at: '2026-10-16T11:45:00Z',
  },
  {
    id: 'sale-2',
    sale_date: '2026-10-17',
    client_id: 'c-2',
    client_name: 'Carlos Mendoza',
    payment_status: 'Pendiente', // Cuenta por cobrar
    total_usd: 15.00,
    bcv_rate_used: 44.50,
    created_at: '2026-10-17T10:10:00Z',
  },
  {
    id: 'sale-3',
    sale_date: '2026-10-17',
    client_id: 'c-3',
    client_name: 'Valeria Rivas',
    payment_status: 'Pagado',
    total_usd: 10.00,
    bcv_rate_used: 44.50,
    paid_at: '2026-10-17T17:00:00Z',
    created_at: '2026-10-17T16:30:00Z',
  },
  {
    id: 'sale-4',
    sale_date: '2026-10-19',
    client_id: 'c-4',
    client_name: 'Roberto Díaz',
    payment_status: 'Pendiente', // Cuenta por cobrar
    total_usd: 13.00,
    bcv_rate_used: 44.50,
    created_at: '2026-10-19T09:20:00Z',
  },
];

export const INITIAL_SALE_ITEMS: SaleItem[] = [
  // Venta 1 (María Gómez - Pagado)
  {
    id: 'si-1',
    sale_id: 'sale-1',
    batch_id: 'batch-01',
    production_item_id: 'pi-101',
    size: '500g',
    flavor: 'Fresa',
    quantity: 2,
    unit_price_usd: 5.00,
    subtotal_usd: 10.00,
  },
  {
    id: 'si-2',
    sale_id: 'sale-1',
    batch_id: 'batch-01',
    production_item_id: 'pi-103',
    size: '350g',
    flavor: 'Mora',
    quantity: 1,
    unit_price_usd: 3.50,
    subtotal_usd: 3.50,
  },

  // Venta 2 (Carlos Mendoza - Pendiente)
  {
    id: 'si-3',
    sale_id: 'sale-2',
    batch_id: 'batch-01',
    production_item_id: 'pi-101',
    size: '500g',
    flavor: 'Fresa',
    quantity: 3,
    unit_price_usd: 5.00,
    subtotal_usd: 15.00,
  },

  // Venta 3 (Valeria Rivas - Pagado)
  {
    id: 'si-4',
    sale_id: 'sale-3',
    batch_id: 'batch-01',
    production_item_id: 'pi-102',
    size: '500g',
    flavor: 'Durazno',
    quantity: 2,
    unit_price_usd: 5.00,
    subtotal_usd: 10.00,
  },

  // Venta 4 (Roberto Díaz - Pendiente)
  {
    id: 'si-5',
    sale_id: 'sale-4',
    batch_id: 'batch-02',
    production_item_id: 'pi-203',
    size: '350g',
    flavor: 'Piña',
    quantity: 2,
    unit_price_usd: 3.50,
    subtotal_usd: 7.00,
  },
  {
    id: 'si-6',
    sale_id: 'sale-4',
    batch_id: 'batch-02',
    production_item_id: 'pi-204',
    size: '120g',
    flavor: 'Piña con fresa',
    quantity: 4,
    unit_price_usd: 1.50,
    subtotal_usd: 6.00,
  },
];

export function getInitialBackupData(): AppBackupData {
  return {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    settings: INITIAL_SETTINGS,
    clients: [],
    batches: [],
    productionItems: [],
    expenses: [],
    sales: [],
    saleItems: [],
  };
}
