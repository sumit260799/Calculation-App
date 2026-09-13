import React from 'react';
import { CALCULATOR_MODULES } from '../../registry/calculators';
import { Scale, Search, Layers, Coins, IndianRupee, ArrowLeftRight } from 'lucide-react';
import { playFeedback } from '../../utils/feedback';

interface HeaderProps {
  activeModuleId: string;
  onSelectModule: (id: string) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Scale: <Scale className="w-4 h-4" />,
  Coins: <Coins className="w-4 h-4" />,
  IndianRupee: <IndianRupee className="w-4 h-4" />,
  ArrowLeftRight: <ArrowLeftRight className="w-4 h-4" />,
};

export const Header: React.FC<HeaderProps> = ({
  activeModuleId,
  onSelectModule,
  searchQuery,
  onSearchQueryChange,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              playFeedback.click();
              onSelectModule('weight-rupee');
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-100">
                  Price<span className="text-emerald-400">Scale</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Precision Calculations & Converter
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search calculations..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full bg-slate-900/80 text-xs text-slate-200 pl-9 pr-3.5 py-2 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Module Selector Chips for Quick Switch */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {CALCULATOR_MODULES.map((mod) => {
              const isActive = activeModuleId === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    playFeedback.click();
                    onSelectModule(mod.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                    {ICONS_MAP[mod.iconName] || <Layers className="w-4 h-4" />}
                  </span>
                  <span>{mod.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
