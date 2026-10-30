import React from 'react';
import { Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { Badge } from '../../common/Badge';
import { DualPrice } from '../../common/DualPrice';
import { getClientPurchaseSummary } from '../../../utils/calculations';
import { useApp } from '../../../context/AppContext';
import type { Client } from '../../../types';

interface ClientHistoryModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({
  client,
  isOpen,
  onClose,
}) => {
  const { sales, saleItems, markSaleAsPaid, batches } = useApp();

  if (!client) return null;

  const summary = getClientPurchaseSummary(client.name, sales, saleItems);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de ${client.name}`}
      subtitle={client.phone ? `Contacto: ${client.phone}` : 'Cliente registrado'}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Métricas del Cliente */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Compras Totales
            </span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              {summary.totalOrders}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Monto Comprado
            </span>
            <div className="mt-0.5">
              <DualPrice amountUsd={summary.totalSpentUsd} size="sm" layout="stacked" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Saldo Pendiente
            </span>
            <div className="mt-0.5">
              <DualPrice
                amountUsd={summary.totalDebtUsd}
                size="sm"
                layout="stacked"
                color={summary.totalDebtUsd > 0 ? 'rose' : 'emerald'}
              />
            </div>
          </div>
        </div>

        {/* Sabores Favoritos */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Sabores Más Comprados
          </label>
          {summary.topFlavors.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Aún no registra compras de yogures.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {summary.topFlavors.map((tf) => (
                <span
                  key={tf.flavor}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/80 flex items-center gap-1.5"
                >
                  <span>{tf.flavor}</span>
                  <span className="bg-white text-rose-600 px-1.5 py-0.2 rounded-md text-[10px] shadow-2xs font-extrabold">
                    {tf.count} unds
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Historial de Ventas */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Todas las Compras Realizadas ({summary.sales.length})
          </label>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {summary.sales.map((sale) => {
              const items = saleItems.filter((si) => si.sale_id === sale.id);

              return (
                <div
                  key={sale.id}
                  className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-800">
                        {sale.sale_date}
                      </span>
                      <Badge
                        variant={sale.payment_status === 'Pagado' ? 'emerald' : 'amber'}
                        size="sm"
                      >
                        {sale.payment_status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <DualPrice
                        amountUsd={Number(sale.total_usd)}
                        rate={sale.bcv_rate_used}
                        size="sm"
                        color={sale.payment_status === 'Pagado' ? 'emerald' : 'amber'}
                      />
                      {sale.payment_status === 'Pendiente' && (
                        <button
                          onClick={() => markSaleAsPaid(sale.id)}
                          className="px-2 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1"
                          title="Cobrar ahora"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Cobrar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalle de ítems */}
                  <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2 rounded-lg">
                    {items.map((i) => {
                      const b = batches.find((batch) => batch.id === i.batch_id);
                      return (
                        <div key={i.id} className="flex justify-between items-center">
                          <span>
                            {i.quantity}x {i.flavor} ({i.size})
                            {b && <span className="text-[10px] text-slate-400 ml-1.5">[{b.batch_code}]</span>}
                          </span>
                          <span className="font-semibold text-slate-800">
                            ${Number(i.subtotal_usd).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón de Cierre */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};
