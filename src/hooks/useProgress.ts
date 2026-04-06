import { useState, useEffect } from 'react';
import { getBodyMetrics } from '@/services/progressService';
import type { BodyMetric } from '@/types/progress';

interface ProgressState {
  metrics: BodyMetric[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProgress(userId: string | null): ProgressState {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    getBodyMetrics(userId)
      .then(setMetrics)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [userId, trigger]);

  return { metrics, loading, error, refetch: () => setTrigger((n) => n + 1) };
}
