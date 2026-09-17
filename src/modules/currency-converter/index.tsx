import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Copy,
  Share2,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { currencyService, type RateResult } from '../../services/currencyService';
import { getCurrencyMeta } from '../../data/currencies';
import {
  convertCurrency,
  getEffectiveRate,
  formatCurrencyAmount,
  formatRate,
  calculateReverseRate,
} from '../../utils/currency';
import {
  getFavoritePairs,
  toggleFavoritePair,
  isFavoritePair,
  getRecentConversions,
  addRecentConversion,
  clearRecentConversions,
  type CurrencyPair,
  type RecentConversionItem,
} from '../../utils/storage';
import { playFeedback } from '../../utils/feedback';
import type { RateMode } from './types';
import { CurrencySelector } from './components/CurrencySelector';
import { RateModeSelector } from './components/RateModeSelector';
import { RateBreakdown } from './components/RateBreakdown';
import { HistoricalRateChart } from './components/HistoricalRateChart';
import { FavoritePairs } from './components/FavoritePairs';
import { RecentConversions } from './components/RecentConversions';

const QUICK_AMOUNTS = [1, 10, 50, 100, 500, 1000, 10000];

export const CurrencyConverter: React.FC = () => {
  // Read initial values from URL search params if present
  const [fromCurrency, setFromCurrency] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('from')?.toUpperCase() || 'USD';
  });

  const [toCurrency, setToCurrency] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('to')?.toUpperCase() || 'INR';
  });

  const [amountStr, setAmountStr] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('amount') || '1000';
  });

  const amount = useMemo(() => {
    const parsed = parseFloat(amountStr);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }, [amountStr]);

  const [rateMode, setRateMode] = useState<RateMode>('live');
  const [customRate, setCustomRate] = useState<number>(0);

  const [favorites, setFavorites] = useState<CurrencyPair[]>(getFavoritePairs);
  const [recents, setRecents] = useState<RecentConversionItem[]>(getRecentConversions);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Sync state to URL search parameters for shareability
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('from', fromCurrency);
    url.searchParams.set('to', toCurrency);
    url.searchParams.set('amount', amountStr || '0');
    window.history.replaceState({}, '', url.toString());
  }, [fromCurrency, toCurrency, amountStr]);

  // React Query for live rate fetching
  const {
    data: rateResult,
    isLoading: isRateLoading,
    isError: isRateError,
    error: rateError,
    refetch: refetchRate,
    isFetching: isRateFetching,
  } = useQuery<RateResult>({
    queryKey: ['exchangeRate', fromCurrency, toCurrency],
    queryFn: () => currencyService.getLatestRate(fromCurrency, toCurrency),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 1,
    enabled: Boolean(fromCurrency && toCurrency),
  });

  const liveRate = rateResult?.rate ?? (fromCurrency === toCurrency ? 1 : 0);

  // Compute effective rate based on mode ('live' or 'custom')
  const effectiveRate = useMemo(() => {
    return getEffectiveRate(rateMode, liveRate, customRate);
  }, [rateMode, liveRate, customRate]);

  const toMeta = getCurrencyMeta(toCurrency);
  const fromMeta = getCurrencyMeta(fromCurrency);

  // Converted amount calculated locally without API calls on keystroke (exact up to 3 decimals)
  const convertedAmount = useMemo(() => {
    if (!effectiveRate || effectiveRate <= 0) return 0;
    return convertCurrency(amount, effectiveRate, 3);
  }, [amount, effectiveRate]);

  // Debounced recording of recent conversion
  useEffect(() => {
    if (amount > 0 && convertedAmount > 0 && effectiveRate > 0) {
      const timer = setTimeout(() => {
        const updated = addRecentConversion({
          from: fromCurrency,
          to: toCurrency,
          amount,
          result: convertedAmount,
          rate: effectiveRate,
          rateMode,
        });
        setRecents(updated);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [fromCurrency, toCurrency, amount, convertedAmount, effectiveRate, rateMode]);

  // Swap currencies
  const handleSwapCurrencies = useCallback(() => {
    playFeedback.click();
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);

    const prevFrom = fromCurrency;
    const prevTo = toCurrency;

    setFromCurrency(prevTo);
    setToCurrency(prevFrom);

    // If in custom mode, invert the custom rate safely
    if (rateMode === 'custom' && customRate > 0) {
      setCustomRate(calculateReverseRate(customRate));
    }
  }, [fromCurrency, toCurrency, rateMode, customRate]);

  // Copy result to clipboard
  const handleCopyResult = () => {
    playFeedback.click();
    const copyText = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      toast.success('Conversion copied', {
        description: copyText,
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Share conversion
  const handleShare = () => {
    playFeedback.click();
    const shareData = {
      title: `${amount} ${fromCurrency} to ${toCurrency}`,
      text: `${amount} ${fromCurrency} = ${formatCurrencyAmount(convertedAmount, toCurrency, { showSymbol: true })} (Rate: 1 ${fromCurrency} = ${formatRate(effectiveRate)} ${toCurrency})`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // user cancelled or share failed
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.info('Share link copied to clipboard!');
      });
    }
  };

  // Toggle favorite pair
  const handleToggleFavorite = () => {
    const updated = toggleFavoritePair(fromCurrency, toCurrency);
    setFavorites(updated);
    const nowFavorite = isFavoritePair(fromCurrency, toCurrency, updated);
    if (nowFavorite) {
      toast.success(`Saved ${fromCurrency}/${toCurrency} to favorites`);
    } else {
      toast.info(`Removed ${fromCurrency}/${toCurrency} from favorites`);
    }
  };

  const isCurrentFavorite = isFavoritePair(fromCurrency, toCurrency, favorites);

  // Quick select favorite pair
  const handleSelectPair = (f: string, t: string) => {
    setFromCurrency(f);
    setToCurrency(t);
  };

  // Apply recent conversion
  const handleApplyRecent = (item: RecentConversionItem) => {
    setFromCurrency(item.from);
    setToCurrency(item.to);
    setAmountStr(item.amount.toString());
    setRateMode(item.rateMode);
    if (item.rateMode === 'custom') {
      setCustomRate(item.rate);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-10">
      {/* Main Grid: Left Column (Converter & Controls) + Right Column (Historical Chart & Recents) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Main Converter (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Conversion Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4 relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Error Banner if API fails and no rate is available */}
            {isRateError && !rateResult && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    {(rateError as any)?.message ||
                      'Unable to retrieve the latest exchange rate.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => refetchRate()}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg font-semibold cursor-pointer shrink-0"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Currency Selectors & Swap Button Row */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-1.5">
              {/* FROM Currency */}
              <CurrencySelector
                label="From"
                value={fromCurrency}
                onChange={setFromCurrency}
              />

              {/* Swap Button */}
              <div className="flex justify-center sm:pt-5">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  title="Swap currencies"
                  className={`p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/90 text-emerald-400 border border-slate-700 shadow-md transition-all cursor-pointer active:scale-90 ${isSwapping ? 'rotate-180 duration-300' : 'duration-150'
                    }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* TO Currency */}
              <CurrencySelector
                label="To"
                value={toCurrency}
                onChange={setToCurrency}
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Amount to Convert
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-slate-400">
                  {fromMeta.symbol}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                      setAmountStr(val);
                    }
                  }}
                  placeholder="0"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-xl font-mono font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            {/* Quick Conversion Amount Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0 mr-1">
                Presets:
              </span>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    playFeedback.click();
                    setAmountStr(amt.toString());
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all shrink-0 cursor-pointer active:scale-95 ${amount === amt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>

            {/* Conversion Result Display */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 shadow-inner space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Converted Result</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playFeedback.click();
                      refetchRate();
                    }}
                    disabled={isRateFetching}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                    title="Refresh rate"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRateFetching ? 'animate-spin text-emerald-400' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyResult}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                    title="Copy result"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px] font-medium hidden sm:inline">
                      {copied ? 'Copied' : 'Copy'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Share conversion"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Big Result Output */}
              <div className="flex items-baseline gap-2 flex-wrap min-h-[3rem]">
                {isRateLoading && !rateResult ? (
                  <div className="flex items-center gap-2 text-slate-400 animate-pulse font-mono text-2xl font-bold py-1">
                    <span>{toMeta.symbol}</span>
                    <span className="bg-slate-800 rounded-lg w-40 h-8 inline-block" />
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                      {formatCurrencyAmount(convertedAmount, toCurrency, { showSymbol: true })}
                    </span>
                    <span className="text-sm font-bold text-slate-400 font-mono">
                      {toCurrency}
                    </span>
                  </>
                )}
              </div>

              {/* Subtext: 1 USD = 88.50 INR & Bata / Ratio */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="space-y-0.5">
                  <div className="text-slate-300 font-mono">
                    1 {fromCurrency} ={' '}
                    <span className="text-emerald-400 font-bold">
                      {formatRate(effectiveRate, 3)} {toCurrency}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-300/90 font-mono">
                    100 {fromCurrency} = <strong>{formatRate(effectiveRate * 100, 2)} {toCurrency}</strong> (Ratio / Bata)
                  </div>
                </div>

                {rateMode === 'custom' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Custom Rate / Bata
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rate Mode Selector (Live Rate, Custom Rate / Bata) */}
          <RateModeSelector
            mode={rateMode}
            onModeChange={setRateMode}
            liveRate={liveRate}
            customRate={customRate}
            onCustomRateChange={setCustomRate}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
          />

          {/* Rate Breakdown & Attribution */}
          <RateBreakdown
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            liveRate={liveRate}
            effectiveRate={effectiveRate}
            mode={rateMode}
            rateDate={rateResult?.date}
            isCached={rateResult?.isCached}
            cachedAt={rateResult?.cachedAt}
            source={rateResult?.source}
          />
        </div>

        {/* RIGHT COLUMN: Historical Chart, Favorites & Recents (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Historical Rate Trends Card */}
          <HistoricalRateChart
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
          />

          {/* Favorite Currency Pairs */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm">
            <FavoritePairs
              favorites={favorites}
              onSelectPair={handleSelectPair}
              activeFrom={fromCurrency}
              activeTo={toCurrency}
              onToggleCurrentPair={handleToggleFavorite}
              isCurrentPairFavorite={isCurrentFavorite}
            />
          </div>

          {/* Recent Conversions */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm">
            <RecentConversions
              recents={recents}
              onApplyConversion={handleApplyRecent}
              onClear={() => {
                clearRecentConversions();
                setRecents([]);
                toast.info('Recent conversions history cleared');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
