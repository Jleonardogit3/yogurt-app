import React, { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { SalesKPIs } from './SalesKPIs';
import { SalesTable } from './SalesTable';
import { SaleFormModal } from './SaleFormModal';

export const SalesView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ventas, Cobros y Rentabilidad
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Registro de ventas mixtas conectadas al stock de lotes y control de cuentas por cobrar
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Venta</span>
        </button>
      </div>

      {/* KPIs Financieros */}
      <SalesKPIs />

      {/* Tabla y Filtros de Ventas */}
      <SalesTable />

      {/* Modal de Carrito / Venta */}
      <SaleFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
