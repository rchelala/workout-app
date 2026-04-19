import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { WorkoutPlan, Exercise, WorkoutType } from '@/types/workout';

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

// NOTE: Firestore security rules must allow user writes to workoutPlans.
// Add this to your Firestore console rules before using custom plans:
//
// match /workoutPlans/{planId} {
//   allow read: if request.auth != null;
//   allow write: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
// }
// match /workoutPlans/{planId}/exercises/{exerciseId} {
//   allow read: if request.auth != null;
//   allow write: if request.auth != null;
// }

export async function saveCustomPlan(
  userId: string,
  meta: {
    title: string;
    workoutType: WorkoutType;
    durationMins: 15 | 30 | 45 | 60;
  },
  exercises: Omit<Exercise, 'exerciseId'>[]
): Promise<string> {
  const planRef = await addDoc(collection(db, 'workoutPlans'), {
    title: meta.title,
    workoutType: meta.workoutType,
    durationMins: meta.durationMins,
    description: '',
    genderFocus: 'all',
    equipment: [],
    fitnessLevel: 'all',
    thumbnailUrl: '',
    muscleGroups: [],
    totalExercises: exercises.length,
    isPublished: false,
    isCustom: true,
    ownerId: userId,
    createdAt: serverTimestamp(),
  });

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    await addDoc(collection(db, 'workoutPlans', planRef.id, 'exercises'), {
      ...ex,
      sortOrder: i,
    });
  }

  return planRef.id;
}

export async function getUserCustomPlans(userId: string): Promise<WorkoutPlan[]> {
  const q = query(
    collection(db, 'workoutPlans'),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
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

export async function updateCustomPlan(
  planId: string,
  meta: { title: string; workoutType: WorkoutType; durationMins: 15 | 30 | 45 | 60 },
  exercises: Omit<Exercise, 'exerciseId'>[]
): Promise<void> {
  await updateDoc(doc(db, 'workoutPlans', planId), {
    title: meta.title,
    workoutType: meta.workoutType,
    durationMins: meta.durationMins,
    totalExercises: exercises.length,
  });

  // Delete all existing exercises
  const existingSnap = await getDocs(collection(db, 'workoutPlans', planId, 'exercises'));
  const batch = writeBatch(db);
  existingSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  // Write new exercises
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    await addDoc(collection(db, 'workoutPlans', planId, 'exercises'), {
      ...ex,
      sortOrder: i,
    });
  }
}

export async function deleteCustomPlan(planId: string): Promise<void> {
  const exercisesSnap = await getDocs(collection(db, 'workoutPlans', planId, 'exercises'));
  const batch = writeBatch(db);
  exercisesSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  await deleteDoc(doc(db, 'workoutPlans', planId));
}
