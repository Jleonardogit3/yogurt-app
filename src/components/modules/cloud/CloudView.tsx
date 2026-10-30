import React, { useState } from 'react';
import {
  Cloud,
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  HardDrive,
  Settings,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { downloadJson, downloadCsv } from '../../../utils/exportCsv';
import { syncLocalToSupabase, testSupabaseConnection } from '../../../services/supabaseService';
import type { AppBackupData } from '../../../types';

export const CloudView: React.FC = () => {
  const {
    settings,
    batches,
    productionItems,
    expenses,
    sales,
    saleItems,
    clients,
    restoreBackup,
    setOpenSettingsModal,
  } = useApp();

  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [copiedSql, setCopiedSql] = useState(false);
  const isCloudConfigured = Boolean(settings.supabase_url && settings.supabase_anon_key);

  const currentAppData: AppBackupData = {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    settings,
    clients,
    batches,
    productionItems,
    expenses,
    sales,
    saleItems,
  };

  // 1. Export JSON
  const handleExportJson = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadJson(`respaldo_yogurt_app_${timestamp}`, currentAppData);
  };

  // 2. Import JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.settings && parsed.batches) {
          if (confirm('¿Restaurar estos datos? Se sobrescribirá el estado actual en tu dispositivo.')) {
            restoreBackup(parsed as AppBackupData);
            alert('¡Respaldo restaurado con éxito!');
          }
        } else {
          alert('El archivo no contiene un formato válido de respaldo de YogurtApp.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Test Connection
  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    const res = await testSupabaseConnection(settings.supabase_url, settings.supabase_anon_key);
    setTestStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  // 4. Sync to Supabase
  const handleSyncToSupabase = async () => {
    setSyncStatus({ loading: true });
    const res = await syncLocalToSupabase(
      currentAppData,
      settings.supabase_url,
      settings.supabase_anon_key
    );
    setSyncStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  // 5. CSV Exports
  const handleExportSalesCsv = () => {
    const headers = [
      'ID Venta',
      'Fecha',
      'Cliente',
      'Estado',
      'Total USD',
      'Tasa BCV',
      'Fecha Cobro',
    ];
    const rows = sales.map((s) => [
      s.id,
      s.sale_date,
      s.client_name,
      s.payment_status,
      s.total_usd,
      s.bcv_rate_used,
      s.paid_at || '',
    ]);
    downloadCsv(`ventas_yogurt_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportInventoryCsv = () => {
    const headers = [
      'Lote',
      'Fecha Lote',
      'Tamaño',
      'Sabor',
      'Cantidad Producida',
      'Cantidad Disponible',
    ];
    const rows = productionItems.map((pi) => {
      const b = batches.find((batch) => batch.id === pi.batch_id);
      return [
        b ? b.batch_code : pi.batch_id,
        b ? b.prep_date : '',
        pi.size,
        pi.flavor,
        pi.quantity_produced,
        pi.quantity_remaining,
      ];
    });
    downloadCsv(`inventario_lotes_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportExpensesCsv = () => {
    const headers = ['ID', 'Fecha', 'Descripción', 'Categoría', 'Monto USD', 'Tasa BCV'];
    const rows = expenses.map((e) => [
      e.id,
      e.expense_date,
      e.description,
      e.category,
      e.amount_usd,
      e.bcv_rate_used,
    ]);
    downloadCsv(`gastos_yogurt_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExportClientsCsv = () => {
    const headers = ['ID', 'Nombre', 'Teléfono', 'Fecha Registro'];
    const rows = clients.map((c) => [c.id, c.name, c.phone || '', c.created_at]);
    downloadCsv(`clientes_yogurt_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const sqlSchemaText = `-- Script de Tablas para Supabase PostgreSQL (schema.sql)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bcv_rate NUMERIC(12,2) NOT NULL DEFAULT 44.50,
  price_120g NUMERIC(10,2) NOT NULL DEFAULT 1.50,
  price_350g NUMERIC(10,2) NOT NULL DEFAULT 3.50,
  price_500g NUMERIC(10,2) NOT NULL DEFAULT 5.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_batches (
  id TEXT PRIMARY KEY,
  batch_code TEXT NOT NULL,
  prep_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_items (
  id TEXT PRIMARY KEY,
  batch_id TEXT REFERENCES production_batches(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  flavor TEXT NOT NULL,
  quantity_produced INTEGER NOT NULL CHECK (quantity_produced > 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0)
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Yogurts', 'Casa')),
  amount_usd NUMERIC(12,2) NOT NULL,
  bcv_rate_used NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

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
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Nube, Respaldos y Exportación
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Arquitectura híbrida: almacenamiento Local-First inmediato y sincronización con Supabase PostgreSQL
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setOpenSettingsModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition-all"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Configurar Credenciales</span>
        </button>
      </div>

      {/* Tarjeta de Estado del Almacenamiento Local */}
      <Card className="bg-gradient-to-br from-white to-indigo-50/20 border-l-4 border-l-indigo-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Almacenamiento Local Inmediato (Local-First)
              </h3>
              <p className="text-xs text-slate-500">
                Toda la información reside de forma segura y ultrarrápida en la memoria de tu navegador.
              </p>
            </div>
          </div>

          <Badge variant="indigo" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Operativo 100% Offline
          </Badge>
        </div>

        {/* Resumen de Datos Locales */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tandas / Lotes</span>
            <span className="text-lg font-black text-slate-900">{batches.length}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ítems en Stock</span>
            <span className="text-lg font-black text-slate-900">{productionItems.length}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ventas</span>
            <span className="text-lg font-black text-slate-900">{sales.length}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gastos</span>
            <span className="text-lg font-black text-slate-900">{expenses.length}</span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Clientes</span>
            <span className="text-lg font-black text-slate-900">{clients.length}</span>
          </div>
        </div>
      </Card>

      {/* Sincronización Supabase Cloud */}
      <Card className="border-l-4 border-l-purple-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Sincronización en la Nube (Supabase PostgreSQL)
                </h3>
                {isCloudConfigured ? (
                  <Badge variant="emerald" size="sm">Configurado</Badge>
                ) : (
                  <Badge variant="amber" size="sm">Sin credenciales</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isCloudConfigured
                  ? `Conectado al proyecto: ${settings.supabase_url}`
                  : 'Ingresa tu VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para habilitar respaldo en la nube.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testStatus.loading || !isCloudConfigured}
              className="px-3 py-1.5 rounded-xl border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus.loading ? 'animate-spin' : ''}`} />
              Probar Conexión
            </button>

            <button
              onClick={handleSyncToSupabase}
              disabled={syncStatus.loading || !isCloudConfigured}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Upload className={`w-3.5 h-3.5 ${syncStatus.loading ? 'animate-bounce' : ''}`} />
              {syncStatus.loading ? 'Subiendo...' : 'Subir a Supabase'}
            </button>
          </div>
        </div>

        {/* Mensajes de Estado */}
        {testStatus.message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-3 ${
              testStatus.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {testStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{testStatus.message}</span>
          </div>
        )}

        {syncStatus.message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-3 ${
              syncStatus.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {syncStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{syncStatus.message}</span>
          </div>
        )}
      </Card>

      {/* Respaldos Manuales y Exportación CSV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Respaldo Completo JSON */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-4 h-4 text-rose-500" />
            <h4 className="text-sm font-extrabold text-slate-900">
              Copia de Seguridad Completa (JSON)
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Descarga o restaura un archivo único con todos tus lotes, stock, ventas, clientes y gastos.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handleExportJson}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Respaldo .JSON
            </button>

            <label className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar desde .JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </Card>

        {/* Exportación a Hojas de Cálculo CSV */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-extrabold text-slate-900">
              Exportar Tablas a Excel (.CSV)
            </h4>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Genera hojas de cálculo compatibles con Excel con caracteres especiales y acentos en español.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportSalesCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 font-bold text-xs transition-all text-left flex items-center justify-between"
            >
              <span>Ventas</span>
              <Download className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={handleExportInventoryCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 font-bold text-xs transition-all text-left flex items-center justify-between"
            >
              <span>Lotes y Stock</span>
              <Download className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={handleExportExpensesCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 font-bold text-xs transition-all text-left flex items-center justify-between"
            >
              <span>Gastos</span>
              <Download className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={handleExportClientsCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 font-bold text-xs transition-all text-left flex items-center justify-between"
            >
              <span>Clientes</span>
              <Download className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </Card>
      </div>

      {/* Script SQL Supabase Schema Viewer */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-extrabold text-slate-900">
              Estructura SQL de la Base de Datos (schema.sql)
            </h4>
          </div>

          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar SQL</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Pega este script en el <b>SQL Editor</b> de tu panel de Supabase para crear las 7 tablas del sistema:
        </p>
        <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
          <pre>{sqlSchemaText}</pre>
        </div>
      </Card>
    </div>
  );
};
