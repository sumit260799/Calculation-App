import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, Pencil, RotateCcw } from 'lucide-react';
import type { RateMode } from '../types';
import { formatRate } from '../../../utils/currency';
import { playFeedback } from '../../../utils/feedback';

interface RateModeSelectorProps {
  mode: RateMode;
  onModeChange: (mode: RateMode) => void;
  liveRate: number;
  customRate: number;
  onCustomRateChange: (rate: number) => void;
  fromCurrency: string;
  toCurrency: string;
}

export const RateModeSelector: React.FC<RateModeSelectorProps> = ({
  mode,
  onModeChange,
  liveRate,
  customRate,
  onCustomRateChange,
  fromCurrency,
  toCurrency,
}) => {
  // Local string states to allow typing, clearing (backspacing) without auto-prefill jumping
  const [bataInput, setBataInput] = useState<string>(() => {
    const rate = customRate > 0 ? customRate : liveRate;
    return rate > 0 ? (rate * 100).toFixed(2).replace(/\.?0+$/, '') : '';
  });

  const [directRateInput, setDirectRateInput] = useState<string>(() => {
    const rate = customRate > 0 ? customRate : liveRate;
    return rate > 0 ? rate.toString() : '';
  });

  // Keep strings synced when currencies change or liveRate loads
  useEffect(() => {
    if (customRate > 0) {
      setBataInput((customRate * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, ''));
      setDirectRateInput(customRate.toString());
    } else if (liveRate > 0) {
      setBataInput((liveRate * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, ''));
      setDirectRateInput(liveRate.toString());
    }
  }, [fromCurrency, toCurrency, liveRate]);

  const handleSelectMode = (newMode: RateMode) => {
    playFeedback.click();
    onModeChange(newMode);
    if (newMode === 'custom' && (!customRate || customRate <= 0)) {
      const initial = liveRate > 0 ? liveRate : 1;
      onCustomRateChange(initial);
      setBataInput((initial * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, ''));
      setDirectRateInput(initial.toString());
    }
  };

  const handleBataChange = (valStr: string) => {
    // Allow empty string, numbers, and single decimal point
    if (valStr === '' || /^[0-9]*\.?[0-9]*$/.test(valStr)) {
      setBataInput(valStr);
      if (valStr === '' || valStr === '.') {
        onCustomRateChange(0);
        setDirectRateInput('');
      } else {
        const parsed = parseFloat(valStr);
        if (!isNaN(parsed) && parsed >= 0) {
          const newRate = parsed / 100;
          onCustomRateChange(newRate);
          setDirectRateInput(newRate.toString());
        }
      }
    }
  };

  const handleDirectRateChange = (valStr: string) => {
    if (valStr === '' || /^[0-9]*\.?[0-9]*$/.test(valStr)) {
      setDirectRateInput(valStr);
      if (valStr === '' || valStr === '.') {
        onCustomRateChange(0);
        setBataInput('');
      } else {
        const parsed = parseFloat(valStr);
        if (!isNaN(parsed) && parsed >= 0) {
          onCustomRateChange(parsed);
          setBataInput((parsed * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, ''));
        }
      }
    }
  };

  const handleResetToLive = () => {
    playFeedback.click();
    onCustomRateChange(liveRate);
    const bataVal = (liveRate * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    setBataInput(bataVal);
    setDirectRateInput(liveRate.toString());
  };

  const handlePresetClick = (p: number) => {
    playFeedback.click();
    const newRate = p / 100;
    onCustomRateChange(newRate);
    setBataInput(p.toString());
    setDirectRateInput(newRate.toString());
  };

  const activeRate = customRate > 0 ? customRate : (bataInput ? parseFloat(bataInput) / 100 : liveRate);
  const currentBataNum = bataInput ? parseFloat(bataInput) : (liveRate * 100);
  const roundedBata = Math.round(currentBataNum || 100);
  const presets = [
    roundedBata - 4,
    roundedBata - 2,
    roundedBata,
    roundedBata + 2,
    roundedBata + 4,
  ].filter((p) => p > 0);

  return (
    <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Exchange Rate Mode</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          1 {fromCurrency} = {formatRate(activeRate, 3)} {toCurrency}
        </span>
      </div>

      {/* Two Tabs: Live Market Rate and Custom Rate / Bata */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => handleSelectMode('live')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mode === 'live'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Market Rate</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode('custom')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mode === 'custom'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Custom Rate / Bata</span>
        </button>
      </div>

      {/* Mode 1: Live Rate Status */}
      {mode === 'live' && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Using official real-time central bank benchmark rate.</span>
          <span className="text-emerald-400 font-medium">Auto-synced</span>
        </div>
      )}

      {/* Mode 2: Custom Rate / Bata Area */}
      {mode === 'custom' && (
        <div className="space-y-3 pt-1 border-t border-slate-800/60 animate-in fade-in duration-150">
          {/* Header with reset to live */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-bold">
              Custom Rate / Ratio / Bata:
            </span>
            <button
              type="button"
              onClick={handleResetToLive}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Live (100 = {formatRate(liveRate * 100, 2)})</span>
            </button>
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

          {/* Quick Bata / Ratio Presets */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Quick Bata Ratios:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
                    Math.abs(currentBataNum - p) < 0.01
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 font-bold'
                      : 'bg-slate-950/70 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Field: Exact Rate per 1 unit */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Direct rate (1 {fromCurrency}):</span>
            <div className="flex items-center gap-1 w-32">
              <input
                type="text"
                inputMode="decimal"
                value={directRateInput}
                onChange={(e) => handleDirectRateChange(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-200 text-right placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
              />
              <span className="text-[11px] font-mono shrink-0">{toCurrency}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
