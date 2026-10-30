import React, { useMemo } from 'react';
import { ShoppingBag, Home, PieChart } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../common/Card';
import { DualPrice } from '../../common/DualPrice';

export const ExpensesKPIs: React.FC = () => {
  const { expenses } = useApp();

  const yogurtExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.category === 'Yogurts')
        .reduce((sum, e) => sum + Number(e.amount_usd), 0),
    [expenses]
  );

  const homeExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.category === 'Casa')
        .reduce((sum, e) => sum + Number(e.amount_usd), 0),
    [expenses]
  );

  const totalExpenses = yogurtExpenses + homeExpenses;
  const businessPercentage =
    totalExpenses > 0 ? Math.round((yogurtExpenses / totalExpenses) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      {/* Gasto de Yogurts (Negocio) */}
      <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-white to-rose-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
            Insumos Yogurts (Negocio)
          </span>
          <ShoppingBag className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <DualPrice amountUsd={yogurtExpenses} size="xl" layout="stacked" color="rose" />
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-2">
          Afecta la rentabilidad neta del emprendimiento
        </p>
      </Card>

      {/* Gasto de Casa (Personal) */}
      <Card className="border-l-4 border-l-sky-500 bg-gradient-to-br from-white to-sky-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
            Gastos de Casa (Personal)
          </span>
          <Home className="w-4 h-4 text-sky-500" />
        </div>
        <div>
          <DualPrice amountUsd={homeExpenses} size="xl" layout="stacked" color="indigo" />
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-2">
          Finanzas familiares (Separado del negocio)
        </p>
      </Card>

      {/* Total Consolidado */}
      <Card className="border-l-4 border-l-slate-600 bg-gradient-to-br from-white to-slate-50/40">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">
            Consolidado Total
          </span>
          <PieChart className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <DualPrice amountUsd={totalExpenses} size="xl" layout="stacked" color="default" />
        </div>
        {/* Barra de proporción */}
        <div className="w-full bg-sky-200 rounded-full h-2 mt-2.5 overflow-hidden flex">
          <div
            className="bg-rose-500 h-2 transition-all duration-500"
            style={{ width: `${businessPercentage}%` }}
            title={`Yogurts: ${businessPercentage}%`}
          />
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-1.5 flex justify-between">
          <span className="text-rose-600 font-bold">{businessPercentage}% Negocio</span>
          <span className="text-sky-600 font-bold">{100 - businessPercentage}% Casa</span>
        </p>
      </Card>
    </div>
  );
};
