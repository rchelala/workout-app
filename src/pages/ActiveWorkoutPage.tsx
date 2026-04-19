import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, SkipForward } from 'lucide-react';
import { SetLogger } from '@/components/workout/SetLogger';
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay';
import { WorkoutCompleteModal } from '@/components/workout/WorkoutCompleteModal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Toast } from '@/components/ui/Toast';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { useAuth } from '@/hooks/useAuth';
import { getExercisesForPlan, getPlanById } from '@/services/workoutService';
import { startSession, completeSession, rateSession } from '@/services/sessionService';
import { markScheduledComplete } from '@/services/scheduleService';
import { updateStreak } from '@/services/streakService';
import type { Exercise, WorkoutPlan } from '@/types/workout';
import { formatSeconds } from '@/utils/formatters';

type WorkoutPhase = 'ready' | 'set-active' | 'rest-ready' | 'resting';

export function ActiveWorkoutPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const scheduleId = (location.state as { scheduleId?: string } | null)?.scheduleId ?? null;
  const { user, userProfile } = useAuth();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [phase, setPhase] = useState<WorkoutPhase>('ready');
  const [currentRestSecs, setCurrentRestSecs] = useState(60);
  const [saveError, setSaveError] = useState<string | null>(null);

  const timer = useWorkoutTimer();
  const workout = useActiveWorkout(exercises);
  const restTimer = useRestTimer(() => setPhase('ready'));

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

  const handleStartSet = () => {
    setPhase('set-active');
  };

  const handleSetDone = (weightKg: number | null, reps: number | null) => {
    // Snapshot rest duration BEFORE logSet advances the exercise index
    const ex = exercises[workout.currentExerciseIndex];
    const restSecs = ex?.restSecs ?? 60;

    const result = workout.logSet(weightKg, reps);

    if (result !== null) {
      setCurrentRestSecs(restSecs);
      setPhase('rest-ready');
    }
    // If result is null the workout is complete — useEffect above handles that
  };

  const handleStartRest = () => {
    setPhase('resting');
    restTimer.startRest(currentRestSecs);
  };

  const handleSave = async (rating: 1 | 2 | 3 | 4 | 5) => {
    setSaveError(null);
    try {
      if (sessionId) {
        await completeSession(sessionId, timer.elapsedSecs, workout.totalSetsCompleted, workout.exerciseLogs);
        await rateSession(sessionId, rating);
        if (scheduleId) {
          try {
            await markScheduledComplete(scheduleId, sessionId);
          } catch {
            // Non-blocking — schedule marking failure should not prevent workout save
          }
        }
      }
      if (userProfile) await updateStreak(userProfile);
      navigate('/');
    } catch {
      setSaveError('Failed to save workout. Check your connection and try again.');
    }
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

          {/* Set logger — key forces remount between sets, resetting inputs */}
          {(phase === 'ready' || phase === 'set-active') && (
            <SetLogger
              key={`${workout.currentExerciseIndex}-${workout.currentSetIndex}`}
              exercise={currentExercise}
              setNumber={workout.currentSetIndex + 1}
              phase={phase}
              onStartSet={handleStartSet}
              onComplete={handleSetDone}
            />
          )}

          {/* Rest ready state — prompt to start rest */}
          {phase === 'rest-ready' && (
            <div className="bg-surface rounded-2xl p-6 flex flex-col items-center gap-4">
              <p className="text-lg font-semibold text-textPrimary">Set Complete!</p>
              <p className="text-sm text-textMuted">Rest for {currentRestSecs}s when ready</p>
              <button
                onClick={handleStartRest}
                className="w-full h-14 rounded-2xl bg-accentGreen text-background font-semibold text-base"
              >
                Start Rest ({currentRestSecs}s)
              </button>
              <button
                onClick={() => setPhase('ready')}
                className="text-sm text-textMuted underline-offset-2 hover:underline"
              >
                Skip rest
              </button>
            </div>
          )}

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

      {/* Rest timer overlay */}
      {phase === 'resting' && restTimer.isActive && (
        <RestTimerOverlay
          remaining={restTimer.remaining}
          totalSecs={currentRestSecs}
          onSkip={() => { restTimer.skipRest(); }}
        />
      )}

      {/* Save error toast */}
      {saveError && (
        <Toast message={saveError} type="error" onDismiss={() => setSaveError(null)} />
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
