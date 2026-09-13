import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'highlight';
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  glow = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl transition-all duration-200 overflow-hidden',
          variant === 'default' && 'bg-slate-900/90 border border-slate-800 shadow-xl',
          variant === 'glass' && 'glass-panel shadow-2xl shadow-black/40',
          variant === 'interactive' && 'glass-card glass-card-interactive cursor-pointer',
          variant === 'highlight' && 'bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/90 border border-emerald-500/30 shadow-2xl shadow-emerald-950/20',
          glow && 'animate-pulse-glow',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
