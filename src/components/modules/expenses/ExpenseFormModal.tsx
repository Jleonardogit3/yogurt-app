import React, { useState } from 'react';
import { ShoppingBag, Home, Calendar, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { convertBsToUSD, convertUSDToBs, formatBs, formatUSD } from '../../../utils/currency';
import type { ExpenseCategory } from '../../../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, batches, settings } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Yogurts');
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'Bs'>('USD');
  const [amountInput, setAmountInput] = useState('');
  const [batchId, setBatchId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const numericInput = parseFloat(amountInput) || 0;
  const calculatedUsd =
    currencyMode === 'USD'
      ? numericInput
      : convertBsToUSD(numericInput, settings.bcv_rate);

  const calculatedBs =
    currencyMode === 'Bs'
      ? numericInput
      : convertUSDToBs(numericInput, settings.bcv_rate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Por favor describe el concepto o producto del gasto.');
      return;
    }
    if (calculatedUsd <= 0) {
      setErrorMsg('El monto del gasto debe ser mayor a 0.');
      return;
    }

    addExpense({
      expense_date: date,
      description: description.trim(),
      category,
      amount_usd: Math.round(calculatedUsd * 100) / 100,
      batch_id: category === 'Yogurts' && batchId ? batchId : undefined,
    });

    // Reset
    setDescription('');
    setAmountInput('');
    setBatchId('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Gasto"
      subtitle="Separa claramente los insumos de yogures de los gastos personales del hogar"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Selector de Categoría (Separación de Negocio vs Hogar) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
            Categoría del Gasto
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setCategory('Yogurts')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                category === 'Yogurts'
                  ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold shadow-sm ring-2 ring-rose-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className={`w-5 h-5 ${category === 'Yogurts' ? 'text-rose-600' : 'text-slate-400'}`} />
              <div className="text-center">
                <span className="text-xs block">Yogurts (Negocio)</span>
                <span className="text-[10px] text-slate-400 font-normal">Insumos y envases</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCategory('Casa')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                category === 'Casa'
                  ? 'bg-sky-50 border-sky-400 text-sky-800 font-bold shadow-sm ring-2 ring-sky-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Home className={`w-5 h-5 ${category === 'Casa' ? 'text-sky-600' : 'text-slate-400'}`} />
              <div className="text-center">
                <span className="text-xs block">Casa (Personal)</span>
                <span className="text-[10px] text-slate-400 font-normal">Mercado y hogar</span>
              </div>
            </button>
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Fecha del Gasto
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">
            Descripción o Concepto
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              category === 'Yogurts'
                ? 'Ej. Leche pasteurizada 20L, fresas, envases 500g...'
                : 'Ej. Mercado semanal, pago de servicio eléctrico...'
            }
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            required
          />
        </div>

        {/* Monto con Toggle de Moneda */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Monto Pagado
            </label>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrencyMode('USD')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currencyMode === 'USD'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode('Bs')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currencyMode === 'Bs'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Bs. BCV
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              {currencyMode === 'USD' ? '$' : 'Bs.'}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-3 py-2.5 text-base font-black bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          {/* Equivalente en la otra moneda */}
          {numericInput > 0 && (
            <div className="mt-2 text-xs flex items-center justify-between px-1 text-slate-500 font-medium">
              <span>Equivalente aproximado:</span>
              <span className="font-bold text-slate-800">
                {currencyMode === 'USD' ? formatBs(calculatedBs) : formatUSD(calculatedUsd)}
              </span>
            </div>
          )}
        </div>

        {/* Lote Asociado (Opcional para Yogurts) */}
        {category === 'Yogurts' && batches.length > 0 && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">
              Vincular a Tanda / Lote (Opcional)
            </label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
            >
              <option value="">Sin lote específico (Gasto general del negocio)</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_code} ({b.prep_date})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            Registrar Gasto
          </button>
        </div>
      </form>
    </Modal>
  );
};
