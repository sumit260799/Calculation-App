import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Copy, Check } from 'lucide-react';
import { formatIndianCurrency } from '../weight-rupee/utils';
import { playFeedback } from '../../utils/feedback';

type GoldPurity = '24k' | '22k' | '18k' | '14k';

const PURITY_CONFIG = {
  '24k': { label: '24K (99.9% Pure Bullion)', factor: 1.0, hallmark: '999' },
  '22k': { label: '22K (91.6% Standard Jewelry)', factor: 22 / 24, hallmark: '916' },
  '18k': { label: '18K (75.0% Diamond Jewelry)', factor: 18 / 24, hallmark: '750' },
  '14k': { label: '14K (58.5% Daily Wear)', factor: 14 / 24, hallmark: '585' },
};

export const GoldRateCalculator: React.FC = () => {
  const [base24KRatePer10g, setBase24KRatePer10g] = useState<number>(75000);
  const [purity, setPurity] = useState<GoldPurity>('22k');
  const [weight, setWeight] = useState<number>(8);
  const [weightUnit, setWeightUnit] = useState<'gm' | 'tola' | 'pavan' | 'mg'>('gm');
  const [makingChargesPercent, setMakingChargesPercent] = useState<number>(8);
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  let grams = weight;
  if (weightUnit === 'tola') grams = weight * 10;
  else if (weightUnit === 'pavan') grams = weight * 8;
  else if (weightUnit === 'mg') grams = weight / 1000;

  const rate24KPerGram = base24KRatePer10g / 10;
  const purityFactor = PURITY_CONFIG[purity].factor;
  const ratePerGramForPurity = rate24KPerGram * purityFactor;

  const rawGoldPrice = grams * ratePerGramForPurity;
  const makingChargesAmount = rawGoldPrice * (makingChargesPercent / 100);
  const subtotalBeforeTax = rawGoldPrice + makingChargesAmount;
  const gstAmount = includeGst ? subtotalBeforeTax * 0.03 : 0;
  const finalPrice = subtotalBeforeTax + gstAmount;

  const handleCopy = () => {
    playFeedback.click();
    const text = `Gold Estimate: ${weight} ${weightUnit} (${purity.toUpperCase()} Hallmark ${PURITY_CONFIG[purity].hallmark}) = ${formatIndianCurrency(finalPrice)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      {/* Inputs Card */}
      <Card variant="glass" className="p-4 sm:p-5 border-amber-500/30 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="24K Rate (₹ / 10g)"
            type="number"
            value={base24KRatePer10g || ''}
            onChange={(e) => setBase24KRatePer10g(parseFloat(e.target.value) || 0)}
            prefixElement="₹"
            placeholder="75000"
            className="text-amber-400 font-bold"
          />

          <Select
            label="Purity (Karat)"
            value={purity}
            onChange={(e) => setPurity(e.target.value as GoldPurity)}
            options={Object.entries(PURITY_CONFIG).map(([key, config]) => ({
              value: key,
              label: config.label,
            }))}
          />
        </div>

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-7">
            <Input
              label="Weight"
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              placeholder="8"
            />
          </div>
          <div className="col-span-5">
            <Select
              label="Unit"
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as any)}
              options={[
                { value: 'gm', label: 'Grams (g)' },
                { value: 'pavan', label: 'Pavan (8g)' },
                { value: 'tola', label: 'Tola (10g)' },
                { value: 'mg', label: 'Milligrams' },
              ]}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="w-1/2">
            <Input
              label="Making Charges"
              type="number"
              value={makingChargesPercent}
              onChange={(e) => setMakingChargesPercent(parseFloat(e.target.value) || 0)}
              suffixElement="%"
              placeholder="8"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={includeGst}
              onChange={(e) => setIncludeGst(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <span>3% GST</span>
          </label>
        </div>
      </Card>

      {/* Result Card */}
      <Card variant="highlight" className="p-4 sm:p-5 border-amber-500/30 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Final Estimated Price (₹)
          </span>
          <Badge variant="amber">Hallmark {PURITY_CONFIG[purity].hallmark}</Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="font-numeric text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-white">
            {formatIndianCurrency(finalPrice)}
          </div>
          <button
            onClick={handleCopy}
            className="p-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Copy estimate"
          >
            {copied ? <Check className="w-5 h-5 text-amber-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400 font-mono">
          <div className="flex justify-between">
            <span>Raw Gold ({grams.toFixed(2)}g):</span>
            <span className="text-slate-200">{formatIndianCurrency(rawGoldPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Making ({makingChargesPercent}%):</span>
            <span className="text-amber-400">+{formatIndianCurrency(makingChargesAmount)}</span>
          </div>
          {includeGst && (
            <div className="flex justify-between">
              <span>GST (3%):</span>
              <span className="text-teal-400">+{formatIndianCurrency(gstAmount)}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
