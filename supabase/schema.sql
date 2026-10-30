-- =========================================================================
-- ESQUEMA SQL PARA SUPABASE (POSTGRESQL) - YOGURT MANAGER APP
-- =========================================================================

-- 1. Tabla de Configuración (Tasa BCV y Precios Base Editables)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bcv_rate NUMERIC(12,2) NOT NULL DEFAULT 44.50,
  price_120g NUMERIC(10,2) NOT NULL DEFAULT 1.50,
  price_350g NUMERIC(10,2) NOT NULL DEFAULT 3.50,
  price_500g NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  supabase_url TEXT,
  supabase_anon_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Lotes de Producción (Cabecera)
CREATE TABLE IF NOT EXISTS production_batches (
  id TEXT PRIMARY KEY,
  batch_code TEXT NOT NULL,
  prep_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Ítems por Lote de Producción (Detalle y Stock)
CREATE TABLE IF NOT EXISTS production_items (
  id TEXT PRIMARY KEY,
  batch_id TEXT REFERENCES production_batches(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('120g', '350g', '500g')),
  flavor TEXT NOT NULL,
  quantity_produced INTEGER NOT NULL CHECK (quantity_produced > 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0)
);

-- 5. Tabla de Gastos (Negocio Yogurts vs Casa Personal)
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Yogurts', 'Casa')),
  amount_usd NUMERIC(12,2) NOT NULL,
  bcv_rate_used NUMERIC(12,2) NOT NULL,
  batch_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Ventas / Ingresos (Cabecera)
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  sale_date DATE NOT NULL,
  client_id TEXT REFERENCES clients(id),
  client_name TEXT NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Pagado', 'Pendiente')),
  total_usd NUMERIC(12,2) NOT NULL,
  bcv_rate_used NUMERIC(12,2) NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla de Detalle de Venta (Conectada al Lote de Producción)
CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES production_batches(id),
  production_item_id TEXT REFERENCES production_items(id),
  size TEXT NOT NULL,
  flavor TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_usd NUMERIC(10,2) NOT NULL,
  subtotal_usd NUMERIC(12,2) NOT NULL
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_production_items_batch ON production_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
