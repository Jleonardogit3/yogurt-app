import React, { useState } from 'react';
import { Plus, Trash2, Layers, Calendar, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { FLAVORS, SIZES, SIZE_LABELS } from '../../../types';
import type { YogurtFlavor, YogurtSize } from '../../../types';

interface BatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemRow {
  id: string;
  size: YogurtSize;
  flavor: YogurtFlavor;
  quantity_produced: number;
}

export const BatchFormModal: React.FC<BatchFormModalProps> = ({ isOpen, onClose }) => {
  const { batches, addBatch } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const nextBatchNumber = batches.length + 1;
  const defaultBatchCode = `Lote #${String(nextBatchNumber).padStart(2, '0')} - ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;

  const [batchCode, setBatchCode] = useState(defaultBatchCode);
  const [prepDate, setPrepDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [items, setItems] = useState<ItemRow[]>([
    { id: '1', size: '500g', flavor: 'Fresa', quantity_produced: 10 },
    { id: '2', size: '350g', flavor: 'Durazno', quantity_produced: 10 },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        size: '500g',
        flavor: 'Mora',
        quantity_produced: 6,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setErrorMsg('Debes incluir al menos una combinación de sabor y tamaño.');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setErrorMsg('');
  };

  const handleItemChange = <K extends keyof ItemRow>(id: string, field: K, value: ItemRow[K]) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim()) {
      setErrorMsg('Por favor indica un código o nombre para el lote.');
      return;
    }

    const invalidItem = items.find((i) => !i.quantity_produced || i.quantity_produced <= 0);
    if (invalidItem) {
      setErrorMsg('Todas las filas deben tener una cantidad mayor a 0.');
      return;
    }

    addBatch(
      {
        batch_code: batchCode.trim(),
        prep_date: prepDate,
        notes: notes.trim() || undefined,
      },
      items.map((i) => ({
        size: i.size,
        flavor: i.flavor,
        quantity_produced: Number(i.quantity_produced),
      }))
    );

    // Reset and close
    setBatchCode(`Lote #${String(batches.length + 2).padStart(2, '0')}`);
    setNotes('');
    setErrorMsg('');
    onClose();
  };

  const totalUnits = items.reduce((sum, i) => sum + (Number(i.quantity_produced) || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nueva Tanda de Producción"
      subtitle="Define el lote y agrega las combinaciones de sabores y tamaños fabricados"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cabecera del Lote */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-500" />
              Código / Nombre de Lote
            </label>
            <input
              type="text"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              placeholder="Ej. Lote #03 - 25 Oct"
              className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Fecha de Preparación
            </label>
            <input
              type="date"
              value={prepDate}
              onChange={(e) => setPrepDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">
              Notas u Observaciones del Lote (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Leche doble crema, lote con pulpa fresca..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filas Dinámicas de Producción */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Productos Elaborados en esta Tanda ({items.length})
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200/70 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar otra combinación
            </button>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm"
              >
                <span className="w-6 text-center text-xs font-bold text-slate-400">
                  #{idx + 1}
                </span>

                {/* Selector de Tamaño */}
                <select
                  value={item.size}
                  onChange={(e) => handleItemChange(item.id, 'size', e.target.value as YogurtSize)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500"
                >
                  {SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {SIZE_LABELS[sz]}
                    </option>
                  ))}
                </select>

                {/* Selector de Sabor */}
                <select
                  value={item.flavor}
                  onChange={(e) => handleItemChange(item.id, 'flavor', e.target.value as YogurtFlavor)}
                  className="flex-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500"
                >
                  {FLAVORS.map((fl) => (
                    <option key={fl} value={fl}>
                      {fl}
                    </option>
                  ))}
                </select>

                {/* Input de Cantidad */}
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={item.quantity_produced || ''}
                    onChange={(e) =>
                      handleItemChange(item.id, 'quantity_produced', parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full px-2 py-1.5 text-xs font-bold text-center bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Eliminar Fila */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                  title="Eliminar fila"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mt-2 px-1">
            <span>Total unidades a incorporar:</span>
            <span className="text-sm font-black text-slate-900 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
              {totalUnits} unidades
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            Guardar y Registrar Lote
          </button>
        </div>
      </form>
    </Modal>
  );
};
