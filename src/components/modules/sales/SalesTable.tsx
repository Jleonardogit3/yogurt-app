import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  AlertTriangle,
  User,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { DualPrice } from '../../common/DualPrice';

export const SalesTable: React.FC = () => {
  const {
    sales,
    saleItems,
    batches,
    clients,
    markSaleAsPaid,
    deleteSale,
    salesFilter,
    setSalesFilter,
  } = useApp();

  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Count pending
  const pendingSales = useMemo(
    () => sales.filter((s) => s.payment_status === 'Pendiente'),
    [sales]
  );

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      // Status filter
      if (salesFilter.status !== 'all' && s.payment_status !== salesFilter.status) {
        return false;
      }

      // Batch filter (Does this sale contain an item from the selected batch?)
      if (salesFilter.batchId) {
        const itemsForSale = saleItems.filter((si) => si.sale_id === s.id);
        const hasBatchItem = itemsForSale.some(
          (si) => si.batch_id === salesFilter.batchId
        );
        if (!hasBatchItem) return false;
      }

      // Client filter
      if (salesFilter.clientId && s.client_id !== salesFilter.clientId) {
        return false;
      }

      // Search term (Client name or sale date)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          s.client_name.toLowerCase().includes(query) ||
          s.sale_date.includes(query)
        );
      }

      return true;
    });
  }, [sales, saleItems, salesFilter, searchTerm]);

  const toggleExpand = (saleId: string) => {
    setExpandedSaleId((prev) => (prev === saleId ? null : saleId));
  };

  const handleDelete = (saleId: string, clientName: string) => {
    if (
      confirm(
        `¿Eliminar la venta de ${clientName}? Las unidades vendidas se restaurarán al stock del lote correspondiente.`
      )
    ) {
      deleteSale(saleId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alerta de Cuentas por Cobrar si existen ventas pendientes */}
      {pendingSales.length > 0 && salesFilter.status !== 'Pendiente' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900 leading-tight">
                Tienes {pendingSales.length} {pendingSales.length === 1 ? 'cuenta por cobrar' : 'cuentas por cobrar'} pendientes
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Total por recuperar: ${pendingSales.reduce((sum, s) => sum + Number(s.total_usd), 0).toFixed(2)} USD
              </p>
            </div>
          </div>

          <button
            onClick={() => setSalesFilter((prev) => ({ ...prev, status: 'Pendiente' }))}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
          >
            Ver Solo Pendientes
          </button>
        </div>
      )}

      {/* Barra de Filtros: Estado, Lote, Cliente y Búsqueda */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Filtro por Estado */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setSalesFilter((prev) => ({ ...prev, status: 'all' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              salesFilter.status === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todas ({sales.length})
          </button>
          <button
            onClick={() => setSalesFilter((prev) => ({ ...prev, status: 'Pagado' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              salesFilter.status === 'Pagado'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pagadas
          </button>
          <button
            onClick={() => setSalesFilter((prev) => ({ ...prev, status: 'Pendiente' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              salesFilter.status === 'Pendiente'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-amber-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pendientes ({pendingSales.length})
          </button>
        </div>

        {/* Filtros Dropdowns: Lote y Cliente */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Lote */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={salesFilter.batchId || ''}
              onChange={(e) =>
                setSalesFilter((prev) => ({
                  ...prev,
                  batchId: e.target.value || undefined,
                }))
              }
              className="text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-700"
            >
              <option value="">Todos los Lotes</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_code}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Cliente */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={salesFilter.clientId || ''}
              onChange={(e) =>
                setSalesFilter((prev) => ({
                  ...prev,
                  clientId: e.target.value || undefined,
                }))
              }
              className="text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-700 max-w-[140px] truncate"
            >
              <option value="">Todos los Clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buscador */}
          <div className="relative flex-1 min-w-[150px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Listado de Ventas */}
      {filteredSales.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No se encontraron ventas con estos filtros</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Prueba restableciendo los filtros o registra una nueva venta en el botón superior.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => {
            const items = saleItems.filter((si) => si.sale_id === sale.id);
            const isExpanded = expandedSaleId === sale.id;
            const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <Card
                key={sale.id}
                className={`transition-all border ${
                  sale.payment_status === 'Pendiente'
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Fila Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        sale.payment_status === 'Pagado'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-100 text-amber-700 animate-pulse-subtle'
                      }`}
                    >
                      {sale.payment_status === 'Pagado' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-slate-900 leading-tight">
                          {sale.client_name}
                        </span>
                        <Badge
                          variant={sale.payment_status === 'Pagado' ? 'emerald' : 'amber'}
                          size="sm"
                        >
                          {sale.payment_status === 'Pagado' ? 'Pagado' : 'Pendiente / Fiado'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{sale.sale_date}</span>
                        <span>•</span>
                        <span>
                          {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'} ({items.length} {items.length === 1 ? 'sabor' : 'sabores'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Precios y Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <DualPrice
                        amountUsd={Number(sale.total_usd)}
                        rate={sale.bcv_rate_used}
                        size="lg"
                        layout="stacked"
                        color={sale.payment_status === 'Pagado' ? 'emerald' : 'amber'}
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Botón Acción Rápida: Marcar como Pagado */}
                      {sale.payment_status === 'Pendiente' && (
                        <button
                          onClick={() => markSaleAsPaid(sale.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1"
                          title="Cobrar ahora y marcar como pagado"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cobrar</span>
                        </button>
                      )}

                      {/* Botón Ver Detalle */}
                      <button
                        onClick={() => toggleExpand(sale.id)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        title={isExpanded ? 'Ocultar detalle' : 'Ver productos de esta venta'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {/* Botón Eliminar */}
                      <button
                        onClick={() => handleDelete(sale.id, sale.client_name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Eliminar venta y devolver stock al lote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalle Desplegable de Productos */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 p-4 rounded-b-2xl space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Detalle de Productos Vendidos:
                    </div>
                    <div className="divide-y divide-slate-200/60">
                      {items.map((item) => {
                        const batch = batches.find((b) => b.id === item.batch_id);
                        return (
                          <div
                            key={item.id}
                            className="py-1.5 flex items-center justify-between text-xs font-medium text-slate-700"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                {item.quantity}x
                              </span>
                              <span>
                                {item.flavor} ({item.size})
                              </span>
                              {batch && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                                  {batch.batch_code}
                                </span>
                              )}
                            </div>
                            <div className="font-extrabold text-slate-900">
                              ${Number(item.subtotal_usd).toFixed(2)} USD
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
