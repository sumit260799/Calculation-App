import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, prefixElement, suffixElement, error, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full min-w-0 flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
            {label}
          </label>
        )}
        <div className="relative flex items-center group w-full min-w-0">
          {prefixElement && (
            <div className="absolute left-2.5 sm:left-3 flex items-center pointer-events-none text-slate-400 font-semibold group-focus-within:text-emerald-400 transition-colors shrink-0">
              {prefixElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                'w-full min-w-0 bg-slate-900/90 text-slate-100 font-mono text-base rounded-xl border border-slate-700/80 px-3 py-2.5 transition-all duration-150 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner',
                prefixElement && 'pl-7 sm:pl-8',
                suffixElement && 'pr-12 sm:pr-16',
                error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
                className
              )
            )}
            {...props}
          />
          {suffixElement && (
            <div className="absolute right-2 flex items-center text-slate-400 text-xs sm:text-sm font-medium shrink-0">
              {suffixElement}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs text-rose-400 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
