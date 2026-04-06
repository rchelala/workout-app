import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, Gender, FitnessGoal, FitnessLevel, Equipment } from '@/types/user';
import {
  DEFAULT_WATER_GOAL,
  DEFAULT_CALORIE_TARGET,
  DEFAULT_PROTEIN_TARGET,
  DEFAULT_CARBS_TARGET,
  DEFAULT_FAT_TARGET,
} from '@/constants/workoutDefaults';

export async function createUserProfile(
  uid: string,
  displayName: string,
  email: string
): Promise<void> {
  const profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid,
    displayName,
    email,
    gender: 'male',
    goal: 'stay_active',
    fitnessLevel: 'beginner',
    equipment: ['none'],
    onboardingComplete: false,
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    dailyWaterGoal: DEFAULT_WATER_GOAL,
    dailyCalorieTarget: DEFAULT_CALORIE_TARGET,
    dailyProteinTarget: DEFAULT_PROTEIN_TARGET,
    dailyCarbsTarget: DEFAULT_CARBS_TARGET,
    dailyFatTarget: DEFAULT_FAT_TARGET,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'users', uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<
    Pick<UserProfile, 'gender' | 'goal' | 'fitnessLevel' | 'equipment' | 'displayName' | 'onboardingComplete' | 'currentStreak' | 'longestStreak' | 'lastWorkoutDate' | 'dailyWaterGoal' | 'dailyCalorieTarget' | 'dailyProteinTarget' | 'dailyCarbsTarget' | 'dailyFatTarget'>
  >
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function completeOnboarding(
  uid: string,
  gender: Gender,
  goal: FitnessGoal,
  fitnessLevel: FitnessLevel,
  equipment: Equipment[]
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    gender,
    goal,
    fitnessLevel,
    equipment,
    onboardingComplete: true,
    updatedAt: serverTimestamp(),
  });
}
