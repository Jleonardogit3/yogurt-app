import { SIZE_WEIGHT_MAP } from '../types';
import type { ProductionItem, Sale, Expense, SaleItem } from '../types';

export function calculateTotalWeightKg(items: ProductionItem[]): number {
  const totalGrams = items.reduce((sum, item) => {
    const weightPerUnit = SIZE_WEIGHT_MAP[item.size] || 0;
    return sum + (item.quantity_produced * weightPerUnit);
  }, 0);
  return Math.round((totalGrams / 1000) * 100) / 100;
}

export function calculateRemainingWeightKg(items: ProductionItem[]): number {
  const totalGrams = items.reduce((sum, item) => {
    const weightPerUnit = SIZE_WEIGHT_MAP[item.size] || 0;
    return sum + (item.quantity_remaining * weightPerUnit);
  }, 0);
  return Math.round((totalGrams / 1000) * 100) / 100;
}

export function calculateFinancialSummary(sales: Sale[], expenses: Expense[]) {
  // Sales summaries
  const totalSalesUsd = sales.reduce((sum, s) => sum + Number(s.total_usd), 0);
  const paidSalesUsd = sales
    .filter((s) => s.payment_status === 'Pagado')
    .reduce((sum, s) => sum + Number(s.total_usd), 0);
  const pendingSalesUsd = sales
    .filter((s) => s.payment_status === 'Pendiente')
    .reduce((sum, s) => sum + Number(s.total_usd), 0);
  const pendingSalesCount = sales.filter((s) => s.payment_status === 'Pendiente').length;

  // Expenses summaries (Strict separation: Yogurts vs Casa)
  const yogurtExpensesUsd = expenses
    .filter((e) => e.category === 'Yogurts')
    .reduce((sum, e) => sum + Number(e.amount_usd), 0);

  const homeExpensesUsd = expenses
    .filter((e) => e.category === 'Casa')
    .reduce((sum, e) => sum + Number(e.amount_usd), 0);

  const totalExpensesUsd = yogurtExpensesUsd + homeExpensesUsd;

  // Profitability calculations (Devengada vs En Caja)
  const netProfitDevengadaUsd = totalSalesUsd - yogurtExpensesUsd;
  const netProfitCajaUsd = paidSalesUsd - yogurtExpensesUsd;

  return {
    totalSalesUsd,
    paidSalesUsd,
    pendingSalesUsd,
    pendingSalesCount,
    yogurtExpensesUsd,
    homeExpensesUsd,
    totalExpensesUsd,
    netProfitDevengadaUsd,
    netProfitCajaUsd,
  };
}

export function getClientPurchaseSummary(
  clientName: string,
  sales: Sale[],
  saleItems: SaleItem[]
) {
  const clientSales = sales.filter(
    (s) => s.client_name.trim().toLowerCase() === clientName.trim().toLowerCase()
  );

  const totalSpentUsd = clientSales.reduce((acc, s) => acc + Number(s.total_usd), 0);
  const totalDebtUsd = clientSales
    .filter((s) => s.payment_status === 'Pendiente')
    .reduce((acc, s) => acc + Number(s.total_usd), 0);

  const clientSaleIds = new Set(clientSales.map((s) => s.id));
  const relevantItems = saleItems.filter((item) => clientSaleIds.has(item.sale_id));

  // Count favorite flavors
  const flavorCounts: Record<string, number> = {};
  for (const item of relevantItems) {
    flavorCounts[item.flavor] = (flavorCounts[item.flavor] || 0) + item.quantity;
  }

  const topFlavors = Object.entries(flavorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([flavor, count]) => ({ flavor, count }));

  return {
    totalOrders: clientSales.length,
    totalSpentUsd,
    totalDebtUsd,
    hasPendingDebt: totalDebtUsd > 0,
    topFlavors,
    sales: clientSales,
  };
}
