import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { FilterBar } from '@/components/workout/FilterBar';
import { Spinner } from '@/components/ui/Spinner';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';

export function PlansPage() {
  const navigate = useNavigate();
  const { filteredPlans, loading, error, filters, setFilters } = useWorkoutPlans();

  return (
    <AppShell title="Workout Plans">
      <FilterBar filters={filters} onChange={setFilters} />
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : error ? (
        <p className="text-center text-danger py-8">{error}</p>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-textMuted">No plans match your filters.</p>
          <button onClick={() => setFilters({ duration: null, equipment: null, gender: null, type: null })} className="text-accent text-sm mt-2">
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
    </AppShell>
  );
}
