import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Exercise } from '@/types/workout';

interface SetLoggerProps {
  exercise: Exercise;
  setNumber: number;
  onComplete: (weightKg: number | null, reps: number | null) => void;
}

export function SetLogger({ exercise, setNumber, onComplete }: SetLoggerProps) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState(exercise.reps ? String(exercise.reps) : '');

  const handleDone = () => {
    const weightKg = weight ? parseFloat(weight) : null;
    const repsNum = reps ? parseInt(reps) : null;
    onComplete(weightKg, repsNum);
  };

  const isTimeBased = exercise.durationSecs !== null;

  return (
    <div className="bg-surface rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-textPrimary">
        Set {setNumber} of {exercise.sets}
      </p>
      {isTimeBased ? (
        <p className="text-2xl font-bold text-accent text-center">{exercise.durationSecs}s</p>
      ) : (
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
      )}
      <Button variant="primary" fullWidth size="lg" onClick={handleDone}>
        Done
      </Button>
    </div>
  );
}
