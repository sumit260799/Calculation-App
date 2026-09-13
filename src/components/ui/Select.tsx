import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  shortLabel?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full min-w-0">
        <select
          id={selectId}
          className={twMerge(
            clsx(
              'w-full min-w-0 appearance-none bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-medium rounded-xl border border-slate-700/80 pl-2.5 pr-7 py-2.5 cursor-pointer transition-all duration-150 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner truncate',
              className
            )
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-slate-400 pointer-events-none shrink-0" />
      </div>
    </div>
  );
};
