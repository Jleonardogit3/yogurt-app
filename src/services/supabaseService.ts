import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AppBackupData } from '../types';

let cachedClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = customUrl || (import.meta.env.VITE_SUPABASE_URL as string);
  const key = customKey || (import.meta.env.VITE_SUPABASE_ANON_KEY as string);

  if (!url || !key) {
    return null;
  }

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Error instanciando Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient(url, key);
  if (!client) {
    return {
      success: false,
      message: 'Faltan credenciales (URL o Anon Key) para conectar con Supabase.',
    };
  }

  try {
    const { error } = await client.from('app_settings').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        success: false,
        message: `Error de conexión: ${error.message} (Código: ${error.code})`,
      };
    }
    return {
      success: true,
      message: '¡Conexión exitosa con Supabase PostgreSQL!',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Fallo al verificar conexión: ${msg}`,
    };
  }
}

export async function syncLocalToSupabase(
  data: AppBackupData,
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient(url, key);
  if (!client) {
    return {
      success: false,
      message: 'No hay credenciales válidas de Supabase configuradas.',
    };
  }

  try {
    // 1. Settings
    if (data.settings) {
      await client.from('app_settings').upsert({
        id: data.settings.id || '00000000-0000-0000-0000-000000000001',
        bcv_rate: data.settings.bcv_rate,
        price_120g: data.settings.price_120g,
        price_350g: data.settings.price_350g,
        price_500g: data.settings.price_500g,
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Clients
    if (data.clients && data.clients.length > 0) {
      await client.from('clients').upsert(
        data.clients.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone || null,
          created_at: c.created_at,
        }))
      );
    }

    // 3. Production Batches
    if (data.batches && data.batches.length > 0) {
      await client.from('production_batches').upsert(
        data.batches.map((b) => ({
          id: b.id,
          batch_code: b.batch_code,
          prep_date: b.prep_date,
          notes: b.notes || null,
          created_at: b.created_at,
        }))
      );
    }

    // 4. Production Items
    if (data.productionItems && data.productionItems.length > 0) {
      await client.from('production_items').upsert(
        data.productionItems.map((pi) => ({
          id: pi.id,
          batch_id: pi.batch_id,
          size: pi.size,
          flavor: pi.flavor,
          quantity_produced: pi.quantity_produced,
          quantity_remaining: pi.quantity_remaining,
        }))
      );
    }

    // 5. Expenses
    if (data.expenses && data.expenses.length > 0) {
      await client.from('expenses').upsert(
        data.expenses.map((e) => ({
          id: e.id,
          expense_date: e.expense_date,
          description: e.description,
          category: e.category,
          amount_usd: e.amount_usd,
          bcv_rate_used: e.bcv_rate_used,
          created_at: e.created_at,
        }))
      );
    }

    // 6. Sales
    if (data.sales && data.sales.length > 0) {
      await client.from('sales').upsert(
        data.sales.map((s) => ({
          id: s.id,
          sale_date: s.sale_date,
          client_id: s.client_id || null,
          client_name: s.client_name,
          payment_status: s.payment_status,
          total_usd: s.total_usd,
          bcv_rate_used: s.bcv_rate_used,
          paid_at: s.paid_at || null,
          created_at: s.created_at,
        }))
      );
    }

    // 7. Sale Items
    if (data.saleItems && data.saleItems.length > 0) {
      await client.from('sale_items').upsert(
        data.saleItems.map((si) => ({
          id: si.id,
          sale_id: si.sale_id,
          batch_id: si.batch_id,
          production_item_id: si.production_item_id,
          size: si.size,
          flavor: si.flavor,
          quantity: si.quantity,
          unit_price_usd: si.unit_price_usd,
          subtotal_usd: si.subtotal_usd,
        }))
      );
    }

    return {
      success: true,
      message: 'Sincronización a la nube completada con éxito.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Error al subir datos a Supabase: ${msg}`,
    };
  }
}
