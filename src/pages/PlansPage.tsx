import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { FilterBar } from '@/components/workout/FilterBar';
import { Spinner } from '@/components/ui/Spinner';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';
import { useCustomWorkouts } from '@/hooks/useCustomWorkouts';
import { useAuth } from '@/hooks/useAuth';
import { deleteCustomPlan } from '@/services/workoutService';
import type { WorkoutType } from '@/types/workout';

type Tab = 'browse' | 'mine';

const TYPE_LABELS: Record<WorkoutType, string> = {
  strength: 'Strength',
  hiit: 'HIIT',
  cardio: 'Cardio',
  flexibility: 'Flexibility',
};

export function PlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filteredPlans, loading, error, filters, setFilters } = useWorkoutPlans();
  const { plans: customPlans, loading: customLoading, refetch } = useCustomWorkouts(user?.uid ?? null);
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (planId: string) => {
    setDeletingId(planId);
    try {
      await deleteCustomPlan(planId);
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell title="Workout Plans">
      {/* Tab switcher */}
      <div className="bg-surface rounded-xl p-1 flex gap-1 mb-4">
        <button
          onClick={() => setActiveTab('browse')}
          className={[
            'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors',
            activeTab === 'browse' ? 'bg-accent text-white' : 'text-textMuted',
          ].join(' ')}
        >
          Browse Plans
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={[
            'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors',
            activeTab === 'mine' ? 'bg-accent text-white' : 'text-textMuted',
          ].join(' ')}
        >
          My Workouts
        </button>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Quick log entry */}
          <button
            onClick={() => navigate('/workout/quick-log')}
            className="w-full flex items-center justify-between bg-surface rounded-2xl px-4 py-3 mb-4 hover:bg-surfaceHigh transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accentGreen/20 flex items-center justify-center">
                <Plus size={18} className="text-accentGreen" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-textPrimary">Log Custom Workout</p>
                <p className="text-xs text-textMuted">Free-form — add your own exercises</p>
              </div>
            </div>
            <span className="text-textMuted text-lg">›</span>
          </button>

          <FilterBar filters={filters} onChange={setFilters} />
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : error ? (
            <p className="text-center text-danger py-8">{error}</p>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-textMuted">No plans match your filters.</p>
              <button
                onClick={() => setFilters({ duration: null, equipment: null, gender: null, type: null })}
                className="text-accent text-sm mt-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {filteredPlans.map((plan) => (
                <WorkoutCard
                  key={plan.planId}
                  plan={plan}
                  onClick={() => navigate(`/plans/${plan.planId}`)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Create button */}
          <button
            onClick={() => navigate('/workout/builder')}
            className="bg-accentGreen text-background rounded-2xl h-14 w-full font-semibold flex items-center justify-center gap-2 mb-4"
          >
            <Plus size={20} />
            Create Workout
          </button>

          {customLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : customPlans.length === 0 ? (
            <p className="text-center text-textMuted py-12">
              No custom workouts yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-3">
              {customPlans.map((plan) => (
                <div key={plan.planId} className="bg-surface rounded-xl p-4 flex items-center gap-3">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/plans/${plan.planId}`)}
                  >
                    <p className="text-sm font-semibold text-textPrimary truncate">{plan.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                        {TYPE_LABELS[plan.workoutType]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surfaceHigh text-textMuted font-medium">
                        {plan.durationMins} min
                      </span>
                      <span className="text-xs text-textDisabled">
                        {plan.totalExercises} exercise{plan.totalExercises !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/workout/builder/${plan.planId}`)}
                    className="p-2 rounded-lg text-textDisabled hover:text-accent transition-colors shrink-0"
                    aria-label="Edit workout"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.planId)}
                    disabled={deletingId === plan.planId}
                    className="p-2 rounded-lg text-textDisabled hover:text-danger transition-colors shrink-0 disabled:opacity-40"
                    aria-label="Delete workout"
                  >
                    {deletingId === plan.planId ? <Spinner size="sm" /> : <Trash2 size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
