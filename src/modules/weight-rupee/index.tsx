import React, { useState, useEffect } from 'react';
import type { WeightUnit, CalculationHistoryItem } from '../../types/calculator';
import { BaseRateCard } from './components/BaseRateCard';
import { WeightToPriceCard } from './components/WeightToPriceCard';
import { PriceToWeightCard } from './components/PriceToWeightCard';
import { HistoryModal } from './components/HistoryDrawer';
import { Tabs } from '../../components/ui/Tabs';
import { Layers, IndianRupee, History, RotateCcw } from 'lucide-react';
import { playFeedback } from '../../utils/feedback';

export const WeightRupeeCalculator: React.FC = () => {
  const [baseQty, setBaseQty] = useState<number>(1000);
  const [baseUnit, setBaseUnit] = useState<WeightUnit>('gm');
  const [basePrice, setBasePrice] = useState<number>(0);

  const [calcMode, setCalcMode] = useState<'weight-to-price' | 'price-to-weight'>('weight-to-price');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pricescale_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pricescale_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  const handleSaveHistory = (
    type: 'weight-to-price' | 'price-to-weight',
    inputVal: number,
    inputUnit: WeightUnit | undefined,
    resultVal: number,
    display: string
  ) => {
    const historyEntry: CalculationHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      type,
      baseRate: {
        quantity: baseQty,
        unit: baseUnit,
        price: basePrice,
      },
      input: {
        value: inputVal,
        unit: inputUnit,
      },
      result: {
        value: resultVal,
        display,
      },
    };
    setHistory(prev => {
      // Avoid immediate duplicate
      if (prev.length > 0 && prev[0].result.display === display && prev[0].input.value === inputVal) {
        return prev;
      }
      return [historyEntry, ...prev.slice(0, 19)];
    });
  };

  const handleRestoreFromHistory = (item: CalculationHistoryItem) => {
    setBaseQty(item.baseRate.quantity);
    setBaseUnit(item.baseRate.unit);
    setBasePrice(item.baseRate.price);
    setCalcMode(item.type);
  };

  const handleReset = () => {
    playFeedback.click();
    setBaseQty(1000);
    setBaseUnit('gm');
    setBasePrice(0);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      {/* Subheader Toolbar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-400">
          Kirana & Market Weight Math
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playFeedback.click();
              setIsHistoryOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 cursor-pointer active:scale-95 transition-all"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>History</span>
            {history.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {history.length}
              </span>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 cursor-pointer transition-all active:scale-95"
            title="Reset inputs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Base Rate Card */}
      <BaseRateCard
        baseQty={baseQty}
        baseUnit={baseUnit}
        basePrice={basePrice}
        onBaseQtyChange={setBaseQty}
        onBaseUnitChange={setBaseUnit}
        onBasePriceChange={setBasePrice}
      />

      {/* 2. Switcher Tabs */}
      <Tabs
        tabs={[
          { id: 'weight-to-price', label: 'Weight → ₹ Price', icon: <Layers className="w-4 h-4" /> },
          { id: 'price-to-weight', label: 'Budget ₹ → Weight', icon: <IndianRupee className="w-4 h-4" /> },
        ]}
        activeTab={calcMode}
        onChange={(tab) => {
          playFeedback.click();
          setCalcMode(tab as 'weight-to-price' | 'price-to-weight');
        }}
        className="w-full justify-center"
      />

      {/* 3. Active Mode Card */}
      {calcMode === 'weight-to-price' ? (
        <WeightToPriceCard
          baseQty={baseQty}
          baseUnit={baseUnit}
          basePrice={basePrice}
          onSaveHistory={handleSaveHistory}
        />
      ) : (
        <PriceToWeightCard
          baseQty={baseQty}
          baseUnit={baseUnit}
          basePrice={basePrice}
          onSaveHistory={handleSaveHistory}
        />
      )}

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
        onRestore={handleRestoreFromHistory}
      />
    </div>
  );
};
