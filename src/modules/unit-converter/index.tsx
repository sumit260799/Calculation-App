import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { playFeedback } from '../../utils/feedback';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'speed';

interface UnitDef {
  label: string;
  factorToBase: number;
}

const CONVERSION_DATA: Record<UnitCategory, { baseUnit: string; units: Record<string, UnitDef> }> = {
  length: {
    baseUnit: 'meter',
    units: {
      m: { label: 'Meter (m)', factorToBase: 1 },
      cm: { label: 'Centimeter (cm)', factorToBase: 0.01 },
      mm: { label: 'Millimeter (mm)', factorToBase: 0.001 },
      km: { label: 'Kilometer (km)', factorToBase: 1000 },
      inch: { label: 'Inch (in)', factorToBase: 0.0254 },
      ft: { label: 'Foot (ft)', factorToBase: 0.3048 },
      yd: { label: 'Yard (yd)', factorToBase: 0.9144 },
      mi: { label: 'Mile (mi)', factorToBase: 1609.344 },
    },
  },
  weight: {
    baseUnit: 'gram',
    units: {
      g: { label: 'Gram (g)', factorToBase: 1 },
      kg: { label: 'Kilogram (kg)', factorToBase: 1000 },
      mg: { label: 'Milligram (mg)', factorToBase: 0.001 },
      quintal: { label: 'Quintal (100kg)', factorToBase: 100000 },
      ton: { label: 'Metric Ton (t)', factorToBase: 1000000 },
      lb: { label: 'Pound (lb)', factorToBase: 453.59237 },
      oz: { label: 'Ounce (oz)', factorToBase: 28.3495 },
    },
  },
  temperature: {
    baseUnit: 'celsius',
    units: {
      c: { label: 'Celsius (°C)', factorToBase: 1 },
      f: { label: 'Fahrenheit (°F)', factorToBase: 1 },
      k: { label: 'Kelvin (K)', factorToBase: 1 },
    },
  },
  area: {
    baseUnit: 'sq_meter',
    units: {
      sq_m: { label: 'Square Meter (m²)', factorToBase: 1 },
      sq_ft: { label: 'Square Foot (ft²)', factorToBase: 0.092903 },
      acre: { label: 'Acre', factorToBase: 4046.86 },
      hectare: { label: 'Hectare (ha)', factorToBase: 10000 },
      bigha: { label: 'Bigha (~2500m²)', factorToBase: 2500 },
      guntha: { label: 'Guntha (101.17m²)', factorToBase: 101.17 },
    },
  },
  speed: {
    baseUnit: 'mps',
    units: {
      mps: { label: 'Meters/sec (m/s)', factorToBase: 1 },
      kmph: { label: 'Km/hour (km/h)', factorToBase: 1 / 3.6 },
      mph: { label: 'Miles/hour (mph)', factorToBase: 0.44704 },
      knot: { label: 'Knot (kn)', factorToBase: 0.514444 },
    },
  },
};

export const UniversalUnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [inputValue, setInputValue] = useState<number>(10);
  const [copied, setCopied] = useState(false);

  const currentCatData = CONVERSION_DATA[category];

  const convert = (val: number, from: string, to: string, cat: UnitCategory): number => {
    if (isNaN(val)) return 0;
    if (cat === 'temperature') {
      let c = val;
      if (from === 'f') c = ((val - 32) * 5) / 9;
      if (from === 'k') c = val - 273.15;
      if (to === 'c') return c;
      if (to === 'f') return (c * 9) / 5 + 32;
      if (to === 'k') return c + 273.15;
      return c;
    }
    const fromDef = currentCatData.units[from];
    const toDef = currentCatData.units[to];
    if (!fromDef || !toDef) return 0;
    return (val * fromDef.factorToBase) / toDef.factorToBase;
  };

  const result = convert(inputValue, fromUnit, toUnit, category);

  const handleCategoryChange = (newCat: UnitCategory) => {
    playFeedback.click();
    setCategory(newCat);
    const keys = Object.keys(CONVERSION_DATA[newCat].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const handleSwap = () => {
    playFeedback.click();
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-10">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(CONVERSION_DATA) as UnitCategory[]).map((catKey) => (
          <Button
            key={catKey}
            variant="chip"
            size="sm"
            active={category === catKey}
            onClick={() => handleCategoryChange(catKey)}
            className="capitalize shrink-0"
          >
            {catKey}
          </Button>
        ))}
      </div>

      <Card variant="glass" className="p-4 sm:p-5 border-slate-700/60 shadow-lg space-y-4">
        {/* From Section */}
        <div className="space-y-2">
          <Input
            label="Input Value"
            type="number"
            value={inputValue || ''}
            onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
            placeholder="10"
            className="font-bold text-lg py-2.5"
          />
          <Select
            label="From Unit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            options={Object.entries(currentCatData.units).map(([key, def]) => ({
              value: key,
              label: def.label,
            }))}
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={handleSwap}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 shadow-md active:scale-95 transition-all cursor-pointer"
            title="Swap"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* To Section */}
        <div className="space-y-2">
          <Select
            label="To Unit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            options={Object.entries(currentCatData.units).map(([key, def]) => ({
              value: key,
              label: def.label,
            }))}
          />

          {/* Result Box */}
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-teal-950/40 border border-teal-500/30 rounded-2xl p-4 flex items-center justify-between mt-3">
            <div>
              <div className="text-[11px] text-slate-400 font-medium mb-0.5">Converted Value</div>
              <div className="font-numeric text-2xl sm:text-3xl font-black text-teal-300">
                {result.toLocaleString('en-US', { maximumFractionDigits: 6 })}
              </div>
              <div className="text-xs text-slate-400 font-sans mt-0.5">{toUnit}</div>
            </div>

            <button
              onClick={() => {
                playFeedback.click();
                navigator.clipboard.writeText(`${inputValue} ${fromUnit} = ${result} ${toUnit}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2.5 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-400 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
