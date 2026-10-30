export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatBs(amount: number): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
  return `Bs. ${formatted}`;
}

export function convertUSDToBs(amountUsd: number, bcvRate: number): number {
  return Math.round((amountUsd || 0) * (bcvRate || 1) * 100) / 100;
}

export function convertBsToUSD(amountBs: number, bcvRate: number): number {
  if (!bcvRate || bcvRate <= 0) return 0;
  return Math.round(((amountBs || 0) / bcvRate) * 100) / 100;
}
