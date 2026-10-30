import React, { useMemo } from 'react';
import { Package, Scale, PieChart } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { calculateTotalWeightKg, calculateRemainingWeightKg } from '../../../utils/calculations';
import { Card } from '../../common/Card';

export const ProductionKPIs: React.FC = () => {
  const { batches, productionItems } = useApp();

  const totalProducedUnits = useMemo(
    () => productionItems.reduce((acc, item) => acc + item.quantity_produced, 0),
    [productionItems]
  );

  const totalRemainingUnits = useMemo(
    () => productionItems.reduce((acc, item) => acc + item.quantity_remaining, 0),
    [productionItems]
  );

  const totalWeightKg = useMemo(() => calculateTotalWeightKg(productionItems), [productionItems]);
  const remainingWeightKg = useMemo(
    () => calculateRemainingWeightKg(productionItems),
    [productionItems]
  );

  // Breakdown by size
  const sizeBreakdown = useMemo(() => {
    const summary = {
      '500g': { produced: 0, remaining: 0 },
      '350g': { produced: 0, remaining: 0 },
      '120g': { produced: 0, remaining: 0 },
    };
    for (const item of productionItems) {
      if (summary[item.size]) {
        summary[item.size].produced += item.quantity_produced;
        summary[item.size].remaining += item.quantity_remaining;
      }
    }
    return summary;
  }, [productionItems]);

  const stockPercentage = totalProducedUnits > 0
    ? Math.round((totalRemainingUnits / totalProducedUnits) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* KPI 1: Unidades Disponibles vs Producidas */}
      <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-white to-rose-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Stock Disponible</span>
          <Package className="w-4 h-4 text-rose-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {totalRemainingUnits}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            / {totalProducedUnits} unds
          </span>
        </div>
        {/* Barra de progreso */}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
          <div
            className="bg-rose-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-1.5 flex justify-between">
          <span>{stockPercentage}% en almacén</span>
          <span>{batches.length} {batches.length === 1 ? 'lote' : 'lotes'}</span>
        </p>
      </Card>

      {/* KPI 2: Kilos / Litros Totales Procesados */}
      <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-br from-white to-indigo-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Materia Procesada</span>
          <Scale className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
            {totalWeightKg.toFixed(1)}
          </span>
          <span className="text-sm font-bold text-indigo-600">Kg / Litros</span>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-2">
          Quedan en stock:{' '}
          <span className="font-extrabold text-slate-800">{remainingWeightKg.toFixed(1)} Kg</span>
        </p>
      </Card>

      {/* KPI 3: Desglose por Tamaños */}
      <Card className="col-span-2 border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/20">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">
            Desglose por Tamaño (Disponibles / Total)
          </span>
          <PieChart className="w-4 h-4 text-amber-500" />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-white/80 p-2 rounded-xl border border-slate-200/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Grande 500g</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {sizeBreakdown['500g'].remaining}
              <span className="text-xs text-slate-400 font-medium">/{sizeBreakdown['500g'].produced}</span>
            </div>
          </div>

          <div className="bg-white/80 p-2 rounded-xl border border-slate-200/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Mediano 350g</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {sizeBreakdown['350g'].remaining}
              <span className="text-xs text-slate-400 font-medium">/{sizeBreakdown['350g'].produced}</span>
            </div>
          </div>

          <div className="bg-white/80 p-2 rounded-xl border border-slate-200/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Pequeño 120g</span>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {sizeBreakdown['120g'].remaining}
              <span className="text-xs text-slate-400 font-medium">/{sizeBreakdown['120g'].produced}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
