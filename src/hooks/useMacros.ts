import { useState, useEffect, useCallback } from 'react';
import { getDailyMacros } from '@/services/macroService';
import { computeDailyTotals } from '@/utils/macroCalculator';
import type { MacroLog, DailyMacroTotals } from '@/types/macro';
import { todayISO } from '@/utils/formatters';

interface MacrosState {
  logs: MacroLog[];
  totals: DailyMacroTotals;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMacros(userId: string | null, date?: string): MacrosState {
  const targetDate = date ?? todayISO();
  const [logs, setLogs] = useState<MacroLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    getDailyMacros(userId, targetDate)
      .then(setLogs)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [userId, targetDate, trigger]);

  const totals = computeDailyTotals(logs);
  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  return { logs, totals, loading, error, refetch };
}
