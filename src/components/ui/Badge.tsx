import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'indigo' | 'amber' | 'slate' | 'rose';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'emerald',
  size = 'sm',
  ...props
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full',
          size === 'sm' && 'text-[11px] px-2.5 py-0.5',
          size === 'md' && 'text-xs px-3 py-1',

          variant === 'emerald' && 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
          variant === 'indigo' && 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
          variant === 'amber' && 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
          variant === 'rose' && 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
          variant === 'slate' && 'bg-slate-800 text-slate-300 border border-slate-700',

          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};
