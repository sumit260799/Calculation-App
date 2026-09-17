import React, { useState, useEffect } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import type { RateMode } from '../types';
import { formatRate } from '../../../utils/currency';
import { playFeedback } from '../../../utils/feedback';

interface RateModeSelectorProps {
  mode?: RateMode;
  onModeChange?: (mode: RateMode) => void;
  liveRate: number;
  customRate: number;
  onCustomRateChange: (rate: number) => void;
  fromCurrency: string;
  toCurrency: string;
}

export const RateModeSelector: React.FC<RateModeSelectorProps> = ({
  onModeChange,
  liveRate,
  customRate,
  onCustomRateChange,
  fromCurrency,
  toCurrency,
}) => {
  // Local string state to allow typing, clearing (backspacing) without auto-prefill jumping
  const [bataInput, setBataInput] = useState<string>(() => {
    const rate = customRate > 0 ? customRate : liveRate;
    return rate > 0 ? (rate * 100).toFixed(2).replace(/\.?0+$/, '') : '';
  });

  // Keep strings synced when currencies change or liveRate loads
  useEffect(() => {
    if (customRate > 0) {
      setBataInput((customRate * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, ''));
    } else if (liveRate > 0) {
      setBataInput((liveRate * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, ''));
    }
  }, [fromCurrency, toCurrency, liveRate]);

  const handleBataChange = (valStr: string) => {
    // Allow empty string, numbers, and single decimal point
    if (valStr === '' || /^[0-9]*\.?[0-9]*$/.test(valStr)) {
      setBataInput(valStr);
      if (valStr === '' || valStr === '.') {
        onCustomRateChange(0);
        onModeChange?.('live');
      } else {
        const parsed = parseFloat(valStr);
        if (!isNaN(parsed) && parsed >= 0) {
          const newRate = parsed / 100;
          onCustomRateChange(newRate);
          onModeChange?.('custom');
        }
      }
    }
  };

  const handleResetToLive = () => {
    playFeedback.click();
    onCustomRateChange(liveRate);
    const bataVal = (liveRate * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    setBataInput(bataVal);
    onModeChange?.('live');
  };

  const activeRate = customRate > 0 ? customRate : (bataInput ? parseFloat(bataInput) / 100 : liveRate);

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm space-y-3">
      {/* Header with reset to live */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
          <Pencil className="w-3.5 h-3.5 text-amber-400" />
          <span>Custom Rate / Ratio / Bata:</span>
        </div>
        {liveRate > 0 && (
          <button
            type="button"
            onClick={handleResetToLive}
            className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Live (100 = {formatRate(liveRate * 100, 2)})</span>
          </button>
        )}
      </div>

      {/* Primary Field: Value / Bata (for 100 units) */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-amber-300">
            Value / Bata (for 100 {fromCurrency}):
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            Ratio per 100
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={bataInput}
            onChange={(e) => handleBataChange(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-14 py-2.5 text-base font-mono font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono font-bold pointer-events-none">
            {toCurrency}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            100 {fromCurrency} ={' '}
            <strong className="text-amber-300">{bataInput || '0'}</strong> {toCurrency}
          </span>
          <span className="font-mono text-slate-300">
            1 {fromCurrency} = {formatRate(activeRate, 3)} {toCurrency}
          </span>
        </div>
      </div>
    </div>
  );
};
