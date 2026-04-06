import type { MacroLog, DailyMacroTotals } from '@/types/macro';

export function computeDailyTotals(entries: MacroLog[]): DailyMacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      proteinG: acc.proteinG + entry.proteinG,
      carbsG: acc.carbsG + entry.carbsG,
      fatG: acc.fatG + entry.fatG,
      entries: acc.entries,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, entries }
  );
}

export function computeMacroPercentages(totals: DailyMacroTotals): {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
} {
  const totalCals = totals.proteinG * 4 + totals.carbsG * 4 + totals.fatG * 9;
  if (totalCals === 0) return { proteinPct: 0, carbsPct: 0, fatPct: 0 };
  return {
    proteinPct: Math.round((totals.proteinG * 4 / totalCals) * 100),
    carbsPct: Math.round((totals.carbsG * 4 / totalCals) * 100),
    fatPct: Math.round((totals.fatG * 9 / totalCals) * 100),
  };
}
