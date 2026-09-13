import React from 'react';
import { Scale, ShieldCheck, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/60 py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left info */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200">PriceScale Calculator</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Built for instant Kirana, market shopping, and precision financial calculations.
              </p>
            </div>
          </div>

          {/* Center feature highlights */}
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Offline Math</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Local Storage Privacy</span>
            </span>
          </div>

          {/* Right developer note */}
          <div className="text-right text-[11px] text-slate-400">
            <p>Ready for unlimited calculator modules.</p>
            <p className="text-slate-400 mt-0.5">Designed with React + Tailwind CSS</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
