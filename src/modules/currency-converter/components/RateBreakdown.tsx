import React from 'react';
import { Info, ArrowLeftRight, Clock, ShieldCheck, AlertCircle, Percent } from 'lucide-react';
import type { RateMode } from '../types';
import { formatRate, calculateReverseRate } from '../../../utils/currency';
import dayjs from 'dayjs';

interface RateBreakdownProps {
  fromCurrency: string;
  toCurrency: string;
  liveRate: number;
  effectiveRate: number;
  mode: RateMode;
  rateDate?: string;
  isCached?: boolean;
  cachedAt?: number;
  source?: string;
}

export const RateBreakdown: React.FC<RateBreakdownProps> = ({
  fromCurrency,
  toCurrency,
  liveRate,
  effectiveRate,
  mode,
  rateDate,
  isCached,
  cachedAt,
  source = 'Market Benchmark',
}) => {
  const reverseRate = calculateReverseRate(effectiveRate);

  const formattedDate = rateDate
    ? dayjs(rateDate).format('MMM D, YYYY')
    : dayjs().format('MMM D, YYYY');

  const formattedTime = cachedAt ? dayjs(cachedAt).format('h:mm A') : null;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Rate Breakdown & Attribution</span>
        </div>

        {/* Mode Badge */}
        {mode === 'live' ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Market Live
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/40">
            Custom Rate / Bata
          </span>
        )}
      </div>

      {/* Grid of Calculations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex justify-between items-center">
          <span className="text-slate-400">Effective Rate (1 unit):</span>
          <span className="font-mono font-bold text-slate-100">
            1 {fromCurrency} = {formatRate(effectiveRate, 3)} {toCurrency}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <Percent className="w-3 h-3 text-amber-400" />
            Ratio / Bata (100 units):
          </span>
          <span className="font-mono font-bold text-amber-300">
            100 {fromCurrency} = {formatRate(effectiveRate * 100, 2)} {toCurrency}
          </span>
        </div>
      </div>

      {/* Reverse rate */}
      <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-850 flex justify-between items-center text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <ArrowLeftRight className="w-3 h-3 text-slate-500" />
          Inverse Conversion:
        </span>
        <span className="text-slate-300 font-semibold">
          1 {toCurrency} = {formatRate(reverseRate, 3)} {fromCurrency}
        </span>
      </div>

      {/* Attribution and Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          {isCached ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>
            {isCached ? (
              <span className="text-amber-300">
                Offline rate {formattedTime ? `(retrieved at ${formattedTime})` : ''}
              </span>
            ) : (
              <span>Source: {source}</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Updated: {formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
