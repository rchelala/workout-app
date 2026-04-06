import type { WorkoutPlan, WorkoutFilters, WorkoutType, GenderFocus } from '@/types/workout';
import type { Equipment } from '@/types/user';

export function filterPlans(plans: WorkoutPlan[], filters: WorkoutFilters): WorkoutPlan[] {
  return plans.filter((plan) => {
    if (filters.duration !== null && plan.durationMins !== filters.duration) return false;
    if (filters.type !== null && plan.workoutType !== filters.type) return false;
    if (filters.gender !== null && filters.gender !== 'all') {
      if (plan.genderFocus !== 'all' && plan.genderFocus !== filters.gender) return false;
    }
    if (filters.equipment !== null) {
      if (!plan.equipment.includes(filters.equipment)) return false;
    }
    return true;
  });
}

export const DURATION_OPTIONS: number[] = [15, 30, 45, 60];
export const TYPE_OPTIONS: WorkoutType[] = ['strength', 'hiit', 'cardio', 'flexibility'];
export const GENDER_OPTIONS: GenderFocus[] = ['all', 'male', 'female'];
export const EQUIPMENT_OPTIONS: Equipment[] = ['none', 'dumbbells', 'resistance_bands', 'full_gym'];

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'No Equipment',
  dumbbells: 'Dumbbells',
  resistance_bands: 'Bands',
  full_gym: 'Full Gym',
};

export const TYPE_LABELS: Record<WorkoutType, string> = {
  strength: 'Strength',
  hiit: 'HIIT',
  cardio: 'Cardio',
  flexibility: 'Flexibility',
};
