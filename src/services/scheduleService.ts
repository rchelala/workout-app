import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ScheduledWorkout } from '@/types/schedule';

export async function scheduleWorkout(
  userId: string,
  planId: string,
  planTitle: string,
  scheduledDate: string,
  scheduledTime: string | null
): Promise<string> {
  const ref = await addDoc(collection(db, 'scheduledWorkouts'), {
    userId,
    planId,
    planTitle,
    scheduledDate,
    scheduledTime,
    completed: false,
    sessionId: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getScheduledWorkouts(userId: string): Promise<ScheduledWorkout[]> {
  const q = query(
    collection(db, 'scheduledWorkouts'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        scheduleId: d.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      } as ScheduledWorkout;
    })
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
}

export async function markScheduledComplete(
  scheduleId: string,
  sessionId: string
): Promise<void> {
  await updateDoc(doc(db, 'scheduledWorkouts', scheduleId), {
    completed: true,
    sessionId,
  });
}

export async function deleteScheduledWorkout(scheduleId: string): Promise<void> {
  await deleteDoc(doc(db, 'scheduledWorkouts', scheduleId));
}

export async function getScheduledWorkoutsForDate(
  userId: string,
  date: string
): Promise<ScheduledWorkout[]> {
  const q = query(
    collection(db, 'scheduledWorkouts'),
    where('userId', '==', userId),
    where('scheduledDate', '==', date)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      scheduleId: d.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    } as ScheduledWorkout;
  });
}
