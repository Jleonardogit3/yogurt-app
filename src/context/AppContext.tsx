import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type {
  ActiveModule,
  AppSettings,
  Client,
  Expense,
  ProductionBatch,
  ProductionItem,
  Sale,
  SaleItem,
  YogurtFlavor,
  YogurtSize,
  AppBackupData,
} from '../types';
import { loadAppStateFromStorage, saveAppStateToStorage } from '../utils/storage';
import { fetchLiveBcvRate } from '../services/bcvService';
import { convertUSDToBs } from '../utils/currency';
import { getInitialBackupData } from '../utils/mockData';

export interface SalesFilterState {
  status: 'all' | 'Pagado' | 'Pendiente';
  batchId?: string;
  clientId?: string;
}

interface AppContextType {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  batches: ProductionBatch[];
  productionItems: ProductionItem[];
  addBatch: (
    batchData: { batch_code: string; prep_date: string; notes?: string },
    itemsData: Array<{ size: YogurtSize; flavor: YogurtFlavor; quantity_produced: number }>
  ) => void;
  deleteBatch: (batchId: string) => void;
  expenses: Expense[];
  addExpense: (expenseData: {
    expense_date: string;
    description: string;
    category: 'Yogurts' | 'Casa';
    amount_usd: number;
    batch_id?: string;
  }) => void;
  deleteExpense: (expenseId: string) => void;
  clients: Client[];
  addOrGetClient: (name: string, phone?: string) => Client;
  sales: Sale[];
  saleItems: SaleItem[];
  addSale: (
    saleData: {
      sale_date: string;
      client_name: string;
      client_phone?: string;
      payment_status: 'Pagado' | 'Pendiente';
    },
    itemsData: Array<{
      batch_id: string;
      production_item_id: string;
      size: YogurtSize;
      flavor: YogurtFlavor;
      quantity: number;
      unit_price_usd: number;
      subtotal_usd: number;
    }>
  ) => void;
  markSaleAsPaid: (saleId: string) => void;
  deleteSale: (saleId: string) => void;
  salesFilter: SalesFilterState;
  setSalesFilter: React.Dispatch<React.SetStateAction<SalesFilterState>>;
  isBcvLoading: boolean;
  bcvLastUpdated: string | null;
  refreshBcvRate: () => Promise<void>;
  pendingSalesCount: number;
  pendingSalesTotalUsd: number;
  pendingSalesTotalBs: number;
  openSettingsModal: boolean;
  setOpenSettingsModal: (open: boolean) => void;
  isMobileSimulated: boolean;
  setIsMobileSimulated: React.Dispatch<React.SetStateAction<boolean>>;
  restoreBackup: (data: AppBackupData) => void;
  resetToDemo: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppBackupData>(() => loadAppStateFromStorage());
  const [activeModule, setActiveModule] = useState<ActiveModule>('productions');
  const [isBcvLoading, setIsBcvLoading] = useState<boolean>(false);
  const [bcvLastUpdated, setBcvLastUpdated] = useState<string | null>(null);
  const [openSettingsModal, setOpenSettingsModal] = useState<boolean>(false);
  const [salesFilter, setSalesFilter] = useState<SalesFilterState>({ status: 'all' });
  const [isMobileSimulated, setIsMobileSimulated] = useState<boolean>(false);

  // Sync to localStorage whenever data changes
  useEffect(() => {
    saveAppStateToStorage(data);
  }, [data]);

  // Initial BCV Live Rate fetch
  const refreshBcvRate = useCallback(async () => {
    setIsBcvLoading(true);
    try {
      const res = await fetchLiveBcvRate();
      if (res.rate && res.rate > 0) {
        setData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            bcv_rate: res.rate,
            updated_at: new Date().toISOString(),
          },
        }));
        if (res.updatedAt) {
          setBcvLastUpdated(res.updatedAt);
        }
      }
    } finally {
      setIsBcvLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBcvRate();
  }, [refreshBcvRate]);

  // Settings update
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
        updated_at: new Date().toISOString(),
      },
    }));
  }, []);

  // Clients
  const addOrGetClient = useCallback((name: string, phone?: string): Client => {
    const trimmed = name.trim();
    const existing = data.clients.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      if (phone && phone !== existing.phone) {
        setData((prev) => ({
          ...prev,
          clients: prev.clients.map((c) => (c.id === existing.id ? { ...c, phone } : c)),
        }));
      }
      return existing;
    }

    const newClient: Client = {
      id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      phone: phone || '',
      created_at: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients],
    }));

    return newClient;
  }, [data.clients]);

  // Production Batches & Items
  const addBatch = useCallback(
    (
      batchData: { batch_code: string; prep_date: string; notes?: string },
      itemsData: Array<{ size: YogurtSize; flavor: YogurtFlavor; quantity_produced: number }>
    ) => {
      const batchId = `batch-${Date.now()}`;
      const newBatch: ProductionBatch = {
        id: batchId,
        batch_code: batchData.batch_code,
        prep_date: batchData.prep_date,
        notes: batchData.notes,
        created_at: new Date().toISOString(),
      };

      const newItems: ProductionItem[] = itemsData.map((item, index) => ({
        id: `pi-${Date.now()}-${index}`,
        batch_id: batchId,
        size: item.size,
        flavor: item.flavor,
        quantity_produced: item.quantity_produced,
        quantity_remaining: item.quantity_produced,
      }));

      setData((prev) => ({
        ...prev,
        batches: [newBatch, ...prev.batches],
        productionItems: [...prev.productionItems, ...newItems],
      }));
    },
    []
  );

  const deleteBatch = useCallback((batchId: string) => {
    setData((prev) => ({
      ...prev,
      batches: prev.batches.filter((b) => b.id !== batchId),
      productionItems: prev.productionItems.filter((pi) => pi.batch_id !== batchId),
    }));
  }, []);

  // Expenses
  const addExpense = useCallback(
    (expenseData: {
      expense_date: string;
      description: string;
      category: 'Yogurts' | 'Casa';
      amount_usd: number;
      batch_id?: string;
    }) => {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        expense_date: expenseData.expense_date,
        description: expenseData.description,
        category: expenseData.category,
        amount_usd: expenseData.amount_usd,
        bcv_rate_used: data.settings.bcv_rate,
        batch_id: expenseData.batch_id || undefined,
        created_at: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        expenses: [newExpense, ...prev.expenses],
      }));
    },
    [data.settings.bcv_rate]
  );

  const deleteExpense = useCallback((expenseId: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
    }));
  }, []);

  // Sales & Stock Deduction
  const addSale = useCallback(
    (
      saleData: {
        sale_date: string;
        client_name: string;
        client_phone?: string;
        payment_status: 'Pagado' | 'Pendiente';
      },
      itemsData: Array<{
        batch_id: string;
        production_item_id: string;
        size: YogurtSize;
        flavor: YogurtFlavor;
        quantity: number;
        unit_price_usd: number;
        subtotal_usd: number;
      }>
    ) => {
      const client = addOrGetClient(saleData.client_name, saleData.client_phone);
      const saleId = `sale-${Date.now()}`;
      const totalUsd = itemsData.reduce((sum, item) => sum + item.subtotal_usd, 0);

      const newSale: Sale = {
        id: saleId,
        sale_date: saleData.sale_date,
        client_id: client.id,
        client_name: client.name,
        payment_status: saleData.payment_status,
        total_usd: totalUsd,
        bcv_rate_used: data.settings.bcv_rate,
        paid_at: saleData.payment_status === 'Pagado' ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
      };

      const newSaleItems: SaleItem[] = itemsData.map((item, index) => ({
        id: `si-${Date.now()}-${index}`,
        sale_id: saleId,
        batch_id: item.batch_id,
        production_item_id: item.production_item_id,
        size: item.size,
        flavor: item.flavor,
        quantity: item.quantity,
        unit_price_usd: item.unit_price_usd,
        subtotal_usd: item.subtotal_usd,
      }));

      // Deduct stock from production items
      setData((prev) => {
        const itemDeductions: Record<string, number> = {};
        for (const item of itemsData) {
          itemDeductions[item.production_item_id] =
            (itemDeductions[item.production_item_id] || 0) + item.quantity;
        }

        const updatedProductionItems = prev.productionItems.map((pi) => {
          const deduction = itemDeductions[pi.id];
          if (deduction) {
            return {
              ...pi,
              quantity_remaining: Math.max(0, pi.quantity_remaining - deduction),
            };
          }
          return pi;
        });

        return {
          ...prev,
          sales: [newSale, ...prev.sales],
          saleItems: [...prev.saleItems, ...newSaleItems],
          productionItems: updatedProductionItems,
        };
      });

      if (saleData.payment_status === 'Pagado') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    },
    [addOrGetClient, data.settings.bcv_rate]
  );

  const markSaleAsPaid = useCallback((saleId: string) => {
    setData((prev) => ({
      ...prev,
      sales: prev.sales.map((s) =>
        s.id === saleId
          ? {
              ...s,
              payment_status: 'Pagado',
              paid_at: new Date().toISOString(),
            }
          : s
      ),
    }));

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
    });
  }, []);

  const deleteSale = useCallback((saleId: string) => {
    setData((prev) => {
      // Find items from this sale to restore stock
      const itemsToRestore = prev.saleItems.filter((si) => si.sale_id === saleId);
      const restoreMap: Record<string, number> = {};
      for (const item of itemsToRestore) {
        restoreMap[item.production_item_id] =
          (restoreMap[item.production_item_id] || 0) + item.quantity;
      }

      const updatedProductionItems = prev.productionItems.map((pi) => {
        const restoreAmount = restoreMap[pi.id];
        if (restoreAmount) {
          return {
            ...pi,
            quantity_remaining: Math.min(
              pi.quantity_produced,
              pi.quantity_remaining + restoreAmount
            ),
          };
        }
        return pi;
      });

      return {
        ...prev,
        sales: prev.sales.filter((s) => s.id !== saleId),
        saleItems: prev.saleItems.filter((si) => si.sale_id !== saleId),
        productionItems: updatedProductionItems,
      };
    });
  }, []);

  // Restore & Reset
  const restoreBackup = useCallback((backup: AppBackupData) => {
    setData(backup);
    saveAppStateToStorage(backup);
  }, []);

  const resetToDemo = useCallback(() => {
    const initial = getInitialBackupData();
    setData(initial);
    saveAppStateToStorage(initial);
  }, []);

  // Computed Pending summaries for Header Badge
  const pendingSales = useMemo(
    () => data.sales.filter((s) => s.payment_status === 'Pendiente'),
    [data.sales]
  );

  const pendingSalesCount = pendingSales.length;
  const pendingSalesTotalUsd = useMemo(
    () => pendingSales.reduce((sum, s) => sum + Number(s.total_usd), 0),
    [pendingSales]
  );
  const pendingSalesTotalBs = useMemo(
    () => convertUSDToBs(pendingSalesTotalUsd, data.settings.bcv_rate),
    [pendingSalesTotalUsd, data.settings.bcv_rate]
  );

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        settings: data.settings,
        updateSettings,
        batches: data.batches,
        productionItems: data.productionItems,
        addBatch,
        deleteBatch,
        expenses: data.expenses,
        addExpense,
        deleteExpense,
        clients: data.clients,
        addOrGetClient,
        sales: data.sales,
        saleItems: data.saleItems,
        addSale,
        markSaleAsPaid,
        deleteSale,
        salesFilter,
        setSalesFilter,
        isBcvLoading,
        bcvLastUpdated,
        refreshBcvRate,
        pendingSalesCount,
        pendingSalesTotalUsd,
        pendingSalesTotalBs,
        openSettingsModal,
        setOpenSettingsModal,
        isMobileSimulated,
        setIsMobileSimulated,
        restoreBackup,
        resetToDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
