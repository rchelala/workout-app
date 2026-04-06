import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { WeekStrip } from '@/components/schedule/WeekStrip';
import { ScheduleEventCard } from '@/components/schedule/ScheduleEventCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useSchedule } from '@/hooks/useSchedule';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';
import { useAuth } from '@/hooks/useAuth';
import { scheduleWorkout, deleteScheduledWorkout } from '@/services/scheduleService';
import { todayISO } from '@/utils/formatters';

export function SchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scheduled, loading, refetch } = useSchedule(user?.uid ?? null);
  const { plans } = useWorkoutPlans();

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [addOpen, setAddOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const workoutDates = [...new Set(scheduled.map((s) => s.scheduledDate))];
  const dayEvents = scheduled.filter((s) => s.scheduledDate === selectedDate);

  const handleAdd = async () => {
    if (!user || !selectedPlanId) return;
    const plan = plans.find((p) => p.planId === selectedPlanId);
    if (!plan) return;
    setScheduling(true);
    await scheduleWorkout(user.uid, plan.planId, plan.title, selectedDate, scheduleTime || null);
    refetch();
    setScheduling(false);
    setAddOpen(false);
    setSelectedPlanId('');
    setScheduleTime('');
  };

  const handleDelete = async (id: string) => {
    await deleteScheduledWorkout(id);
    refetch();
  };

  return (
    <AppShell
      title="Schedule"
      rightAction={
        <button onClick={() => setAddOpen(true)} className="p-2 rounded-full bg-surface text-accent">
          <Plus size={20} />
        </button>
      }
    >
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} workoutDates={workoutDates} />

      <div className="mt-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : dayEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-textMuted text-sm">No workouts scheduled for this day</p>
            <button onClick={() => setAddOpen(true)} className="text-accent text-sm mt-2">+ Add workout</button>
          </div>
        ) : (
          dayEvents.map((event) => (
            <ScheduleEventCard
              key={event.scheduleId}
              event={event}
              onDelete={handleDelete}
              onStart={(planId) => navigate(`/plans/${planId}`)}
            />
          ))
        )}
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Schedule Workout">
        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-textMuted">Select Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-surfaceHigh text-textPrimary text-sm border border-border focus:outline-none focus:border-accent"
            >
              <option value="">Choose a plan…</option>
              {plans.map((p) => (
                <option key={p.planId} value={p.planId}>{p.title}</option>
              ))}
            </select>
          </div>
          <Input label="Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          <Input label="Time (optional)" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          <Button variant="primary" fullWidth size="lg" loading={scheduling} disabled={!selectedPlanId} onClick={handleAdd}>
            Add to Schedule
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
