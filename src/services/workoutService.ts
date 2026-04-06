import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { WorkoutPlan, Exercise } from '@/types/workout';

export async function getPlans(): Promise<WorkoutPlan[]> {
  const q = query(
    collection(db, 'workoutPlans'),
    where('isPublished', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      planId: d.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    } as WorkoutPlan;
  });
}

export async function getPlanById(planId: string): Promise<WorkoutPlan | null> {
  const snap = await getDoc(doc(db, 'workoutPlans', planId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    planId: snap.id,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as WorkoutPlan;
}

export async function getExercisesForPlan(planId: string): Promise<Exercise[]> {
  const q = query(
    collection(db, 'workoutPlans', planId, 'exercises'),
    orderBy('sortOrder', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), exerciseId: d.id }) as Exercise);
}
