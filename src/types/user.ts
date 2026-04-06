export type Gender = 'male' | 'female';
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'improve_endurance' | 'stay_active';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'none' | 'dumbbells' | 'resistance_bands' | 'full_gym';

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
  createdAt: string;
  updatedAt: string;
}
