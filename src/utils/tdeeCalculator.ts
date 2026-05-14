import type { ActivityLevel, FitnessGoal, Gender } from '@/types/user';

export interface TDEEInput {
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  gender: Gender;
  goal: FitnessGoal;
}

export interface MacroTargets {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  super_active: 1.9,
};

const GOAL_ADJUSTMENT: Record<FitnessGoal, number> = {
  lose_weight: -400,
  build_muscle: 300,
  improve_endurance: 0,
  stay_active: 0,
};

export function calculateMacroTargets(input: TDEEInput): MacroTargets {
  const { age, heightCm, weightKg, activityLevel, gender, goal } = input;
  const genderOffset = gender === 'male' ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + genderOffset;
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);
  const dailyCalorieTarget = tdee + GOAL_ADJUSTMENT[goal];
  const dailyProteinTarget = Math.round(weightKg * 2.205 * 0.9);
  const fatCal = Math.round(dailyCalorieTarget * 0.25);
  const dailyFatTarget = Math.round(fatCal / 9);
  const carbCal = dailyCalorieTarget - dailyProteinTarget * 4 - dailyFatTarget * 9;
  const dailyCarbsTarget = Math.round(carbCal / 4);
  return { dailyCalorieTarget, dailyProteinTarget, dailyCarbsTarget, dailyFatTarget };
}
