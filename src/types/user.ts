export type Gender = 'male' | 'female';
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'improve_endurance' | 'stay_active';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'none' | 'dumbbells' | 'resistance_bands' | 'full_gym';
export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'super_active';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  gender: Gender;
  goal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  equipment: Equipment[];
  onboardingComplete: boolean;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  dailyWaterGoal: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  weeklyWorkoutGoal: number;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  createdAt: string;
  updatedAt: string;
}
