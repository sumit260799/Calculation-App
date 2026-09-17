import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import {
  CURRENCIES_LIST,
  POPULAR_CURRENCIES,
  getCurrencyMeta,
  searchCurrencies,
  type CurrencyMeta,
} from '../../../data/currencies';
import { playFeedback } from '../../../utils/feedback';

interface CurrencySelectorProps {
  label: string;
  value: string;
  onChange: (currencyCode: string) => void;
  disabledCurrencies?: string[];
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  label,
  value,
  onChange,
  disabledCurrencies = [],
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentMeta = getCurrencyMeta(value);

  const filteredCurrencies = useMemo(() => {
    return searchCurrencies(searchQuery, CURRENCIES_LIST);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (code: string) => {
    playFeedback.click();
    onChange(code);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredCurrencies.length - 1 ? prev + 1 : 0
      );
      scrollHighlightedIntoView(highlightedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCurrencies.length - 1
      );
      scrollHighlightedIntoView(highlightedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCurrencies[highlightedIndex];
      if (selected && !disabledCurrencies.includes(selected.code)) {
        handleSelect(selected.code);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const scrollHighlightedIntoView = (index: number) => {
    const list = listRef.current;
    if (!list) return;
    const items = list.querySelectorAll('[data-currency-item]');
    const targetItem = items[index] as HTMLElement;
    if (targetItem) {
      targetItem.scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl select-none shrink-0" role="img" aria-label={currentMeta.name}>
            {currentMeta.flag}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-100 tracking-wide font-mono">
                {currentMeta.code}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {currentMeta.symbol}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[150px] sm:max-w-[180px]">
              {currentMeta.name}
            </div>
          </div>
        </div>

        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0 transition-transform group-hover:translate-y-0.5" />
      </button>

      {/* Currency Selection Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop Click */}
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header with Search */}
            <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">
                  Select {label} Currency
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder="Search by code or country (e.g. USD, Rupee, Euro)..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Popular Currencies Quick Chips */}
              {!searchQuery && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0 mr-1">
                    Popular:
                  </span>
                  {POPULAR_CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelect(c.code)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-medium border shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                        c.code === value
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currencies List */}
            <div
              ref={listRef}
              className="p-2 overflow-y-auto space-y-1 max-h-[50vh] divide-y divide-slate-800/40"
            >
              {filteredCurrencies.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No currencies match &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredCurrencies.map((c, index) => {
                  const isSelected = c.code === value;
                  const isDisabled = disabledCurrencies.includes(c.code);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={c.code}
                      data-currency-item
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelect(c.code)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isHighlighted
                          ? 'bg-slate-800/90 text-slate-100'
                          : 'hover:bg-slate-800/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl select-none shrink-0">{c.flag}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm tracking-wide">
                              {c.code}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {c.symbol}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {c.name}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer with summary */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
              <span>{filteredCurrencies.length} currencies available</span>
              <span className="hidden sm:inline">Use ↑ ↓ and Enter to select</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
