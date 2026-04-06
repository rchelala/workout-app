import { useNavigate } from 'react-router-dom';
import { Bell, Calendar } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StreakBadge } from '@/components/progress/StreakBadge';
import { WaterTracker } from '@/components/water/WaterTracker';
import { DailyMacroSummary } from '@/components/macros/DailyMacroSummary';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useSchedule } from '@/hooks/useSchedule';
import { useMacros } from '@/hooks/useMacros';
import { useWater } from '@/hooks/useWater';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';
import { todayISO } from '@/utils/formatters';

export function HomePage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { scheduled } = useSchedule(user?.uid ?? null);
  const { totals } = useMacros(user?.uid ?? null);
  const { glasses, increment, decrement } = useWater(user?.uid ?? null, userProfile?.dailyWaterGoal);
  const { plans, loading: plansLoading } = useWorkoutPlans();

  const todayWorkouts = scheduled.filter((s) => s.scheduledDate === todayISO() && !s.completed);
  const popularPlans = plans.slice(0, 4);

  return (
    <AppShell
      title={`Welcome, ${userProfile?.displayName?.split(' ')[0] ?? 'there'}`}
      rightAction={
        <button className="p-2 rounded-full bg-surface text-textMuted hover:text-textPrimary">
          <Bell size={20} />
        </button>
      }
    >
      {/* Streak */}
      {userProfile && userProfile.currentStreak > 0 && (
        <div className="mb-4">
          <StreakBadge streak={userProfile.currentStreak} />
        </div>
      )}

      {/* Today's scheduled workout */}
      {todayWorkouts.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-textPrimary">Today's Workout</h2>
            <button onClick={() => navigate('/schedule')} className="text-xs text-accent flex items-center gap-1">
              <Calendar size={14} /> Schedule
            </button>
          </div>
          {todayWorkouts.slice(0, 1).map((s) => (
            <div
              key={s.scheduleId}
              onClick={() => navigate(`/plans/${s.planId}`)}
              className="bg-accent/10 border border-accent/30 rounded-2xl p-4 cursor-pointer"
            >
              <p className="font-semibold text-textPrimary">{s.planTitle}</p>
              <p className="text-xs text-textMuted mt-0.5">Tap to start your workout</p>
            </div>
          ))}
        </section>
      )}

      {/* Water */}
      <section className="mb-6">
        <WaterTracker
          glasses={glasses}
          goal={userProfile?.dailyWaterGoal ?? 8}
          onIncrement={increment}
          onDecrement={decrement}
        />
      </section>

      {/* Macros */}
      {userProfile && (
        <section className="mb-6">
          <DailyMacroSummary totals={totals} targets={userProfile} />
        </section>
      )}

      {/* Popular Plans */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-textPrimary">Popular Plans</h2>
          <button onClick={() => navigate('/plans')} className="text-xs text-accent">See All</button>
        </div>
        {plansLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {popularPlans.map((plan) => (
              <WorkoutCard key={plan.planId} plan={plan} onClick={() => navigate(`/plans/${plan.planId}`)} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
