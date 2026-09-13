import React from 'react';
import type { WeightUnit } from '../../../types/calculator';
import { WEIGHT_UNITS, toGrams, formatIndianCurrency } from '../utils';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Scale } from 'lucide-react';

interface BaseRateCardProps {
  baseQty: number;
  baseUnit: WeightUnit;
  basePrice: number;
  onBaseQtyChange: (val: number) => void;
  onBaseUnitChange: (val: WeightUnit) => void;
  onBasePriceChange: (val: number) => void;
}

export const BaseRateCard: React.FC<BaseRateCardProps> = ({
  baseQty,
  baseUnit,
  basePrice,
  onBaseQtyChange,
  onBaseUnitChange,
  onBasePriceChange,
}) => {
  const baseGrams = toGrams(baseQty, baseUnit);
  const ratePerGram = baseGrams > 0 ? basePrice / baseGrams : 0;
  const ratePerKg = ratePerGram * 1000;

  return (
    <Card variant="glass" className="p-4 sm:p-5 border-slate-700/60 shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg">
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-200">Base Reference Rate</span>
        </div>

        {basePrice > 0 ? (
          <div className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            ₹{ratePerGram.toFixed(4)}/g · {formatIndianCurrency(ratePerKg, 0)}/kg
          </div>
        ) : (
          <div className="text-[11px] font-medium text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/60">
            Enter price
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-4 min-w-0">
          <Input
            label="Base Qty"
            type="number"
            min="0.001"
            step="any"
            value={baseQty || ''}
            onChange={(e) => onBaseQtyChange(parseFloat(e.target.value) || 0)}
            placeholder="1000"
            className="text-center font-bold text-xs sm:text-sm py-2 px-1"
          />
        </div>

        <div className="col-span-4 min-w-0">
          <Select
            label="Unit"
            value={baseUnit}
            onChange={(e) => onBaseUnitChange(e.target.value as WeightUnit)}
            options={WEIGHT_UNITS.map((u) => ({
              value: u.value,
              label: u.label,
            }))}
            className="text-xs sm:text-sm py-2 px-1 truncate"
          />
        </div>

        <div className="col-span-4 min-w-0">
          <Input
            label="Price (₹)"
            type="number"
            min="0"
            step="any"
            value={basePrice > 0 ? basePrice : ''}
            onChange={(e) => onBasePriceChange(parseFloat(e.target.value) || 0)}
            prefixElement="₹"
            placeholder="100"
            className="text-emerald-400 font-bold text-xs sm:text-sm py-2 pl-6 pr-1"
          />
        </div>
      </div>
    </Card>
  );
};
