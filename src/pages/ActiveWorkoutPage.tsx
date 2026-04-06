import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, SkipForward } from 'lucide-react';
import { SetLogger } from '@/components/workout/SetLogger';
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay';
import { WorkoutCompleteModal } from '@/components/workout/WorkoutCompleteModal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { useAuth } from '@/hooks/useAuth';
import { getExercisesForPlan, getPlanById } from '@/services/workoutService';
import { startSession, completeSession, rateSession } from '@/services/sessionService';
import { updateStreak } from '@/services/streakService';
import type { Exercise, WorkoutPlan } from '@/types/workout';
import { formatSeconds } from '@/utils/formatters';

export function ActiveWorkoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [awaitingRest, setAwaitingRest] = useState(false);

  const timer = useWorkoutTimer();
  const workout = useActiveWorkout(exercises);
  const restTimer = useRestTimer(() => setAwaitingRest(false));

  useEffect(() => {
    if (!planId) return;
    Promise.all([getPlanById(planId), getExercisesForPlan(planId)])
      .then(([p, e]) => {
        setPlan(p);
        setExercises(e);
        if (p && user) {
          const total = e.reduce((s, ex) => s + ex.sets, 0);
          startSession(user.uid, p.planId, p.title, total).then(setSessionId);
        }
        timer.start();
      })
      .finally(() => setLoading(false));
  }, [planId, user]);

  useEffect(() => {
    if (workout.isComplete) {
      timer.pause();
      setShowComplete(true);
    }
  }, [workout.isComplete]);

  const handleSetDone = (weightKg: number | null, reps: number | null) => {
    const result = workout.logSet(weightKg, reps);
    const ex = exercises[workout.currentExerciseIndex];
    if (result !== null && ex) {
      setRestDuration(ex.restSecs);
      setAwaitingRest(true);
      restTimer.startRest(ex.restSecs);
    }
  };

  const handleSave = async (rating: 1 | 2 | 3 | 4 | 5) => {
    if (sessionId) {
      await completeSession(sessionId, timer.elapsedSecs, workout.totalSetsCompleted, workout.exerciseLogs);
      await rateSession(sessionId, rating);
    }
    if (userProfile) await updateStreak(userProfile);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const currentExercise = workout.getCurrentExercise();
  const totalExercises = exercises.length;
  const progressPct = totalExercises > 0
    ? ((workout.currentExerciseIndex) / totalExercises) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center px-4 h-14">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-textMuted">
          <X size={22} />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-textPrimary">{plan?.title}</p>
          <p className="text-xs text-textMuted">{formatSeconds(timer.elapsedSecs)}</p>
        </div>
        <button onClick={workout.skipExercise} className="p-2 -mr-2 text-textMuted hover:text-accent">
          <SkipForward size={20} />
        </button>
      </header>

      {/* Progress ring */}
      <div className="flex justify-center my-4">
        <ProgressRing
          percentage={progressPct}
          size={160}
          label={`${workout.currentExerciseIndex + 1}/${totalExercises}`}
          sublabel="exercise"
          color="#FF6B35"
        />
      </div>

      {/* Current exercise */}
      {currentExercise && (
        <div className="px-4 flex-1 flex flex-col gap-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-textPrimary">{currentExercise.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge label={currentExercise.muscleGroup} color="muted" />
              <span className="text-xs text-textMuted">
                Set {workout.currentSetIndex + 1} of {currentExercise.sets}
              </span>
            </div>
            {currentExercise.notes && (
              <p className="text-xs text-textMuted mt-2 italic">{currentExercise.notes}</p>
            )}
          </div>

          <SetLogger
            exercise={currentExercise}
            setNumber={workout.currentSetIndex + 1}
            onComplete={handleSetDone}
          />

          {/* Upcoming */}
          {exercises[workout.currentExerciseIndex + 1] && (
            <div className="bg-surface rounded-2xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surfaceHigh flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-textMuted">Next</span>
              </div>
              <div>
                <p className="text-sm text-textPrimary">{exercises[workout.currentExerciseIndex + 1].name}</p>
                <p className="text-xs text-textMuted">
                  {exercises[workout.currentExerciseIndex + 1].sets} sets
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rest overlay */}
      {awaitingRest && restTimer.isActive && (
        <RestTimerOverlay
          remaining={restTimer.remaining}
          totalSecs={restDuration}
          onSkip={() => { restTimer.skipRest(); setAwaitingRest(false); }}
        />
      )}

      {/* Complete modal */}
      <WorkoutCompleteModal
        isOpen={showComplete}
        durationSecs={timer.elapsedSecs}
        setsCompleted={workout.totalSetsCompleted}
        planTitle={plan?.title ?? ''}
        onRate={handleSave}
        onClose={() => navigate('/')}
      />
    </div>
  );
}
