import React, { useState } from 'react';
import { History, Trash2, ArrowRight, Copy, Check } from 'lucide-react';
import type { RecentConversionItem } from '../../../utils/storage';
import { getCurrencyMeta } from '../../../data/currencies';
import { formatCurrencyAmount } from '../../../utils/currency';
import { playFeedback } from '../../../utils/feedback';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface RecentConversionsProps {
  recents: RecentConversionItem[];
  onApplyConversion: (item: RecentConversionItem) => void;
  onClear: () => void;
}

export const RecentConversions: React.FC<RecentConversionsProps> = ({
  recents,
  onApplyConversion,
  onClear,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: RecentConversionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    playFeedback.click();
    const text = `${item.amount} ${item.from} = ${item.result} ${item.to}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (recents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>Recent Conversions</span>
        </span>
        <button
          type="button"
          onClick={() => {
            playFeedback.click();
            onClear();
          }}
          className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {recents.map((item) => {
          const fromMeta = getCurrencyMeta(item.from);
          const toMeta = getCurrencyMeta(item.to);
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                playFeedback.click();
                onApplyConversion(item);
              }}
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base select-none">{fromMeta.flag}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-100 truncate">
                    <span>
                      {formatCurrencyAmount(item.amount, item.from, { showSymbol: true })}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-emerald-400">
                      {formatCurrencyAmount(item.result, item.to, { showSymbol: true })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{dayjs(item.timestamp).fromNow()}</span>
                    {item.rateMode !== 'live' && (
                      <span className="text-amber-400 capitalize">({item.rateMode} rate)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleCopy(item, e)}
                  title="Copy conversion"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
