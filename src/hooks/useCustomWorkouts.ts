import { useState, useEffect } from 'react';
import { getUserCustomPlans } from '@/services/workoutService';
import type { WorkoutPlan } from '@/types/workout';

export function useCustomWorkouts(userId: string | null) {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getUserCustomPlans(userId).then(p => { setPlans(p); setLoading(false); });
  }, [userId]);

  const refetch = () => {
    if (!userId) return;
    setLoading(true);
    getUserCustomPlans(userId).then(p => { setPlans(p); setLoading(false); });
  };

  return { plans, loading, refetch };
}
