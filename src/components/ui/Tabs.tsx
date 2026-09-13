import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'pills',
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          variant === 'pills' && 'flex p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800/80 gap-1 overflow-x-auto',
          variant === 'underline' && 'flex border-b border-slate-800 gap-4 overflow-x-auto',
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={twMerge(
              clsx(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-150 rounded-xl whitespace-nowrap cursor-pointer select-none',
                variant === 'pills' && [
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                ],
                variant === 'underline' && [
                  'pb-3 border-b-2 -mb-px rounded-none',
                  isActive
                    ? 'border-emerald-400 text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                ]
              )
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={clsx(
                'ml-1 text-xs px-2 py-0.5 rounded-full font-mono',
                isActive ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
