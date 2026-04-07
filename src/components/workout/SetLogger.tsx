import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { formatSeconds } from '@/utils/formatters';
import type { Exercise } from '@/types/workout';

interface SetLoggerProps {
  exercise: Exercise;
  setNumber: number;
  phase: 'ready' | 'set-active';
  onStartSet: () => void;
  onComplete: (weightKg: number | null, reps: number | null) => void;
}

export function SetLogger({ exercise, setNumber, phase, onStartSet, onComplete }: SetLoggerProps) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState(exercise.reps ? String(exercise.reps) : '');
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(exercise.durationSecs ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isTimeBased = exercise.durationSecs !== null;

  // Start timers when set becomes active
  useEffect(() => {
    if (phase !== 'set-active') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (isTimeBased) {
      setCountdown(exercise.durationSecs!);
      intervalRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            // auto-complete after a short tick so state update completes
            setTimeout(() => onComplete(null, null), 50);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } else {
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase]);

  const handleDone = () => {
    const weightKg = weight ? parseFloat(weight) : null;
    const repsNum = reps ? parseInt(reps) : null;
    onComplete(weightKg, repsNum);
  };

  const handleSkipCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onComplete(null, null);
  };

  // Ready state — show Start Set button
  if (phase === 'ready') {
    return (
      <div className="bg-surface rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-textPrimary">
          Set {setNumber} of {exercise.sets}
        </p>
        {isTimeBased && (
          <p className="text-center text-textMuted text-sm">{exercise.durationSecs}s</p>
        )}
        <Button variant="primary" fullWidth size="lg" onClick={onStartSet}>
          Start Set
        </Button>
      </div>
    );
  }

  // Active state — time-based: countdown
  if (isTimeBased) {
    const pct = exercise.durationSecs! > 0 ? (countdown / exercise.durationSecs!) * 100 : 0;
    return (
      <div className="bg-surface rounded-2xl p-4 space-y-4">
        <p className="text-sm font-semibold text-textPrimary text-center">
          Set {setNumber} of {exercise.sets}
        </p>
        <div className="flex flex-col items-center gap-2">
          <p className="text-5xl font-bold text-accent tabular-nums">{formatSeconds(countdown)}</p>
          <div className="w-full bg-surfaceHigh rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <Button variant="ghost" fullWidth onClick={handleSkipCountdown}>
          Skip
        </Button>
      </div>
    );
  }

  // Active state — rep-based: stopwatch + inputs
  return (
    <div className="bg-surface rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-textPrimary">
          Set {setNumber} of {exercise.sets}
        </p>
        <p className="text-sm font-mono text-accent">{formatSeconds(elapsed)}</p>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs text-textMuted">Weight (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-surfaceHigh text-textPrimary text-center text-lg font-bold border border-border focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs text-textMuted">Reps</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder={String(exercise.reps ?? 0)}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-surfaceHigh text-textPrimary text-center text-lg font-bold border border-border focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      <Button variant="primary" fullWidth size="lg" onClick={handleDone}>
        Done
      </Button>
    </div>
  );
}
