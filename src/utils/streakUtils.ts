import { todayISO } from './formatters';

export function isConsecutiveDay(lastDate: string | null): boolean {
  if (!lastDate) return false;
  const last = new Date(lastDate);
  const today = new Date(todayISO());
  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export function isToday(date: string | null): boolean {
  if (!date) return false;
  return date === todayISO();
}

export function computeNewStreak(
  currentStreak: number,
  lastWorkoutDate: string | null
): number {
  if (isToday(lastWorkoutDate)) return currentStreak;
  if (isConsecutiveDay(lastWorkoutDate)) return currentStreak + 1;
  return 1;
}
