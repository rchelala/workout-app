import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { WaterLog } from '@/types/common';
import { todayISO } from '@/utils/formatters';

function waterDocId(userId: string, date: string): string {
  return `${userId}_${date}`;
}

export async function getTodayWater(userId: string): Promise<WaterLog | null> {
  const date = todayISO();
  const snap = await getDoc(doc(db, 'waterLogs', waterDocId(userId, date)));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    logId: snap.id,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as WaterLog;
}

export async function setWaterCount(userId: string, glasses: number): Promise<void> {
  const date = todayISO();
  await setDoc(doc(db, 'waterLogs', waterDocId(userId, date)), {
    userId,
    date,
    glasses,
    updatedAt: serverTimestamp(),
  });
}
