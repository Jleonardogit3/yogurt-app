import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate' | 'purple' | 'sky';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10',
    sky: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ring-1 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
