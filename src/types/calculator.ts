import type { ComponentType } from 'react';

export type Category = 
  | 'grocery-market'
  | 'currency-finance'
  | 'precious-metals'
  | 'units-conversion'
  | 'daily-utilities';

export interface CalculatorModule {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: Category;
  iconName: string;
  badge?: string;
  isPopular?: boolean;
  component: ComponentType;
}

export type WeightUnit = 'mg' | 'gm' | 'kg' | 'quintal' | 'ton' | 'tola';

export interface WeightUnitOption {
  value: WeightUnit;
  label: string;
  shortLabel: string;
  multiplierToGram: number;
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  type: 'weight-to-price' | 'price-to-weight';
  baseRate: {
    quantity: number;
    unit: WeightUnit;
    price: number;
  };
  input: {
    value: number;
    unit?: WeightUnit;
  };
  result: {
    value: number;
    unit?: WeightUnit;
    display: string;
  };
  itemLabel?: string;
}

export interface CartItem {
  id: string;
  name: string;
  baseQuantity: number;
  baseUnit: WeightUnit;
  basePrice: number;
  purchasedWeight: number;
  purchasedUnit: WeightUnit;
  finalPrice: number;
  dateAdded: number;
}
