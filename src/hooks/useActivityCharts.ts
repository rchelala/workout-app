import { useState, useEffect, useMemo } from 'react';
import { getHistory } from '@/services/sessionService';

interface BarData {
  label: string;
  value: number | null;
  unit?: string;
  active?: boolean;
}

interface DataPoint {
  date: string;
  value: number;
}

interface ActivityChartsResult {
  weeklyBarData: BarData[];
  effortLineData: DataPoint[];
  completedThisWeek: number;
  loading: boolean;
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() + diff);
  return monday;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function useActivityCharts(userId: string | null): ActivityChartsResult {
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof getHistory>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getHistory(userId)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [userId]);

  const weeklyBarData = useMemo<BarData[]>(() => {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    const todayISO = toISO(today);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const iso = toISO(day);

      const session = sessions.find(
        (s) =>
          s.status === 'completed' &&
          s.completedAt !== null &&
          s.completedAt.slice(0, 10) === iso
      );

      return {
        label: DAY_LABELS[i],
        value: session ? Math.round(session.durationSecs / 60) : null,
        unit: session ? 'min' : '',
        active: iso === todayISO,
      };
    });
  }, [sessions]);

  const effortLineData = useMemo<DataPoint[]>(() => {
    return sessions
      .filter((s) => s.status === 'completed' && s.effortRating !== null && s.completedAt !== null)
      .slice(0, 7)
      .reverse()
      .map((s) => ({
        date: s.completedAt!.slice(0, 10),
        value: s.effortRating!,
      }));
  }, [sessions]);

  const completedThisWeek = useMemo(() => {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayISO = toISO(monday);
    const sundayISO = toISO(sunday);

    return sessions.filter(
      (s) =>
        s.status === 'completed' &&
        s.completedAt !== null &&
        s.completedAt.slice(0, 10) >= mondayISO &&
        s.completedAt.slice(0, 10) <= sundayISO
    ).length;
  }, [sessions]);

  return { weeklyBarData, effortLineData, completedThisWeek, loading };
}
