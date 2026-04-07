import { useState, useEffect } from 'react';
import { Plus, Flame, Clock } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MeasurementForm } from '@/components/progress/MeasurementForm';
import { MetricCard } from '@/components/progress/MetricCard';
import { StreakBadge } from '@/components/progress/StreakBadge';
import { LineChart } from '@/components/ui/LineChart';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { addBodyMetric } from '@/services/progressService';
import { getHistory } from '@/services/sessionService';
import type { BodyMetric } from '@/types/progress';
import type { WorkoutSession } from '@/types/workout';
import { formatSeconds, formatShortDate } from '@/utils/formatters';

function estimateCaloriesBurned(durationSecs: number, weightKg: number): number {
  // MET 5.5 = generic mixed workout (strength/cardio blend)
  return Math.round(5.5 * weightKg * (durationSecs / 3600));
}

export function ProgressPage() {
  const { user, userProfile } = useAuth();
  const { metrics, loading, refetch } = useProgress(user?.uid ?? null);
  const [addOpen, setAddOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const latest = metrics[metrics.length - 1] ?? null;
  const prev = metrics[metrics.length - 2] ?? null;

  const weightData = metrics
    .filter((m) => m.weightKg !== null)
    .map((m) => ({ date: m.date, value: m.weightKg! }));

  // Weight for calorie estimates — use latest logged, fall back to 75 kg
  const weightKg = latest?.weightKg ?? 75;
  const weightIsEstimated = latest?.weightKg == null;

  useEffect(() => {
    if (!user) return;
    getHistory(user.uid)
      .then((all) => setSessions(all.filter((s) => s.status === 'completed').slice(0, 10)))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, [user]);

  // Weekly calories: sessions completed in the last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyCalories = sessions
    .filter((s) => s.completedAt && new Date(s.completedAt) >= weekAgo)
    .reduce((sum, s) => sum + estimateCaloriesBurned(s.durationSecs, weightKg), 0);

  const handleSubmit = async (data: Omit<BodyMetric, 'metricId' | 'userId' | 'loggedAt'>) => {
    if (!user) return;
    try {
      await addBodyMetric(user.uid, data);
      refetch();
      setAddOpen(false);
    } catch {
      setSaveError('Failed to save measurements. Check your connection and try again.');
    }
  };

  return (
    <AppShell
      title="Progress"
      rightAction={
        <button onClick={() => setAddOpen(true)} className="p-2 rounded-full bg-surface text-accent">
          <Plus size={20} />
        </button>
      }
    >
      {/* Streak */}
      {userProfile && userProfile.currentStreak > 0 && (
        <div className="mb-4">
          <StreakBadge streak={userProfile.currentStreak} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : metrics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-textMuted">No measurements yet.</p>
          <button onClick={() => setAddOpen(true)} className="text-accent text-sm mt-2">Log your first measurement</button>
        </div>
      ) : (
        <>
          {/* Weight chart */}
          {weightData.length >= 2 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-textPrimary mb-3">Weight Over Time</h2>
              <div className="bg-surface rounded-2xl p-4">
                <LineChart data={weightData} color="#FF6B35" />
              </div>
            </section>
          )}

          {/* Metrics grid */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-textPrimary mb-3">Latest Measurements</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Weight', key: 'weightKg', unit: 'kg' },
                { label: 'Body Fat', key: 'bodyFatPercent', unit: '%' },
                { label: 'Neck', key: 'neckCm', unit: 'cm' },
                { label: 'Biceps', key: 'bicepsCm', unit: 'cm' },
                { label: 'Chest', key: 'chestCm', unit: 'cm' },
                { label: 'Waist', key: 'waistCm', unit: 'cm' },
                { label: 'Hips', key: 'hipsCm', unit: 'cm' },
                { label: 'Thighs', key: 'thighsCm', unit: 'cm' },
              ].map(({ label, key, unit }) => (
                <MetricCard
                  key={key}
                  label={label}
                  current={latest ? (latest[key as keyof BodyMetric] as number | null) : null}
                  previous={prev ? (prev[key as keyof BodyMetric] as number | null) : null}
                  unit={unit}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Workout History + Calories Burned */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-textPrimary">Recent Workouts</h2>
          {weeklyCalories > 0 && (
            <div className="flex items-center gap-1 bg-surface rounded-xl px-3 py-1">
              <Flame size={14} className="text-accent" />
              <span className="text-sm font-semibold text-accent">{weeklyCalories}</span>
              <span className="text-xs text-textMuted">kcal this week</span>
            </div>
          )}
        </div>

        {sessionsLoading ? (
          <div className="flex justify-center py-6"><Spinner size="sm" /></div>
        ) : sessions.length === 0 ? (
          <p className="text-textMuted text-sm text-center py-6">No completed workouts yet.</p>
        ) : (
          <div className="space-y-2">
            {weightIsEstimated && (
              <p className="text-xs text-textMuted mb-2">
                * Calorie estimates use 75 kg default. Log your weight for a personalised figure.
              </p>
            )}
            {sessions.map((s) => {
              const kcal = estimateCaloriesBurned(s.durationSecs, weightKg);
              return (
                <div key={s.sessionId} className="bg-surface rounded-2xl p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textPrimary truncate">{s.planTitle}</p>
                    <p className="text-xs text-textMuted">
                      {s.completedAt ? formatShortDate(s.completedAt) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-textMuted" />
                      <span className="text-xs text-textMuted">{formatSeconds(s.durationSecs)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame size={12} className="text-accent" />
                      <span className="text-xs font-semibold text-accent">{kcal} kcal</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {saveError && (
        <Toast message={saveError} type="error" onDismiss={() => setSaveError(null)} />
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Log Measurements">
        <MeasurementForm gender={userProfile?.gender ?? 'male'} onSubmit={handleSubmit} />
      </Modal>
    </AppShell>
  );
}
