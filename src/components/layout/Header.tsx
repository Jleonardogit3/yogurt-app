import {
  Bell,
  RefreshCw,
  Settings,
  Sparkles,
  CloudCheck,
  CloudOff,
  Smartphone,
  Monitor,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatBs } from '../../utils/currency';
import { InstallPwaButton } from '../common/InstallPwaButton';

export const Header: React.FC = () => {
  const {
    settings,
    refreshBcvRate,
    isBcvLoading,
    pendingSalesCount,
    pendingSalesTotalUsd,
    pendingSalesTotalBs,
    setActiveModule,
    setSalesFilter,
    setOpenSettingsModal,
    isMobileSimulated,
    setIsMobileSimulated,
    currentUser,
    logout,
  } = useApp();

  const handleOpenPendingSales = () => {
    setActiveModule('sales');
    setSalesFilter({ status: 'Pendiente' });
  };

  const isCloudConfigured = Boolean(settings.supabase_url && settings.supabase_anon_key);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 sm:py-3 transition-all w-full">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo / Nombre en Móvil */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                Yogurt<span className="text-rose-500">App</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
                Artesanal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block leading-none mt-0.5">
              Gestión de Lotes, Finanzas y Ventas
            </p>
          </div>
        </div>

        {/* Controles del Header: Tasa BCV + Campana de Cobros + Ajustes */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tasa BCV Widget */}
          <div className="flex items-center bg-slate-100/80 hover:bg-slate-100 transition-colors border border-slate-200/90 rounded-xl p-1 sm:p-1.5 pl-2 sm:pl-3">
            <div
              onClick={() => setOpenSettingsModal(true)}
              className="cursor-pointer flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-2"
              title="Clic para editar tasa BCV o ajustar precios"
            >
              <div className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  BCV:
                </span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                {formatBs(settings.bcv_rate)}
              </span>
            </div>
            <button
              onClick={refreshBcvRate}
              disabled={isBcvLoading}
              title="Actualizar tasa desde dolarapi"
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBcvLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

          {/* Campana de Notificaciones de Cobro (Alertas de Deudores) */}
          <button
            onClick={handleOpenPendingSales}
            title={
              pendingSalesCount > 0
                ? `${pendingSalesCount} cuentas por cobrar ($${pendingSalesTotalUsd.toFixed(2)} - ${formatBs(pendingSalesTotalBs)})`
                : 'Sin cuentas pendientes'
            }
            className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition-all ${
              pendingSalesCount > 0
                ? 'bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-sm shadow-amber-200/50'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="relative">
              <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${pendingSalesCount > 0 ? 'text-amber-600 animate-bounce' : 'text-slate-400'}`} />
              {pendingSalesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                  {pendingSalesCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 leading-none">
                Por Cobrar
              </span>
              <span className="text-xs font-extrabold text-slate-800 leading-none mt-0.5">
                ${pendingSalesTotalUsd.toFixed(2)}
              </span>
            </div>
          </button>

          {/* Estado de Nube / Indicador */}
          <button
            onClick={() => setActiveModule('cloud')}
            title={isCloudConfigured ? 'Supabase Conectado' : 'Operando en Modo Local (Clic para conectar)'}
            className={`hidden md:flex items-center gap-1 p-2 rounded-xl border text-xs font-semibold transition-all ${
              isCloudConfigured
                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isCloudConfigured ? (
              <CloudCheck className="w-4 h-4 text-purple-600" />
            ) : (
              <CloudOff className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-[11px]">{isCloudConfigured ? 'Nube' : 'Local'}</span>
          </button>

          {/* Botón Simular Vista Móvil Estándar (solo en pantallas grandes) */}
          <button
            onClick={() => setIsMobileSimulated((prev) => !prev)}
            title={isMobileSimulated ? "Volver a vista de escritorio" : "Ver en formato estándar móvil"}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isMobileSimulated
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isMobileSimulated ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isMobileSimulated ? 'Escritorio' : 'Móvil'}</span>
          </button>

          {/* Botón de Instalar App PWA */}
          <InstallPwaButton variant="header" />

          {/* Botón de Configuración Rápida */}
          <button
            onClick={() => setOpenSettingsModal(true)}
            title="Ajustes de Precios y Tasa"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Perfil del Usuario y Cerrar Sesión */}
          {currentUser && (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 border-l border-slate-200">
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/90 py-1 px-2.5 rounded-xl border border-slate-200/80">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.charAt(0)}
                </div>
                <span className="text-xs font-bold text-slate-800">{currentUser}</span>
              </div>

              <button
                onClick={logout}
                title="Cerrar Sesión"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
