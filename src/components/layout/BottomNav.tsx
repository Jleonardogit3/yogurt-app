import React from 'react';
import { Layers, ShoppingCart, Receipt, Users, Cloud } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ActiveModule } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeModule, setActiveModule, pendingSalesCount, setSalesFilter } = useApp();

  const tabs: Array<{
    id: ActiveModule;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { id: 'productions', label: 'Lotes', icon: <Layers className="w-5 h-5" /> },
    {
      id: 'sales',
      label: 'Ventas',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: pendingSalesCount > 0 ? pendingSalesCount : undefined,
    },
    { id: 'expenses', label: 'Gastos', icon: <Receipt className="w-5 h-5" /> },
    { id: 'clients', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
    { id: 'cloud', label: 'Nube', icon: <Cloud className="w-5 h-5" /> },
  ];

  const handleSelect = (id: ActiveModule) => {
    setActiveModule(id);
    if (id === 'sales') {
      setSalesFilter({ status: 'all' });
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-lg">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 bg-rose-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
