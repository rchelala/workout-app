import { useState, useEffect, useCallback } from 'react';
import { getTodayWater, setWaterCount } from '@/services/waterService';

interface WaterState {
  glasses: number;
  loading: boolean;
  increment: () => void;
  decrement: () => void;
}

export function useWater(userId: string | null, goal: number = 8): WaterState {
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getTodayWater(userId)
      .then((log) => setGlasses(log?.glasses ?? 0))
      .finally(() => setLoading(false));
  }, [userId]);

  const persist = useCallback(
    async (next: number) => {
      if (!userId) return;
      setGlasses(next);
      await setWaterCount(userId, next);
    },
    [userId]
  );

  const increment = useCallback(() => {
    if (glasses < goal) persist(glasses + 1);
  }, [glasses, goal, persist]);

  const decrement = useCallback(() => {
    if (glasses > 0) persist(glasses - 1);
  }, [glasses, persist]);

  return { glasses, loading, increment, decrement };
}
