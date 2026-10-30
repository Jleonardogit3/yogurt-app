import React, { useState } from 'react';
import { Plus, Layers, Sparkles } from 'lucide-react';
import { ProductionKPIs } from './ProductionKPIs';
import { BatchList } from './BatchList';
import { BatchFormModal } from './BatchFormModal';

export const ProductionsView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Producciones y Lotes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Control de tandas elaboradas, balance de sabores y disponibilidad de stock
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tanda / Lote</span>
        </button>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <ProductionKPIs />

      {/* Listado de Lotes e Inventario */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Historial de Tandas Registradas
          </h3>
        </div>

        <BatchList />
      </div>

      {/* Modal de Registro de Producción */}
      <BatchFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
