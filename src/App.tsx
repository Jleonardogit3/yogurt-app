import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { GlobalSettingsModal } from './components/settings/GlobalSettingsModal';
import { ProductionsView } from './components/modules/productions/ProductionsView';
import { SalesView } from './components/modules/sales/SalesView';
import { ExpensesView } from './components/modules/expenses/ExpensesView';
import { ClientsView } from './components/modules/clients/ClientsView';
import { CloudView } from './components/modules/cloud/CloudView';
import { LoginView } from './components/auth/LoginView';
import { Wifi, Battery, Monitor } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeModule, isMobileSimulated, setIsMobileSimulated, currentUser } = useApp();

  // Si no hay sesión iniciada, mostrar pantalla de inicio de sesión con Jleonardo
  if (!currentUser) {
    return <LoginView />;
  }

  const currentTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Vista 1: Modo Simulación Móvil Estándar (ideal para pruebas y demostraciones en escritorio)
  if (isMobileSimulated) {
    return (
      <div className="min-h-screen bg-slate-900 py-6 px-3 flex flex-col items-center justify-center font-sans">
        {/* Barra superior de control de simulación */}
        <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 text-slate-300 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold">Formato Móvil Estándar (390 x 844)</span>
          </div>
          <button
            onClick={() => setIsMobileSimulated(false)}
            className="flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors font-semibold text-[11px]"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>

        {/* Marco de Smartphone Estilizado */}
        <div className="w-full max-w-[420px] bg-slate-950 p-2.5 sm:p-3 rounded-[50px] shadow-2xl ring-2 ring-slate-800/90 relative">
          {/* Dynamic Island / Bocina */}
          <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-950/80 mr-3"></div>
            <div className="w-2 h-2 rounded-full bg-indigo-900/40"></div>
          </div>

          {/* Pantalla Interna del Smartphone */}
          <div className="bg-slate-50 rounded-[40px] overflow-hidden flex flex-col h-[780px] max-h-[85vh] relative shadow-inner border border-slate-200/60">
            {/* Barra de Estado Móvil */}
            <div className="px-6 pt-2 pb-1 bg-white/90 backdrop-blur-md flex items-center justify-between text-[11px] font-bold text-slate-700 select-none">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4" />
              </div>
            </div>

            {/* Header Móvil */}
            <Header />

            {/* Contenido Scrollable */}
            <main className="flex-1 overflow-y-auto overscroll-contain p-3.5 pb-24 w-full">
              {activeModule === 'productions' && <ProductionsView />}
              {activeModule === 'sales' && <SalesView />}
              {activeModule === 'expenses' && <ExpensesView />}
              {activeModule === 'clients' && <ClientsView />}
              {activeModule === 'cloud' && <CloudView />}
            </main>

            {/* Barra de Navegación Inferior */}
            <BottomNav />

            {/* Barra de Inicio Inferior (Home Bar) */}
            <div className="absolute bottom-1 left-0 right-0 z-50 pointer-events-none flex justify-center">
              <div className="w-28 h-1 bg-slate-400/80 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Modal de Ajustes */}
        <GlobalSettingsModal />
      </div>
    );
  }

  // Vista 2: Modo Adaptativo Nativo (Escritorio Completo + Móvil Nativo)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-rose-500 selection:text-white">
      {/* Barra Superior Global */}
      <Header />

      {/* Contenedor Principal: Sidebar en Desktop + Contenido Central Ampliado */}
      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 xl:p-10 pb-28 lg:pb-12 w-full overflow-x-hidden transition-all duration-300">
          {activeModule === 'productions' && <ProductionsView />}
          {activeModule === 'sales' && <SalesView />}
          {activeModule === 'expenses' && <ExpensesView />}
          {activeModule === 'clients' && <ClientsView />}
          {activeModule === 'cloud' && <CloudView />}
        </main>
      </div>

      {/* Navegación Inferior Móvil (Nativa en pantallas pequeñas) */}
      <BottomNav />

      {/* Modal de Ajustes Globales */}
      <GlobalSettingsModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
