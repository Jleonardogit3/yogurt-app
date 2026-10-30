import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Save, Database, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { testSupabaseConnection } from '../../services/supabaseService';

export const GlobalSettingsModal: React.FC = () => {
  const {
    openSettingsModal,
    setOpenSettingsModal,
    settings,
    updateSettings,
    refreshBcvRate,
    isBcvLoading,
    bcvLastUpdated,
    resetToDemo,
  } = useApp();

  const [form, setForm] = useState({
    bcv_rate: settings.bcv_rate,
    price_120g: settings.price_120g,
    price_350g: settings.price_350g,
    price_500g: settings.price_500g,
    supabase_url: settings.supabase_url || '',
    supabase_anon_key: settings.supabase_anon_key || '',
  });

  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      bcv_rate: Number(form.bcv_rate) || 40,
      price_120g: Number(form.price_120g) || 1.5,
      price_350g: Number(form.price_350g) || 3.5,
      price_500g: Number(form.price_500g) || 5.0,
      supabase_url: form.supabase_url.trim() || undefined,
      supabase_anon_key: form.supabase_anon_key.trim() || undefined,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setOpenSettingsModal(false);
    }, 900);
  };

  const handleTestSupabase = async () => {
    setTestStatus({ loading: true });
    const res = await testSupabaseConnection(form.supabase_url.trim(), form.supabase_anon_key.trim());
    setTestStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  return (
    <Modal
      isOpen={openSettingsModal}
      onClose={() => setOpenSettingsModal(false)}
      title="Ajustes Globales y Tasa de Cambio"
      subtitle="Configura precios base, tasa BCV y credenciales de la nube"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Sección: Tasa BCV */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Tasa Oficial BCV (Bs. / $ USD)
            </label>
            <button
              type="button"
              onClick={refreshBcvRate}
              disabled={isBcvLoading}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBcvLoading ? 'animate-spin' : ''}`} />
              Consultar en vivo
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Bs.</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={form.bcv_rate}
                onChange={(e) => setForm({ ...form, bcv_rate: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-3 py-2 text-base font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                required
              />
            </div>
          </div>
          {bcvLastUpdated && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              Última actualización de la fuente oficial: {bcvLastUpdated}
            </p>
          )}
        </div>

        {/* Sección: Precios Base Predeterminados */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 block">
            Precios Base por Tamaño ($ USD)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-1">Pequeño (120g)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0.1"
                  value={form.price_120g}
                  onChange={(e) => setForm({ ...form, price_120g: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-1">Mediano (350g)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0.1"
                  value={form.price_350g}
                  onChange={(e) => setForm({ ...form, price_350g: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-1">Grande (500g)</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.10"
                  min="0.1"
                  value={form.price_500g}
                  onChange={(e) => setForm({ ...form, price_500g: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-6 pr-2 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            * Estos precios se asignarán automáticamente al vender, pero podrás cambiarlos en cada venta.
          </p>
        </div>

        {/* Sección: Sincronización Nube (Supabase) */}
        <div className="border-t border-slate-100 pt-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-purple-600" />
            Configuración Supabase (Opcional)
          </label>
          <div className="space-y-2.5">
            <div>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={form.supabase_url}
                onChange={(e) => setForm({ ...form, supabase_url: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Supabase Anon Key (eyJhbGciOi...)"
                value={form.supabase_anon_key}
                onChange={(e) => setForm({ ...form, supabase_anon_key: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testStatus.loading || !form.supabase_url || !form.supabase_anon_key}
                className="text-xs px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold disabled:opacity-40 transition-colors"
              >
                {testStatus.loading ? 'Verificando...' : 'Probar conexión'}
              </button>
              {testStatus.message && (
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${
                    testStatus.success ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  )}
                  {testStatus.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Deseas restaurar todos los datos demo de ejemplo? Se sobrescribirá el estado actual.')) {
                resetToDemo();
                setOpenSettingsModal(false);
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
          >
            Restaurar datos demo
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenSettingsModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Ajustes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
