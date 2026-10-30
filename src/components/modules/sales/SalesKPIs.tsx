import React, { useMemo } from 'react';
import { DollarSign, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../common/Card';
import { DualPrice } from '../../common/DualPrice';
import { calculateFinancialSummary } from '../../../utils/calculations';

export const SalesKPIs: React.FC = () => {
  const { sales, expenses, setSalesFilter } = useApp();

  const finance = useMemo(
    () => calculateFinancialSummary(sales, expenses),
    [sales, expenses]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Cobrado en Caja */}
      <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Cobrado en Caja
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <DualPrice amountUsd={finance.paidSalesUsd} size="xl" layout="stacked" color="emerald" />
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-2">
          Dinero real recibido de ventas finalizadas
        </p>
      </Card>

      {/* Por Cobrar (Pendiente / Fiado) */}
      <Card
        onClick={() => setSalesFilter((prev) => ({ ...prev, status: 'Pendiente' }))}
        hoverable
        className="border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/20 cursor-pointer"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Por Cobrar (Fiado)
          </span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <DualPrice amountUsd={finance.pendingSalesUsd} size="xl" layout="stacked" color="amber" />
        </div>
        <p className="text-[11px] text-amber-700 font-bold mt-2 flex items-center justify-between">
          <span>{finance.pendingSalesCount} {finance.pendingSalesCount === 1 ? 'cuenta pendiente' : 'cuentas pendientes'}</span>
          <span className="underline text-[10px]">Filtrar ➔</span>
        </p>
      </Card>

      {/* Rentabilidad Neta en Caja (Dinero Real) */}
      <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-br from-white to-indigo-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            Ganancia Neta en Caja
          </span>
          <TrendingUp className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <DualPrice
            amountUsd={finance.netProfitCajaUsd}
            size="xl"
            layout="stacked"
            color={finance.netProfitCajaUsd >= 0 ? 'indigo' : 'rose'}
          />
        </div>
        <p className="text-[11px] text-slate-500 font-medium mt-2">
          Cobrado ({finance.paidSalesUsd.toFixed(2)}$) - Gastos Yogurts ({finance.yogurtExpensesUsd.toFixed(2)}$)
        </p>
      </Card>

      {/* Rentabilidad Devengada (Incluyendo por cobrar) */}
      <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-white to-rose-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Rentabilidad Devengada
          </span>
          <DollarSign className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <DualPrice
            amountUsd={finance.netProfitDevengadaUsd}
            size="xl"
            layout="stacked"
            color={finance.netProfitDevengadaUsd >= 0 ? 'default' : 'rose'}
          />
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-2">
          Total ventas proyectadas menos insumos
        </p>
      </Card>
    </div>
  );
};
