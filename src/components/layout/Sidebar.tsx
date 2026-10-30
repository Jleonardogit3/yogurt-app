import React from 'react';
import {
  Layers,
  ShoppingCart,
  Receipt,
  Users,
  Cloud,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ActiveModule } from '../../types';

interface NavItem {
  id: ActiveModule;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, pendingSalesCount, setSalesFilter } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'productions',
      label: 'Producciones',
      sublabel: 'Lotes y Stock',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'sales',
      label: 'Ventas y Cobros',
      sublabel: 'Ingresos y Carrito',
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: pendingSalesCount > 0 ? pendingSalesCount : undefined,
    },
    {
      id: 'expenses',
      label: 'Gastos',
      sublabel: 'Yogurts vs. Casa',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: 'clients',
      label: 'Clientes',
      sublabel: 'Directorio y Deudores',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'cloud',
      label: 'Nube y Respaldos',
      sublabel: 'Local + Supabase',
      icon: <Cloud className="w-5 h-5" />,
    },
  ];

  const handleSelectModule = (id: ActiveModule) => {
    setActiveModule(id);
    if (id === 'sales') {
      // Keep sales filter default or all
      setSalesFilter({ status: 'all' });
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-200/90 h-[calc(100vh-61px)] sticky top-[61px] p-4 justify-between">
      {/* Lista de Navegación */}
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Módulos Principales
        </div>
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectModule(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 text-left ${
                isActive
                  ? 'bg-rose-50 text-rose-700 shadow-sm shadow-rose-100 font-bold border border-rose-200/60'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`p-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-300'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {item.icon}
                </span>
                <div>
                  <div className="text-sm leading-tight flex items-center gap-1.5">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && item.badge > 0 ? (
                <span className="bg-amber-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              ) : (
                isActive && <ChevronRight className="w-4 h-4 text-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tarjeta de Pie de Barra Lateral */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 text-left">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Local-First & Offline</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Tus datos se guardan al instante en tu equipo. Conéctate a Supabase cuando desees respaldar en la nube.
        </p>
      </div>
    </aside>
  );
};
