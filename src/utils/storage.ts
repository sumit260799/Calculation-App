export interface CurrencyPair {
  from: string;
  to: string;
}

export interface RecentConversionItem {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  rateMode: 'live' | 'custom';
}

const FAVORITES_KEY = 'calc_currency_favorites';
const RECENTS_KEY = 'calc_currency_recents';
const THEME_KEY = 'calc_theme_preference';

const DEFAULT_FAVORITES: CurrencyPair[] = [
  { from: 'USD', to: 'INR' },
  { from: 'USD', to: 'EUR' },
  { from: 'EUR', to: 'GBP' },
  { from: 'GBP', to: 'JPY' },
];

/**
 * Favorites Management
 */
export function getFavoritePairs(): CurrencyPair[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return DEFAULT_FAVORITES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return DEFAULT_FAVORITES;
}

export function saveFavoritePairs(pairs: CurrencyPair[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(pairs));
  } catch {
    // ignore
  }
}

export function isFavoritePair(from: string, to: string, list?: CurrencyPair[]): boolean {
  const pairs = list || getFavoritePairs();
  const uFrom = from.toUpperCase();
  const uTo = to.toUpperCase();
  return pairs.some(p => p.from.toUpperCase() === uFrom && p.to.toUpperCase() === uTo);
}

export function toggleFavoritePair(from: string, to: string): CurrencyPair[] {
  const current = getFavoritePairs();
  const uFrom = from.toUpperCase();
  const uTo = to.toUpperCase();
  const exists = current.some(p => p.from.toUpperCase() === uFrom && p.to.toUpperCase() === uTo);

  let updated: CurrencyPair[];
  if (exists) {
    updated = current.filter(p => !(p.from.toUpperCase() === uFrom && p.to.toUpperCase() === uTo));
  } else {
    updated = [{ from: uFrom, to: uTo }, ...current];
  }
  saveFavoritePairs(updated);
  return updated;
}

/**
 * Recent Conversions Management
 */
export function getRecentConversions(): RecentConversionItem[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [];
}

export function addRecentConversion(item: Omit<RecentConversionItem, 'id' | 'timestamp'>): RecentConversionItem[] {
  const current = getRecentConversions();
  const newItem: RecentConversionItem = {
    ...item,
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  // Avoid duplicate immediately adjacent entry
  const filtered = current.filter(
    r => !(r.from === item.from && r.to === item.to && Math.abs(r.amount - item.amount) < 0.0001)
  );

  const updated = [newItem, ...filtered].slice(0, 15);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function clearRecentConversions(): void {
  try {
    localStorage.removeItem(RECENTS_KEY);
  } catch {
    // ignore
  }
}

/**
 * Theme Preference
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    // ignore
  }
  return 'dark'; // Default app styling is dark
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
