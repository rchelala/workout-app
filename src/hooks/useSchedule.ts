import { useState, useEffect, useCallback } from 'react';
import { getScheduledWorkouts } from '@/services/scheduleService';
import type { ScheduledWorkout } from '@/types/schedule';

interface ScheduleState {
  scheduled: ScheduledWorkout[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSchedule(userId: string | null): ScheduleState {
  const [scheduled, setScheduled] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    getScheduledWorkouts(userId)
      .then(setScheduled)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [userId, trigger]);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  return { scheduled, loading, error, refetch };
}
