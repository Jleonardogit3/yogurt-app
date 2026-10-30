import React, { useState, useMemo } from 'react';
import { Plus, Trash2, User, Phone, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { formatUSD, formatBs, convertUSDToBs } from '../../../utils/currency';
import type { PaymentStatus, YogurtSize, YogurtFlavor } from '../../../types';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartRow {
  id: string;
  batch_id: string;
  production_item_id: string;
  size: YogurtSize;
  flavor: YogurtFlavor;
  quantity: number;
  unit_price_usd: number;
  subtotal_usd: number;
  max_stock: number;
}

export const SaleFormModal: React.FC<SaleFormModalProps> = ({ isOpen, onClose }) => {
  const { clients, batches, productionItems, settings, addSale } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [saleDate, setSaleDate] = useState(todayStr);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pagado');
  const [errorMsg, setErrorMsg] = useState('');

  // Find batches that have at least 1 item with stock > 0
  const availableBatches = useMemo(() => {
    return batches.filter((b) => {
      const bItems = productionItems.filter((pi) => pi.batch_id === b.id);
      return bItems.some((pi) => pi.quantity_remaining > 0);
    });
  }, [batches, productionItems]);

  const defaultPriceForSize = (size: YogurtSize): number => {
    switch (size) {
      case '120g':
        return settings.price_120g || 1.5;
      case '350g':
        return settings.price_350g || 3.5;
      case '500g':
      default:
        return settings.price_500g || 5.0;
    }
  };

  // Helper to initialize first cart row
  const getInitialCartRow = (): CartRow => {
    const firstBatch = availableBatches[0];
    if (firstBatch) {
      const itemsInBatch = productionItems.filter(
        (pi) => pi.batch_id === firstBatch.id && pi.quantity_remaining > 0
      );
      const firstItem = itemsInBatch[0];
      if (firstItem) {
        const unitPrice = defaultPriceForSize(firstItem.size);
        return {
          id: String(Date.now()),
          batch_id: firstBatch.id,
          production_item_id: firstItem.id,
          size: firstItem.size,
          flavor: firstItem.flavor,
          quantity: 1,
          unit_price_usd: unitPrice,
          subtotal_usd: unitPrice * 1,
          max_stock: firstItem.quantity_remaining,
        };
      }
    }

    return {
      id: String(Date.now()),
      batch_id: '',
      production_item_id: '',
      size: '500g',
      flavor: 'Fresa',
      quantity: 1,
      unit_price_usd: 5.0,
      subtotal_usd: 5.0,
      max_stock: 0,
    };
  };

  const [cart, setCart] = useState<CartRow[]>(() => [getInitialCartRow()]);

  // Client autocomplete matches
  const clientSuggestions = useMemo(() => {
    if (!clientName.trim()) return [];
    return clients.filter((c) =>
      c.name.toLowerCase().includes(clientName.trim().toLowerCase())
    );
  }, [clients, clientName]);

  const handleSelectClient = (name: string, phone?: string) => {
    setClientName(name);
    if (phone) setClientPhone(phone);
    setShowSuggestions(false);
  };

  const handleAddCartRow = () => {
    const newRow = getInitialCartRow();
    newRow.id = String(Date.now()) + Math.random().toString(36).substring(2, 5);
    setCart((prev) => [...prev, newRow]);
  };

  const handleRemoveCartRow = (id: string) => {
    if (cart.length <= 1) {
      setErrorMsg('Debes incluir al menos un producto en la venta.');
      return;
    }
    setCart((prev) => prev.filter((r) => r.id !== id));
    setErrorMsg('');
  };

  const handleBatchChange = (rowId: string, newBatchId: string) => {
    const itemsInBatch = productionItems.filter(
      (pi) => pi.batch_id === newBatchId && pi.quantity_remaining > 0
    );
    const firstItem = itemsInBatch[0];

    setCart((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (!firstItem) {
          return {
            ...r,
            batch_id: newBatchId,
            production_item_id: '',
            max_stock: 0,
            quantity: 0,
            subtotal_usd: 0,
          };
        }
        const unitPrice = defaultPriceForSize(firstItem.size);
        return {
          ...r,
          batch_id: newBatchId,
          production_item_id: firstItem.id,
          size: firstItem.size,
          flavor: firstItem.flavor,
          max_stock: firstItem.quantity_remaining,
          unit_price_usd: unitPrice,
          quantity: 1,
          subtotal_usd: unitPrice * 1,
        };
      })
    );
  };

  const handleItemChange = (rowId: string, newItemId: string) => {
    const foundItem = productionItems.find((pi) => pi.id === newItemId);
    if (!foundItem) return;

    setCart((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const unitPrice = defaultPriceForSize(foundItem.size);
        const qty = Math.min(r.quantity || 1, foundItem.quantity_remaining);
        return {
          ...r,
          production_item_id: foundItem.id,
          size: foundItem.size,
          flavor: foundItem.flavor,
          max_stock: foundItem.quantity_remaining,
          unit_price_usd: unitPrice,
          quantity: qty,
          subtotal_usd: unitPrice * qty,
        };
      })
    );
  };

  const handleQuantityChange = (rowId: string, qty: number) => {
    setCart((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const clampedQty = Math.max(1, Math.min(qty, r.max_stock));
        return {
          ...r,
          quantity: clampedQty,
          subtotal_usd: Math.round(clampedQty * r.unit_price_usd * 100) / 100,
        };
      })
    );
  };

  const handlePriceChange = (rowId: string, price: number) => {
    setCart((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          unit_price_usd: price,
          subtotal_usd: Math.round(r.quantity * price * 100) / 100,
        };
      })
    );
  };

  const totalUsd = cart.reduce((sum, r) => sum + r.subtotal_usd, 0);
  const totalBs = convertUSDToBs(totalUsd, settings.bcv_rate);
  const totalUnits = cart.reduce((sum, r) => sum + r.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMsg('Por favor ingresa o selecciona el nombre del cliente.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('El carrito de venta no puede estar vacío.');
      return;
    }

    for (const row of cart) {
      if (!row.batch_id || !row.production_item_id) {
        setErrorMsg('Todas las filas deben tener un lote y producto válido seleccionado.');
        return;
      }
      if (row.quantity <= 0) {
        setErrorMsg('La cantidad a vender debe ser mayor a 0.');
        return;
      }
      if (row.quantity > row.max_stock) {
        setErrorMsg(`La cantidad de "${row.flavor} (${row.size})" supera el stock disponible (${row.max_stock}).`);
        return;
      }
    }

    addSale(
      {
        sale_date: saleDate,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim() || undefined,
        payment_status: paymentStatus,
      },
      cart.map((r) => ({
        batch_id: r.batch_id,
        production_item_id: r.production_item_id,
        size: r.size,
        flavor: r.flavor,
        quantity: r.quantity,
        unit_price_usd: r.unit_price_usd,
        subtotal_usd: r.subtotal_usd,
      }))
    );

    // Reset
    setClientName('');
    setClientPhone('');
    setCart([getInitialCartRow()]);
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Venta Mixta"
      subtitle="Agrega múltiples sabores y tamaños descontando inventario exactamente del lote seleccionado"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cliente y Estado de Pago */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          {/* Autocompletado de Cliente */}
          <div className="relative">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-500" />
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar o escribir nombre..."
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />

            {/* Sugerencias desplegables */}
            {showSuggestions && clientSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-40 overflow-y-auto">
                {clientSuggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClient(c.name, c.phone)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-rose-50 hover:text-rose-700 font-semibold border-b border-slate-100 last:border-0 flex items-center justify-between"
                  >
                    <span>{c.name}</span>
                    {c.phone && <span className="text-[10px] text-slate-400">{c.phone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Teléfono Opcional */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Teléfono (Opcional)
            </label>
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Ej. +58 412 1234567"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Estado del Pago: Pagado vs Fiado */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">
              Estado del Pago
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentStatus('Pagado')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  paymentStatus === 'Pagado'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ✓ Pagado
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('Pendiente')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  paymentStatus === 'Pendiente'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ⏳ Fiado / Pendiente
              </button>
            </div>
          </div>
        </div>

        {/* Fecha de venta */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fecha de Venta:
            </span>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={handleAddCartRow}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar otro producto
          </button>
        </div>

        {/* Carrito de Productos (Filas de Venta) */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {availableBatches.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs text-center">
              No hay tandas de producción con stock disponible actualmente. Primero registra un lote en el módulo de Producciones.
            </div>
          ) : (
            cart.map((row, idx) => {
              const itemsInThisBatch = productionItems.filter(
                (pi) => pi.batch_id === row.batch_id && pi.quantity_remaining > 0
              );

              return (
                <div
                  key={row.id}
                  className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">
                      Producto #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCartRow(row.id)}
                      disabled={cart.length <= 1}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors disabled:opacity-30"
                      title="Quitar de la venta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    {/* Selector de Lote */}
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Lote
                      </label>
                      <select
                        value={row.batch_id}
                        onChange={(e) => handleBatchChange(row.id, e.target.value)}
                        className="w-full px-2 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      >
                        {availableBatches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.batch_code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selector de Sabor + Tamaño (con stock visible) */}
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Sabor y Tamaño (Stock)
                      </label>
                      <select
                        value={row.production_item_id}
                        onChange={(e) => handleItemChange(row.id, e.target.value)}
                        className="w-full px-2 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      >
                        {itemsInThisBatch.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.flavor} ({item.size}) - Quedan: {item.quantity_remaining}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad a Vender */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Cantidad (Máx {row.max_stock})
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={row.max_stock}
                        value={row.quantity || ''}
                        onChange={(e) =>
                          handleQuantityChange(row.id, parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full px-2 py-1.5 text-xs font-bold text-center bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                      />
                    </div>

                    {/* Precio Unitario (Editable) */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Precio ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          step="0.10"
                          min="0.1"
                          value={row.unit_price_usd || ''}
                          onChange={(e) =>
                            handlePriceChange(row.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-5 pr-1.5 py-1.5 text-xs font-bold text-right bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subtotal de Fila */}
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                    <span>
                      Subtotal: {row.quantity} x {formatUSD(row.unit_price_usd)}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {formatUSD(row.subtotal_usd)}{' '}
                      <span className="font-normal text-slate-500">
                        ({formatBs(convertUSDToBs(row.subtotal_usd, settings.bcv_rate))})
                      </span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resumen Total del Carrito */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-600 block">
                Total de la Venta ({totalUnits} {totalUnits === 1 ? 'yogur' : 'yogures'})
              </span>
              <span className="text-[11px] font-semibold text-rose-600">
                Tasa BCV: {formatBs(settings.bcv_rate)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl sm:text-2xl font-black text-rose-700">
              {formatUSD(totalUsd)}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-600">
              {formatBs(totalBs)}
            </div>
          </div>
        </div>

        {/* Botones de Envío */}
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
            disabled={availableBatches.length === 0}
            className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Check className="w-4 h-4" />
            {paymentStatus === 'Pagado' ? 'Cobrar y Descontar Stock' : 'Guardar Cuenta por Cobrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
