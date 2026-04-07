import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MeasurementForm } from '@/components/progress/MeasurementForm';
import { MetricCard } from '@/components/progress/MetricCard';
import { StreakBadge } from '@/components/progress/StreakBadge';
import { LineChart } from '@/components/ui/LineChart';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { addBodyMetric } from '@/services/progressService';
import type { BodyMetric } from '@/types/progress';

export function ProgressPage() {
  const { user, userProfile } = useAuth();
  const { metrics, loading, refetch } = useProgress(user?.uid ?? null);
  const [addOpen, setAddOpen] = useState(false);

  const latest = metrics[metrics.length - 1] ?? null;
  const prev = metrics[metrics.length - 2] ?? null;

  const weightData = metrics
    .filter((m) => m.weightKg !== null)
    .map((m) => ({ date: m.date, value: m.weightKg! }));

  const handleSubmit = async (data: Omit<BodyMetric, 'metricId' | 'userId' | 'loggedAt'>) => {
    if (!user) return;
    await addBodyMetric(user.uid, data);
    refetch();
    setAddOpen(false);
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

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Log Measurements">
        <MeasurementForm gender={userProfile?.gender ?? 'male'} onSubmit={handleSubmit} />
      </Modal>
    </AppShell>
  );
}
