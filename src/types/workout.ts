import type { Equipment, FitnessLevel } from './user';

export type WorkoutType = 'strength' | 'hiit' | 'cardio' | 'flexibility';
export type GenderFocus = 'male' | 'female' | 'all';
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio'
  | 'full_body';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Exercise {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  sets: number;
  reps: number | null;
  durationSecs: number | null;
  restSecs: number;
  notes: string;
  sortOrder: number;
  isSuperset: boolean;
  supersetWith: string | null;
}

export interface WorkoutPlan {
  planId: string;
  title: string;
  description: string;
  durationMins: 15 | 30 | 45 | 60;
  workoutType: WorkoutType;
  genderFocus: GenderFocus;
  equipment: Equipment[];
  fitnessLevel: FitnessLevel | 'all';
  thumbnailUrl: string;
  muscleGroups: MuscleGroup[];
  totalExercises: number;
  isPublished: boolean;
  createdAt: string;
  ownerId?: string;   // set for user-created plans
  isCustom?: boolean; // true for user-created plans
}

export interface SetLog {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSecs: number | null;
  completedAt: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  sessionId: string;
  userId: string;
  planId: string;
  planTitle: string;
  startedAt: string;
  completedAt: string | null;
  durationSecs: number;
  status: SessionStatus;
  effortRating: 1 | 2 | 3 | 4 | 5 | null;
  setsCompleted: number;
  totalSets: number;
  exerciseLogs: ExerciseLog[];
}

export interface WorkoutFilters {
  duration: number | null;
  equipment: Equipment | null;
  gender: GenderFocus | null;
  type: WorkoutType | null;
}
