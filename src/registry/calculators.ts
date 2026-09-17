import type { CalculatorModule } from '../types/calculator';
import { WeightRupeeCalculator } from '../modules/weight-rupee';
import { UniversalUnitConverter } from '../modules/unit-converter';
import { GoldRateCalculator } from '../modules/gold-rate';
import { LakhCroreConverter } from '../modules/lakh-crore';
import { CurrencyConverter } from '../modules/currency-converter';

export const CALCULATOR_MODULES: CalculatorModule[] = [
  {
    id: 'currency-converter',
    name: 'Live Currency Converter',
    shortName: 'Currency Ex',
    description: 'Convert world currencies with live rates, historical trends, custom ratios & rate adjustments.',
    category: 'currency-finance',
    iconName: 'Globe',
    badge: 'Live',
    isPopular: true,
    component: CurrencyConverter,
  },
  {
    id: 'weight-rupee',
    name: 'Weight & Price Calculator',
    shortName: 'Weight to ₹',
    description: 'Convert weight to Rupees or budget to weight (e.g. 1kg is ₹248 → 400g is ₹99.20).',
    category: 'grocery-market',
    iconName: 'Scale',
    badge: 'Popular',
    isPopular: true,
    component: WeightRupeeCalculator,
  },
  {
    id: 'universal-units',
    name: 'Measure & Units Converter',
    shortName: 'Units Converter',
    description: 'Convert Length (meter, foot), Area (Acre, Bigha, Guntha), Weight, Temp, and Speed.',
    category: 'units-conversion',
    iconName: 'ArrowLeftRight',
    component: UniversalUnitConverter,
  },
  {
    id: 'gold-rate',
    name: 'Gold & Jewelry Calculator',
    shortName: 'Gold / Bullion',
    description: 'Calculate real jewelry price with 24K, 22K (916), making charges, and 3% GST.',
    category: 'precious-metals',
    iconName: 'Coins',
    component: GoldRateCalculator,
  },
  {
    id: 'lakh-crore',
    name: 'Lakh, Crore & Million Scale',
    shortName: 'Lakhs & Millions',
    description: 'Convert large numbers between Indian (Lakh/Crore) and International (Million/Billion) systems.',
    category: 'currency-finance',
    iconName: 'IndianRupee',
    component: LakhCroreConverter,
  },
];

export function getCalculatorById(id: string): CalculatorModule | undefined {
  return CALCULATOR_MODULES.find(m => m.id === id) || CALCULATOR_MODULES[0];
}
