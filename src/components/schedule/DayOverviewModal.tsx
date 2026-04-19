import { useEffect, useState } from 'react';
import { Dumbbell, Flame, Activity } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { getScheduledWorkoutsForDate } from '@/services/scheduleService';
import { getDailyMacros } from '@/services/macroService';
import { getBodyMetrics } from '@/services/progressService';
import type { ScheduledWorkout } from '@/types/schedule';
import type { MacroLog } from '@/types/macro';
import type { BodyMetric } from '@/types/progress';

interface DayOverviewModalProps {
  date: string;
  userId: string;
  onClose: () => void;
}

interface DayData {
  workouts: ScheduledWorkout[];
  macros: MacroLog[];
  metrics: BodyMetric[];
}

export function DayOverviewModal({ date, userId, onClose }: DayOverviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DayData>({ workouts: [], macros: [], metrics: [] });

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getScheduledWorkoutsForDate(userId, date),
      getDailyMacros(userId, date),
      getBodyMetrics(userId),
    ]).then(([workouts, macros, allMetrics]) => {
      setData({
        workouts,
        macros,
        metrics: allMetrics.filter((m) => m.date === date),
      });
      setLoading(false);
    });
  }, [userId, date]);

  const totalCalories = data.macros.reduce((s, m) => s + m.calories, 0);
  const totalProtein = data.macros.reduce((s, m) => s + m.proteinG, 0);
  const totalCarbs = data.macros.reduce((s, m) => s + m.carbsG, 0);
  const totalFat = data.macros.reduce((s, m) => s + m.fatG, 0);
  const hasMacros = data.macros.length > 0;

  const metric = data.metrics[0] ?? null;
  const metricRows: { label: string; value: string }[] = metric
    ? [
        metric.weightKg !== null ? { label: 'Weight', value: `${metric.weightKg} kg` } : null,
        metric.bicepsCm !== null ? { label: 'Biceps', value: `${metric.bicepsCm} cm` } : null,
        metric.waistCm !== null ? { label: 'Waist', value: `${metric.waistCm} cm` } : null,
        metric.chestCm !== null ? { label: 'Chest', value: `${metric.chestCm} cm` } : null,
        metric.hipsCm !== null ? { label: 'Hips', value: `${metric.hipsCm} cm` } : null,
        metric.thighsCm !== null ? { label: 'Thighs', value: `${metric.thighsCm} cm` } : null,
      ].filter((r): r is { label: string; value: string } => r !== null)
    : [];

  return (
    <Modal isOpen onClose={onClose} title={displayDate}>
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Workouts */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-textPrimary">Workouts</h3>
            </div>
            {data.workouts.length === 0 ? (
              <p className="text-xs text-textMuted">No workouts scheduled</p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.workouts.map((w) => (
                  <div key={w.scheduleId} className="flex items-center justify-between bg-surfaceHigh rounded-xl px-3 py-2">
                    <p className="text-sm text-textPrimary">{w.planTitle}</p>
                    {w.completed ? (
                      <span className="text-xs font-semibold text-accentGreen bg-accentGreen/10 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Macros */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-textPrimary">Nutrition</h3>
            </div>
            {!hasMacros ? (
              <p className="text-xs text-textMuted">No meals logged</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Calories', value: Math.round(totalCalories) },
                  { label: 'Protein', value: `${Math.round(totalProtein)}g` },
                  { label: 'Carbs', value: `${Math.round(totalCarbs)}g` },
                  { label: 'Fat', value: `${Math.round(totalFat)}g` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surfaceHigh rounded-xl p-2 text-center">
                    <p className="text-sm font-bold text-textPrimary">{value}</p>
                    <p className="text-xs text-textMuted mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Body Metrics */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-textPrimary">Body Metrics</h3>
            </div>
            {metricRows.length === 0 ? (
              <p className="text-xs text-textMuted">No measurements logged</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {metricRows.map(({ label, value }) => (
                  <div key={label} className="bg-surfaceHigh rounded-xl p-2 text-center">
                    <p className="text-sm font-bold text-textPrimary">{value}</p>
                    <p className="text-xs text-textMuted mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
