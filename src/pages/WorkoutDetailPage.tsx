import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dumbbell, Clock, Calendar } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ExerciseListItem } from '@/components/workout/ExerciseListItem';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getPlanById, getExercisesForPlan } from '@/services/workoutService';
import { scheduleWorkout } from '@/services/scheduleService';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { WorkoutPlan, Exercise } from '@/types/workout';
import { todayISO } from '@/utils/formatters';

export function WorkoutDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(todayISO());
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (!planId) return;
    Promise.all([getPlanById(planId), getExercisesForPlan(planId)])
      .then(([p, e]) => { setPlan(p); setExercises(e); })
      .finally(() => setLoading(false));
  }, [planId]);

  const handleSchedule = async () => {
    if (!user || !plan) return;
    setScheduling(true);
    await scheduleWorkout(user.uid, plan.planId, plan.title, scheduleDate, scheduleTime || null);
    setScheduling(false);
    setScheduleOpen(false);
  };

  if (loading) {
    return (
      <AppShell title="" showBack>
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      </AppShell>
    );
  }

  if (!plan) {
    return <AppShell title="Not Found" showBack><p className="text-textMuted py-8 text-center">Plan not found.</p></AppShell>;
  }

  return (
    <AppShell title={plan.title} showBack rightAction={
      <button onClick={() => setScheduleOpen(true)} className="p-2 text-textMuted hover:text-accent">
        <Calendar size={20} />
      </button>
    }>
      {/* Hero */}
      <div className="relative -mx-4 h-48 bg-surfaceHigh flex items-center justify-center mb-4">
        {plan.thumbnailUrl ? (
          <img src={plan.thumbnailUrl} alt={plan.title} className="w-full h-full object-cover" />
        ) : (
          <Dumbbell size={48} className="text-border" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Meta */}
      <div className="flex gap-2 flex-wrap mb-4">
        <Badge label={`${plan.durationMins} min`} color="orange" />
        <Badge label={plan.workoutType} color="muted" />
        {plan.genderFocus !== 'all' && <Badge label={plan.genderFocus} color="muted" />}
        {plan.equipment.map((e) => <Badge key={e} label={e.replace('_', ' ')} color="muted" />)}
      </div>

      {/* Description */}
      <p className="text-sm text-textMuted mb-4">{plan.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-textPrimary">{plan.totalExercises}</p>
          <p className="text-xs text-textMuted">Exercises</p>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center">
          <Clock size={18} className="text-accent mx-auto mb-0.5" />
          <p className="text-xs text-textMuted">{plan.durationMins} min</p>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-textPrimary capitalize">{plan.fitnessLevel}</p>
          <p className="text-xs text-textMuted">Level</p>
        </div>
      </div>

      {/* Exercises */}
      <h2 className="text-lg font-semibold text-textPrimary mb-3">Exercises</h2>
      <div className="flex flex-col gap-2 mb-6">
        {exercises.map((ex, i) => (
          <ExerciseListItem key={ex.exerciseId} exercise={ex} index={i} />
        ))}
      </div>

      {/* CTA */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={() => navigate(`/workout/active/${plan.planId}`)}
      >
        Start Workout
      </Button>
      <div className="h-4" />

      {/* Schedule Modal */}
      <Modal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule Workout">
        <div className="space-y-3">
          <Input label="Date" type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
          <Input label="Time (optional)" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          <Button variant="primary" fullWidth size="lg" loading={scheduling} onClick={handleSchedule}>
            Add to Schedule
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
