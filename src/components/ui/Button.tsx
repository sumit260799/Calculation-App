import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'chip' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  active = false,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98]',
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
          
          // Variants
          variant === 'primary' && 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/25',
          variant === 'secondary' && 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80',
          variant === 'outline' && 'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500',
          variant === 'ghost' && 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
          variant === 'danger' && 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30',
          variant === 'chip' && [
            'rounded-full font-mono text-xs font-medium border transition-colors',
            active 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20' 
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/70 hover:border-slate-600'
          ],

          // Sizes
          size === 'sm' && 'text-xs px-2.5 py-1.5 gap-1.5',
          size === 'md' && 'text-sm px-4 py-2.5 gap-2',
          size === 'lg' && 'text-base px-6 py-3.5 gap-2.5 font-semibold',
          size === 'icon' && 'p-2.5 aspect-square',

          className
        )
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
