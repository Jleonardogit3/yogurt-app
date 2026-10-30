import React from 'react';
import { formatUSD, formatBs, convertUSDToBs } from '../../utils/currency';
import { useApp } from '../../context/AppContext';

interface DualPriceProps {
  amountUsd: number;
  rate?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'inline' | 'stacked';
  color?: 'default' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

export const DualPrice: React.FC<DualPriceProps> = ({
  amountUsd,
  rate,
  size = 'md',
  layout = 'inline',
  color = 'default',
}) => {
  const { settings } = useApp();
  const activeRate = rate || settings.bcv_rate;
  const amountBs = convertUSDToBs(amountUsd, activeRate);

  const colorStyles = {
    default: 'text-slate-900',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    indigo: 'text-indigo-600',
  };

  const usdSizeStyles = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl font-black',
  };

  const bsSizeStyles = {
    sm: 'text-xs text-slate-500 font-medium',
    md: 'text-xs text-slate-500 font-medium',
    lg: 'text-sm text-slate-500 font-medium',
    xl: 'text-base text-slate-500 font-medium',
  };

  if (layout === 'stacked') {
    return (
      <div className="flex flex-col">
        <span className={`${usdSizeStyles[size]} ${colorStyles[color]} leading-tight`}>
          {formatUSD(amountUsd)}
        </span>
        <span className={`${bsSizeStyles[size]} leading-tight mt-0.5`}>
          {formatBs(amountBs)}
        </span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-1.5 flex-wrap">
      <span className={`${usdSizeStyles[size]} ${colorStyles[color]}`}>
        {formatUSD(amountUsd)}
      </span>
      <span className={bsSizeStyles[size]}>
        ({formatBs(amountBs)})
      </span>
    </span>
  );
};
