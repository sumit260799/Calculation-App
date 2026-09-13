import React, { useState, useEffect } from 'react';
import type { WeightUnit } from '../../../types/calculator';
import { WEIGHT_UNITS, calculateWeightFromPrice } from '../utils';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { playFeedback } from '../../../utils/feedback';

interface PriceToWeightCardProps {
  baseQty: number;
  baseUnit: WeightUnit;
  basePrice: number;
  onSaveHistory: (type: 'price-to-weight', inputVal: number, inputUnit: undefined, resultVal: number, display: string) => void;
}

const RUPEE_PRESETS = [10, 20, 50, 100, 200, 500];

export const PriceToWeightCard: React.FC<PriceToWeightCardProps> = ({
  baseQty,
  baseUnit,
  basePrice,
  onSaveHistory,
}) => {
  const [budgetAmount, setBudgetAmount] = useState<number>(100);
  const [preferredUnit, setPreferredUnit] = useState<WeightUnit>('gm');
  const [copied, setCopied] = useState(false);

  const calculation = calculateWeightFromPrice(
    baseQty,
    baseUnit,
    basePrice,
    budgetAmount,
    preferredUnit
  );

  useEffect(() => {
    if (budgetAmount > 0 && calculation.targetWeightInPreferredUnit > 0) {
      const timer = setTimeout(() => {
        onSaveHistory(
          'price-to-weight',
          budgetAmount,
          undefined,
          calculation.targetWeightInPreferredUnit,
          `${calculation.targetWeightInPreferredUnit.toFixed(2)} ${preferredUnit}`
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [budgetAmount, preferredUnit, baseQty, baseUnit, basePrice]);

  const handleCopy = () => {
    playFeedback.click();
    const text = `₹${budgetAmount} = ${calculation.targetWeightInPreferredUnit.toFixed(2)} ${preferredUnit}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card variant="glass" className="p-4 sm:p-5 border-slate-700/60 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Budget (₹) to Weight
        </span>
        <button
          onClick={() => {
            playFeedback.click();
            setBudgetAmount(0);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Clear
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-12 gap-2 mb-3">
        <div className="col-span-7">
          <Input
            label="Money You Have"
            type="number"
            min="0"
            step="any"
            value={budgetAmount || ''}
            onChange={(e) => setBudgetAmount(parseFloat(e.target.value) || 0)}
            prefixElement="₹"
            placeholder="e.g. 100"
            className="text-lg font-bold text-indigo-400 py-2.5"
          />
        </div>
        <div className="col-span-5">
          <Select
            label="Result In"
            value={preferredUnit}
            onChange={(e) => setPreferredUnit(e.target.value as WeightUnit)}
            options={WEIGHT_UNITS.map((u) => ({
              value: u.value,
              label: u.label,
            }))}
            className="text-sm py-2.5"
          />
        </div>
      </div>

      {/* Quick Rupee Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {RUPEE_PRESETS.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              playFeedback.click();
              setBudgetAmount(amount);
            }}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border active:scale-95 transition-all shrink-0 cursor-pointer ${
              budgetAmount === amount
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-bold'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700/80'
            }`}
          >
            ₹{amount}
          </button>
        ))}
      </div>

      {/* Result Display */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-medium mb-0.5">Weight You Will Receive</div>
          <div className="font-numeric text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-200">
            {calculation.targetWeightInPreferredUnit.toFixed(2)}{' '}
            <span className="text-xl sm:text-2xl font-semibold text-indigo-300">{preferredUnit}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Exact: {calculation.kgPart > 0 ? `${calculation.kgPart}kg ` : ''}
            {calculation.gmPart}g {calculation.mgPart > 0 ? `${calculation.mgPart}mg` : ''}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="p-3 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 rounded-xl transition-all cursor-pointer active:scale-95"
          title="Copy result"
        >
          {copied ? <Check className="w-5 h-5 text-indigo-400" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </Card>
  );
};
