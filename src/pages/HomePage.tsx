import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StreakBadge } from '@/components/progress/StreakBadge';
import { WaterTracker } from '@/components/water/WaterTracker';
import { DailyMacroSummary } from '@/components/macros/DailyMacroSummary';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { BarChart } from '@/components/ui/BarChart';
import { LineChart } from '@/components/ui/LineChart';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useSchedule } from '@/hooks/useSchedule';
import { useMacros } from '@/hooks/useMacros';
import { useWater } from '@/hooks/useWater';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';
import { useActivityCharts } from '@/hooks/useActivityCharts';
import { todayISO } from '@/utils/formatters';

export function HomePage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { scheduled } = useSchedule(user?.uid ?? null);
  const { totals } = useMacros(user?.uid ?? null);
  const { glasses, increment, decrement } = useWater(user?.uid ?? null, userProfile?.dailyWaterGoal);
  const { plans, loading: plansLoading } = useWorkoutPlans();
  const { weeklyBarData, effortLineData, completedThisWeek, loading: chartsLoading } = useActivityCharts(user?.uid ?? null);

  const todayWorkouts = scheduled.filter((s) => s.scheduledDate === todayISO() && !s.completed);
  const popularPlans = plans.slice(0, 4);
  const weeklyGoal = userProfile?.weeklyWorkoutGoal ?? 3;
  const weeklyProgress = Math.min(completedThisWeek / weeklyGoal, 1);

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
            <div>
              <p className="text-xs font-display font-semibold tracking-widest uppercase text-textMuted mb-0.5">Today</p>
              <h2 className="text-lg font-display font-semibold text-textPrimary">Your Workout</h2>
            </div>
            <button onClick={() => navigate('/schedule')} className="text-xs text-accent flex items-center gap-1">
              <Calendar size={14} /> Schedule
            </button>
          </div>
          {todayWorkouts.slice(0, 1).map((s) => (
            <div
              key={s.scheduleId}
              className="p-[1px] bg-gradient-to-br from-accent/50 to-accent/10 rounded-2xl"
            >
              <div
                onClick={() => navigate(`/plans/${s.planId}`)}
                className="bg-accent/10 rounded-[15px] p-4 cursor-pointer"
              >
                <p className="font-semibold text-textPrimary">{s.planTitle}</p>
                <p className="text-xs text-textMuted mt-0.5">Tap to start your workout</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Weekly Goal Progress */}
      <section className="mb-6">
        <button
          onClick={() => navigate('/schedule')}
          className="w-full bg-gradient-to-b from-[#2E2E2E] to-[#252525] rounded-2xl p-4 text-left border border-white/[0.06] shadow-card"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-display font-semibold text-textPrimary">This Week</h2>
              <p className="text-xs text-textMuted mt-0.5">
                {completedThisWeek} of {weeklyGoal} workout{weeklyGoal !== 1 ? 's' : ''} completed
              </p>
            </div>
            <ChevronRight size={18} className="text-textMuted" />
          </div>
          <div className="w-full h-2 bg-surfaceHigh rounded-full overflow-hidden">
            <div
              className="h-full bg-accentGreen rounded-full transition-all duration-500"
              style={{ width: `${weeklyProgress * 100}%` }}
            />
          </div>
        </button>
      </section>

      {/* Water */}
      <section className="mb-6">
        <WaterTracker
          glasses={glasses}
          goal={userProfile?.dailyWaterGoal ?? 8}
          onIncrement={increment}
          onDecrement={decrement}
        />
      </section>

      {/* Activity Charts */}
      {!chartsLoading && (
        <>
          <section className="mb-6">
            <p className="text-xs font-display font-semibold tracking-widest uppercase text-textMuted mb-1">Activity</p>
            <h2 className="text-lg font-display font-semibold text-textPrimary mb-3">Weekly Workouts</h2>
            <div className="bg-gradient-to-b from-[#2E2E2E] to-[#252525] rounded-2xl p-4 border border-white/[0.06] shadow-card">
              <BarChart data={weeklyBarData} />
            </div>
          </section>

          {effortLineData.length >= 2 && (
            <section className="mb-6">
              <p className="text-xs font-display font-semibold tracking-widest uppercase text-textMuted mb-1">Progress</p>
              <h2 className="text-lg font-display font-semibold text-textPrimary mb-3">Effort Trend</h2>
              <div className="bg-gradient-to-b from-[#2E2E2E] to-[#252525] rounded-2xl p-4 border border-white/[0.06] shadow-card">
                <LineChart data={effortLineData} color="#FF6B35" />
                <p className="text-xs text-textMuted mt-2 text-center">Effort rating (1–5) across last {effortLineData.length} workouts</p>
              </div>
            </section>
          )}
        </>
      )}

      {/* Macros */}
      {userProfile && (
        <section className="mb-6">
          <DailyMacroSummary totals={totals} targets={userProfile} />
        </section>
      )}

      {/* Popular Plans */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-display font-semibold tracking-widest uppercase text-textMuted mb-0.5">Explore</p>
            <h2 className="text-lg font-display font-semibold text-textPrimary">Popular Plans</h2>
          </div>
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
