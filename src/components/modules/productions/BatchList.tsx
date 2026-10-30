import React from 'react';
import { Trash2, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';

export const BatchList: React.FC = () => {
  const { batches, productionItems, deleteBatch } = useApp();

  if (batches.length === 0) {
    return (
      <Card className="text-center py-12 px-4 border-dashed border-2 border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No hay tandas de producción creadas</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Comienza creando tu primer lote de yogures para gestionar sabores, tamaños y stock disponible.
        </p>
      </Card>
    );
  }

  const handleDelete = (batchId: string, batchCode: string) => {
    if (confirm(`¿Estás seguro de eliminar el "${batchCode}"? Se removerán sus ítems e inventario asociado.`)) {
      deleteBatch(batchId);
    }
  };

  return (
    <div className="space-y-4">
      {batches.map((batch) => {
        const items = productionItems.filter((pi) => pi.batch_id === batch.id);
        const totalProduced = items.reduce((sum, i) => sum + i.quantity_produced, 0);
        const totalRemaining = items.reduce((sum, i) => sum + i.quantity_remaining, 0);
        const batchPercentage = totalProduced > 0 ? Math.round((totalRemaining / totalProduced) * 100) : 0;
        const isSoldOut = totalRemaining === 0 && totalProduced > 0;

        return (
          <Card key={batch.id} className="relative overflow-hidden transition-all hover:border-slate-300">
            {/* Cabecera del Lote */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm ${
                    isSoldOut
                      ? 'bg-slate-400'
                      : batchPercentage < 25
                      ? 'bg-amber-500 shadow-amber-200'
                      : 'bg-gradient-to-tr from-rose-500 to-pink-500 shadow-pink-200'
                  }`}
                >
                  {isSoldOut ? '0%' : `${batchPercentage}%`}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {batch.batch_code}
                    </h3>
                    {isSoldOut ? (
                      <Badge variant="slate" size="sm">Agotado</Badge>
                    ) : batchPercentage < 25 ? (
                      <Badge variant="amber" size="sm">Poco Stock</Badge>
                    ) : (
                      <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                        Disponible
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {batch.prep_date}
                    </span>
                    {batch.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-500 line-clamp-1">{batch.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones y Resumen Rápido */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Stock Restante
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {totalRemaining}{' '}
                    <span className="text-xs font-semibold text-slate-400">/ {totalProduced} unds</span>
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(batch.id, batch.batch_code)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Eliminar este lote"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Barra de progreso global del lote */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 mb-4 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  isSoldOut ? 'bg-slate-300' : batchPercentage < 25 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${batchPercentage}%` }}
              />
            </div>

            {/* Grilla de Sabores y Tamaños en este Lote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {items.map((item) => {
                const itemPercent =
                  item.quantity_produced > 0
                    ? Math.round((item.quantity_remaining / item.quantity_produced) * 100)
                    : 0;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      item.quantity_remaining === 0
                        ? 'bg-slate-50 border-slate-200/60 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.size}
                      </span>
                      <span
                        className={`text-xs font-black ${
                          item.quantity_remaining === 0
                            ? 'text-slate-400'
                            : item.quantity_remaining <= 3
                            ? 'text-amber-600 font-bold'
                            : 'text-slate-800'
                        }`}
                      >
                        {item.quantity_remaining}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">/ {item.quantity_produced}</span>
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 truncate mb-1.5">
                      {item.flavor}
                    </div>

                    {/* Mini barra de stock */}
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-1 rounded-full ${
                          item.quantity_remaining === 0
                            ? 'bg-slate-200'
                            : itemPercent < 30
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${itemPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
