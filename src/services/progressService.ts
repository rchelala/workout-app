import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BodyMetric } from '@/types/progress';
import { todayISO } from '@/utils/formatters';

export async function addBodyMetric(
  userId: string,
  metric: Omit<BodyMetric, 'metricId' | 'userId' | 'loggedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'bodyMetrics'), {
    userId,
    ...metric,
    date: metric.date || todayISO(),
    loggedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getBodyMetrics(userId: string): Promise<BodyMetric[]> {
  const q = query(
    collection(db, 'bodyMetrics'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        metricId: d.id,
        loggedAt: data.loggedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      } as BodyMetric;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
