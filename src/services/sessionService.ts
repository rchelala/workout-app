import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { WorkoutSession, ExerciseLog } from '@/types/workout';

export async function startSession(
  userId: string,
  planId: string,
  planTitle: string,
  totalSets: number
): Promise<string> {
  const ref = await addDoc(collection(db, 'workoutSessions'), {
    userId,
    planId,
    planTitle,
    startedAt: serverTimestamp(),
    completedAt: null,
    durationSecs: 0,
    status: 'in_progress',
    effortRating: null,
    setsCompleted: 0,
    totalSets,
    exerciseLogs: [],
  });
  return ref.id;
}

export async function completeSession(
  sessionId: string,
  durationSecs: number,
  setsCompleted: number,
  exerciseLogs: ExerciseLog[]
): Promise<void> {
  await updateDoc(doc(db, 'workoutSessions', sessionId), {
    completedAt: serverTimestamp(),
    durationSecs,
    status: 'completed',
    setsCompleted,
    exerciseLogs,
  });
}

export async function rateSession(
  sessionId: string,
  effortRating: 1 | 2 | 3 | 4 | 5
): Promise<void> {
  await updateDoc(doc(db, 'workoutSessions', sessionId), { effortRating });
}

export async function abandonSession(sessionId: string, durationSecs: number): Promise<void> {
  await updateDoc(doc(db, 'workoutSessions', sessionId), {
    completedAt: serverTimestamp(),
    durationSecs,
    status: 'abandoned',
  });
}

export async function getHistory(userId: string): Promise<WorkoutSession[]> {
  const q = query(
    collection(db, 'workoutSessions'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        sessionId: d.id,
        startedAt: data.startedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        completedAt: data.completedAt?.toDate?.()?.toISOString() ?? null,
      } as WorkoutSession;
    })
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
