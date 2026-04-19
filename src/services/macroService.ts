import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { MacroLog, MealAnalysisResult } from '@/types/macro';
import { todayISO } from '@/utils/formatters';

export async function analyzeMealPhoto(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<MealAnalysisResult> {
  const response = await fetch('/api/analyze-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!response.ok) {
    throw new Error('Failed to analyze meal');
  }
  const data = await response.json() as { result: MealAnalysisResult | string; raw?: boolean };
  if (data.raw && typeof data.result === 'string') {
    throw new Error('AI returned unexpected format');
  }
  return data.result as MealAnalysisResult;
}

export async function analyzeMealText(mealText: string): Promise<MealAnalysisResult> {
  const response = await fetch('/api/analyze-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealText }),
  });
  const data = await response.json() as { result: MealAnalysisResult | string; raw?: boolean };
  if (data.raw) throw new Error('Could not parse meal text analysis');
  return data.result as MealAnalysisResult;
}

export async function searchFoodNutrition(query: string): Promise<MealAnalysisResult> {
  const response = await fetch('/api/search-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await response.json() as { result: MealAnalysisResult | string; raw?: boolean; error?: string };
  if (data.raw || data.error) throw new Error(data.error ?? 'Could not find nutrition data');
  return data.result as MealAnalysisResult;
}

export async function uploadMealPhoto(
  userId: string,
  base64: string,
  mimeType: string
): Promise<string> {
  const filename = `meal_photos/${userId}/${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);
  await uploadString(storageRef, base64, 'base64', { contentType: mimeType });
  return getDownloadURL(storageRef);
}

export async function addMacroLog(
  userId: string,
  log: Omit<MacroLog, 'logId' | 'userId' | 'loggedAt'>
): Promise<string> {
  const ref2 = await addDoc(collection(db, 'macroLogs'), {
    userId,
    ...log,
    date: log.date || todayISO(),
    loggedAt: serverTimestamp(),
  });
  return ref2.id;
}

export async function deleteMacroLog(logId: string): Promise<void> {
  await deleteDoc(doc(db, 'macroLogs', logId));
}

export async function getMacroDatesWithEntries(userId: string): Promise<string[]> {
  const q = query(
    collection(db, 'macroLogs'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const dates = new Set<string>();
  snap.docs.forEach((d) => {
    const date = d.data().date as string | undefined;
    if (date) dates.add(date);
  });
  return Array.from(dates);
}

export async function getDailyMacros(userId: string, date: string): Promise<MacroLog[]> {
  const q = query(
    collection(db, 'macroLogs'),
    where('userId', '==', userId),
    where('date', '==', date)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ...data,
        logId: d.id,
        loggedAt: data.loggedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      } as MacroLog;
    })
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
}
