import React, { useState, useMemo } from 'react';
import { Trash2, Search, Calendar, ShoppingBag, Home, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { DualPrice } from '../../common/DualPrice';

export const ExpensesList: React.FC = () => {
  const { expenses, batches, deleteExpense } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'Yogurts' | 'Casa'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Tab filter
      if (activeTab !== 'all' && e.category !== activeTab) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          e.description.toLowerCase().includes(query) ||
          e.expense_date.includes(query)
        );
      }
      return true;
    });
  }, [expenses, activeTab, searchTerm]);

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`¿Eliminar el registro de gasto "${desc}"?`)) {
      deleteExpense(id);
    }
  };

  const getBatchName = (batchId?: string) => {
    if (!batchId) return null;
    const found = batches.find((b) => b.id === batchId);
    return found ? found.batch_code : null;
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros: Pestañas + Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pestañas de categoría */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('Yogurts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'Yogurts'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Yogurts (Negocio)
          </button>
          <button
            onClick={() => setActiveTab('Casa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'Casa'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-sky-600'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Casa (Personal)
          </button>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descripción o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Lista de Registros */}
      {filteredExpenses.length === 0 ? (
        <Card className="text-center py-10 border-dashed border-2 border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">No hay gastos en esta categoría</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {searchTerm ? 'Intenta con otro término de búsqueda.' : 'Registra tus primeros insumos o compras.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => {
            const batchName = getBatchName(expense.batch_id);

            return (
              <Card
                key={expense.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      expense.category === 'Yogurts'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-sky-50 text-sky-600'
                    }`}
                  >
                    {expense.category === 'Yogurts' ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : (
                      <Home className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {expense.description}
                      </h4>
                      <Badge
                        variant={expense.category === 'Yogurts' ? 'rose' : 'sky'}
                        size="sm"
                      >
                        {expense.category === 'Yogurts' ? 'Yogurts' : 'Casa'}
                      </Badge>
                      {batchName && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {batchName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {expense.expense_date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Monto y Botón de Eliminar */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <DualPrice
                      amountUsd={Number(expense.amount_usd)}
                      rate={expense.bcv_rate_used}
                      size="md"
                      layout="stacked"
                      color={expense.category === 'Yogurts' ? 'rose' : 'indigo'}
                    />
                  </div>

                  <button
                    onClick={() => handleDelete(expense.id, expense.description)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar este gasto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
