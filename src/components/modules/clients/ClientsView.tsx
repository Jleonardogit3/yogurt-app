import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Search, Phone, ChevronRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { DualPrice } from '../../common/DualPrice';
import { Modal } from '../../common/Modal';
import { ClientHistoryModal } from './ClientHistoryModal';
import { getClientPurchaseSummary } from '../../../utils/calculations';
import type { Client } from '../../../types';

export const ClientsView: React.FC = () => {
  const { clients, sales, saleItems, addOrGetClient, setActiveModule, setSalesFilter } = useApp();

  const [filterMode, setFilterMode] = useState<'all' | 'debtors'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Compute stats for all clients
  const clientStats = useMemo(() => {
    return clients.map((c) => {
      const summary = getClientPurchaseSummary(c.name, sales, saleItems);
      return {
        client: c,
        ...summary,
      };
    });
  }, [clients, sales, saleItems]);

  const debtorsCount = clientStats.filter((cs) => cs.hasPendingDebt).length;
  const totalDebtUsd = clientStats.reduce((sum, cs) => sum + cs.totalDebtUsd, 0);

  const filteredClients = useMemo(() => {
    return clientStats.filter((cs) => {
      if (filterMode === 'debtors' && !cs.hasPendingDebt) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          cs.client.name.toLowerCase().includes(query) ||
          (cs.client.phone && cs.client.phone.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [clientStats, filterMode, searchTerm]);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addOrGetClient(newName.trim(), newPhone.trim() || undefined);
    setNewName('');
    setNewPhone('');
    setIsAddModalOpen(false);
  };

  const handleGoToSalesPendingForClient = (clientId: string) => {
    setActiveModule('sales');
    setSalesFilter({
      status: 'Pendiente',
      clientId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Directorio de Clientes y Deudores
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Historial de compras, preferencias de sabores y balance de cuentas por cobrar
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-200 hover:shadow-lg transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/20">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Clientes</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {clients.length}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Compradores registrados en el sistema
          </p>
        </Card>

        <Card
          onClick={() => setFilterMode('debtors')}
          hoverable
          className="border-l-4 border-l-rose-500 bg-gradient-to-br from-white to-rose-50/20 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Clientes con Deuda
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {debtorsCount}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            {debtorsCount > 0 ? 'Clic para ver solo clientes deudores' : 'Todos al día'}
          </p>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Total por Cobrar
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <DualPrice amountUsd={totalDebtUsd} size="lg" layout="stacked" color="amber" />
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Suma acumulada de cuentas por cobrar
          </p>
        </Card>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setFilterMode('debtors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterMode === 'debtors'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Con Deuda Pendiente ({debtorsCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid de Tarjetas de Clientes */}
      {filteredClients.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No se encontraron clientes</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {filterMode === 'debtors' ? '¡Excelente! Ningún cliente tiene pagos pendientes.' : 'Agrega un cliente con el botón superior.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredClients.map((cs) => {
            const initial = cs.client.name.charAt(0).toUpperCase();

            return (
              <Card
                key={cs.client.id}
                className={`p-4 flex flex-col justify-between hover:border-slate-300 transition-all ${
                  cs.hasPendingDebt ? 'border-amber-200 bg-amber-50/15' : ''
                }`}
              >
                <div>
                  {/* Cabecera Tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {initial}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {cs.client.name}
                        </h4>
                        {cs.client.phone ? (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {cs.client.phone}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sin teléfono</span>
                        )}
                      </div>
                    </div>

                    {cs.hasPendingDebt ? (
                      <Badge variant="rose" size="sm">
                        Debe ${cs.totalDebtUsd.toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                        Al día
                      </Badge>
                    )}
                  </div>

                  {/* Estadísticas de Compras */}
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-center my-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Pedidos
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {cs.totalOrders}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Total Comprado
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        ${cs.totalSpentUsd.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Sabores Favoritos */}
                  {cs.topFlavors.length > 0 && (
                    <div className="text-[11px] text-slate-500 mb-3">
                      <span className="font-semibold text-slate-700">Favorito: </span>
                      <span className="text-rose-600 font-bold">{cs.topFlavors[0].flavor}</span>
                      {cs.topFlavors.length > 1 && (
                        <span className="text-slate-400">, {cs.topFlavors[1].flavor}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedClient(cs.client)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                  >
                    <span>Ver Historial</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {cs.hasPendingDebt && (
                    <button
                      onClick={() => handleGoToSalesPendingForClient(cs.client.id)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-2xs"
                    >
                      Cobrar Deuda
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Historial de Cliente */}
      <ClientHistoryModal
        client={selectedClient}
        isOpen={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
      />

      {/* Modal Crear Nuevo Cliente */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Nuevo Cliente"
        subtitle="Registra los datos de contacto para autocompletar ventas"
        maxWidth="md"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">
              Nombre Completo
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Valentina Morales"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 block">
              Teléfono / WhatsApp (Opcional)
            </label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Ej. +58 412 1234567"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-200"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
