import { useState, useEffect } from 'react';
import { getPlans } from '@/services/workoutService';
import { filterPlans } from '@/utils/workoutFilters';
import type { WorkoutPlan, WorkoutFilters } from '@/types/workout';

interface WorkoutPlansState {
  plans: WorkoutPlan[];
  filteredPlans: WorkoutPlan[];
  loading: boolean;
  error: string | null;
  filters: WorkoutFilters;
  setFilters: (f: WorkoutFilters) => void;
}

const DEFAULT_FILTERS: WorkoutFilters = {
  duration: null,
  equipment: null,
  gender: null,
  type: null,
};

export function useWorkoutPlans(): WorkoutPlansState {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkoutFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlans = filterPlans(plans, filters);

  return { plans, filteredPlans, loading, error, filters, setFilters };
}
