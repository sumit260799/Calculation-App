import type { WeightUnit, WeightUnitOption } from '../../types/calculator';

export const WEIGHT_UNITS: WeightUnitOption[] = [
  { value: 'gm', label: 'Grams (gm)', shortLabel: 'Gram (gm)', multiplierToGram: 1 },
  { value: 'kg', label: 'Kilograms (kg)', shortLabel: 'Kilogram (kg)', multiplierToGram: 1000 },
  { value: 'quintal', label: 'Quintal (100 kg)', shortLabel: 'Quintal (100 kg)', multiplierToGram: 100000 },
  { value: 'mg', label: 'Milligrams (mg)', shortLabel: 'Milligram (mg)', multiplierToGram: 0.001 },
];

export function getUnitOption(unit: WeightUnit): WeightUnitOption {
  const found = WEIGHT_UNITS.find(u => u.value === unit);
  return found || WEIGHT_UNITS[1];
}

export function toGrams(amount: number, unit: WeightUnit): number {
  const option = getUnitOption(unit);
  return amount * option.multiplierToGram;
}

export function fromGrams(grams: number, unit: WeightUnit): number {
  const option = getUnitOption(unit);
  if (option.multiplierToGram === 0) return 0;
  return grams / option.multiplierToGram;
}

export function calculatePriceFromWeight(
  baseQty: number,
  baseUnit: WeightUnit,
  basePrice: number,
  targetWeight: number,
  targetUnit: WeightUnit
) {
  if (baseQty <= 0 || basePrice <= 0 || targetWeight <= 0) {
    return {
      finalPrice: 0,
      pricePerGram: 0,
      pricePerKg: 0,
      targetGrams: 0,
      baseGrams: 0,
      formulaSteps: []
    };
  }

  const baseGrams = toGrams(baseQty, baseUnit);
  const targetGrams = toGrams(targetWeight, targetUnit);
  const pricePerGram = basePrice / baseGrams;
  const finalPrice = targetGrams * pricePerGram;
  const pricePerKg = pricePerGram * 1000;

  const formulaSteps = [
    `1. Base rate in grams: ${baseQty} ${baseUnit} = ${baseGrams.toLocaleString('en-IN')} gm`,
    `2. Price for 1 gram = ₹${basePrice} ÷ ${baseGrams} gm = ₹${pricePerGram.toFixed(4)} / gm`,
    `3. Target weight in grams: ${targetWeight} ${targetUnit} = ${targetGrams.toLocaleString('en-IN')} gm`,
    `4. Total price = ${targetGrams} gm × ₹${pricePerGram.toFixed(4)} = ₹${finalPrice.toFixed(2)}`
  ];

  return {
    finalPrice,
    pricePerGram,
    pricePerKg,
    targetGrams,
    baseGrams,
    formulaSteps
  };
}

export function calculateWeightFromPrice(
  baseQty: number,
  baseUnit: WeightUnit,
  basePrice: number,
  budgetAmount: number,
  preferredUnit: WeightUnit = 'gm'
) {
  if (baseQty <= 0 || basePrice <= 0 || budgetAmount <= 0) {
    return {
      targetWeightInPreferredUnit: 0,
      targetGrams: 0,
      kgPart: 0,
      gmPart: 0,
      mgPart: 0,
      formulaSteps: []
    };
  }

  const baseGrams = toGrams(baseQty, baseUnit);
  const pricePerGram = basePrice / baseGrams;
  const targetGrams = budgetAmount / pricePerGram;
  const targetWeightInPreferredUnit = fromGrams(targetGrams, preferredUnit);

  const totalMg = Math.round(targetGrams * 1000);
  const kgPart = Math.floor(totalMg / 1000000);
  const remainderAfterKg = totalMg % 1000000;
  const gmPart = Math.floor(remainderAfterKg / 1000);
  const mgPart = remainderAfterKg % 1000;

  const formulaSteps = [
    `1. Base price rate: ₹${basePrice} for ${baseQty} ${baseUnit} (${baseGrams} gm)`,
    `2. Cost per 1 gram: ₹${pricePerGram.toFixed(4)} / gm`,
    `3. Weight for ₹${budgetAmount}: ₹${budgetAmount} ÷ ₹${pricePerGram.toFixed(4)} = ${targetGrams.toFixed(2)} gm`,
    `4. In ${preferredUnit}: ${targetWeightInPreferredUnit.toFixed(3)} ${preferredUnit}`
  ];

  return {
    targetWeightInPreferredUnit,
    targetGrams,
    kgPart,
    gmPart,
    mgPart,
    formulaSteps
  };
}

export function formatIndianCurrency(amount: number, decimals: number = 2): string {
  if (isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatWeightDisplay(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toFixed(3)} kg (${grams.toFixed(1)} gm)`;
  }
  return `${grams.toFixed(2)} gm`;
}
