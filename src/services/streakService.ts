import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { computeNewStreak } from '@/utils/streakUtils';
import { todayISO } from '@/utils/formatters';
import type { UserProfile } from '@/types/user';

export async function updateStreak(profile: UserProfile): Promise<void> {
  const newStreak = computeNewStreak(profile.currentStreak, profile.lastWorkoutDate);
  const longestStreak = Math.max(newStreak, profile.longestStreak);
  await updateDoc(doc(db, 'users', profile.uid), {
    currentStreak: newStreak,
    longestStreak,
    lastWorkoutDate: todayISO(),
  });
}
