import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import type { CurrencyPair } from '../../../utils/storage';
import { getCurrencyMeta } from '../../../data/currencies';
import { playFeedback } from '../../../utils/feedback';

interface FavoritePairsProps {
  favorites: CurrencyPair[];
  onSelectPair: (from: string, to: string) => void;
  activeFrom: string;
  activeTo: string;
  onToggleCurrentPair: () => void;
  isCurrentPairFavorite: boolean;
}

export const FavoritePairs: React.FC<FavoritePairsProps> = ({
  favorites,
  onSelectPair,
  activeFrom,
  activeTo,
  onToggleCurrentPair,
  isCurrentPairFavorite,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Favorite Pairs</span>
        </span>

        {/* Favorite toggle for current pair */}
        <button
          type="button"
          onClick={() => {
            playFeedback.click();
            onToggleCurrentPair();
          }}
          className={`text-xs font-semibold px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
            isCurrentPairFavorite
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
          }`}
        >
          <Star
            className={`w-3.5 h-3.5 ${
              isCurrentPairFavorite ? 'fill-amber-400 text-amber-400' : ''
            }`}
          />
          <span>{isCurrentPairFavorite ? 'Favorited' : 'Save Pair'}</span>
        </button>
      </div>

      {/* Favorite Pair Chips */}
      {favorites.length === 0 ? (
        <p className="text-xs text-slate-500 italic">
          No favorite pairs saved yet. Click &quot;Save Pair&quot; above to pin one.
        </p>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {favorites.map((pair) => {
            const fromMeta = getCurrencyMeta(pair.from);
            const toMeta = getCurrencyMeta(pair.to);
            const isSelected =
              pair.from.toUpperCase() === activeFrom.toUpperCase() &&
              pair.to.toUpperCase() === activeTo.toUpperCase();

            return (
              <button
                key={`${pair.from}-${pair.to}`}
                type="button"
                onClick={() => {
                  playFeedback.click();
                  onSelectPair(pair.from, pair.to);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium font-mono shrink-0 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm font-bold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span>{fromMeta.flag}</span>
                <span>{pair.from}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>{toMeta.flag}</span>
                <span>{pair.to}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
