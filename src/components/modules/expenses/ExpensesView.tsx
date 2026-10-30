import React, { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { ExpensesKPIs } from './ExpensesKPIs';
import { ExpensesList } from './ExpensesList';
import { ExpenseFormModal } from './ExpenseFormModal';

export const ExpensesView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Control de Gastos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Separación estricta entre insumos del negocio (Yogurts) y finanzas del hogar (Casa)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Gasto</span>
        </button>
      </div>

      {/* Tarjetas KPIs */}
      <ExpensesKPIs />

      {/* Lista con Filtros */}
      <ExpensesList />

      {/* Modal de Registro */}
      <ExpenseFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
