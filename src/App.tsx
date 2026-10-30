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

const MainLayout: React.FC = () => {
  const { activeModule } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-rose-500 selection:text-white">
      {/* Barra Superior Global */}
      <Header />

      {/* Contenedor Principal: Sidebar + Contenido Central */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10 w-full overflow-x-hidden transition-all duration-300">
          {activeModule === 'productions' && <ProductionsView />}
          {activeModule === 'sales' && <SalesView />}
          {activeModule === 'expenses' && <ExpensesView />}
          {activeModule === 'clients' && <ClientsView />}
          {activeModule === 'cloud' && <CloudView />}
        </main>
      </div>

      {/* Navegación Inferior Móvil */}
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
