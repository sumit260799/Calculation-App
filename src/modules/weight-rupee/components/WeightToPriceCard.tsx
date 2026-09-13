import React, { useState, useEffect } from 'react';
import type { WeightUnit } from '../../../types/calculator';
import { WEIGHT_UNITS, calculatePriceFromWeight, formatIndianCurrency, toGrams } from '../utils';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Copy, Check, Plus, RotateCcw } from 'lucide-react';
import { playFeedback } from '../../../utils/feedback';

interface WeightToPriceCardProps {
  baseQty: number;
  baseUnit: WeightUnit;
  basePrice: number;
  onSaveHistory: (type: 'weight-to-price', inputVal: number, inputUnit: WeightUnit, resultVal: number, display: string) => void;
}

const QUICK_CHIPS = [
  { label: '+50g', grams: 50 },
  { label: '+100g', grams: 100 },
  { label: '+250g', grams: 250 },
  { label: '+500g', grams: 500 },
  { label: '+1kg', grams: 1000 },
];

export const WeightToPriceCard: React.FC<WeightToPriceCardProps> = ({
  baseQty,
  baseUnit,
  basePrice,
  onSaveHistory,
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(400);
  const [targetUnit, setTargetUnit] = useState<WeightUnit>('gm');
  const [copied, setCopied] = useState(false);

  const calculation = calculatePriceFromWeight(
    baseQty,
    baseUnit,
    basePrice,
    targetWeight,
    targetUnit
  );

  // Auto save to history with debounce
  useEffect(() => {
    if (targetWeight > 0 && calculation.finalPrice > 0) {
      const timer = setTimeout(() => {
        onSaveHistory(
          'weight-to-price',
          targetWeight,
          targetUnit,
          calculation.finalPrice,
          formatIndianCurrency(calculation.finalPrice)
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [targetWeight, targetUnit, baseQty, baseUnit, basePrice]);

  const handleCopy = () => {
    playFeedback.click();
    const text = `${targetWeight} ${targetUnit} = ${formatIndianCurrency(calculation.finalPrice)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addGrams = (g: number) => {
    playFeedback.click();
    const currentGrams = toGrams(targetWeight || 0, targetUnit);
    const nextGrams = currentGrams + g;
    if (targetUnit === 'kg') {
      setTargetWeight(Number((nextGrams / 1000).toFixed(3)));
    } else {
      setTargetWeight(Math.round(nextGrams));
      setTargetUnit('gm');
    }
  };

  return (
    <Card variant="glass" className="p-4 sm:p-5 border-slate-700/60 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Weight to Price (₹)
        </span>
        <button
          onClick={() => {
            playFeedback.click();
            setTargetWeight(0);
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
            label="Weight Quantity"
            type="number"
            min="0"
            step="any"
            value={targetWeight || ''}
            onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 400"
            className="text-lg font-bold py-2.5"
          />
        </div>
        <div className="col-span-5">
          <Select
            label="Unit"
            value={targetUnit}
            onChange={(e) => setTargetUnit(e.target.value as WeightUnit)}
            options={WEIGHT_UNITS.map((u) => ({
              value: u.value,
              label: u.label,
            }))}
            className="text-sm py-2.5"
          />
        </div>
      </div>

      {/* Quick Add Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => addGrams(chip.grams)}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80 active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            {chip.label}
          </button>
        ))}
      </div>

      {/* Result Display */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-slate-400 font-medium mb-0.5">Payable Amount</div>
          <div className="font-numeric text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            {formatIndianCurrency(calculation.finalPrice)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {targetWeight} {targetUnit} @ ₹{calculation.pricePerGram.toFixed(4)}/g
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="p-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-xl transition-all cursor-pointer active:scale-95"
          title="Copy result"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </Card>
  );
};
