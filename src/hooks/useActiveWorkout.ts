import { useState, useCallback } from 'react';
import type { Exercise, ExerciseLog, SetLog } from '@/types/workout';

interface ActiveSet {
  exerciseIndex: number;
  setIndex: number;
}

interface ActiveWorkoutState {
  currentExerciseIndex: number;
  currentSetIndex: number;
  exerciseLogs: ExerciseLog[];
  isComplete: boolean;
  totalSetsCompleted: number;
  logSet: (weightKg: number | null, reps: number | null) => ActiveSet | null;
  skipExercise: () => void;
  getCurrentExercise: () => Exercise | null;
}

export function useActiveWorkout(exercises: Exercise[]): ActiveWorkoutState {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [totalSetsCompleted, setTotalSetsCompleted] = useState(0);

  const getCurrentExercise = useCallback((): Exercise | null => {
    return exercises[currentExerciseIndex] ?? null;
  }, [exercises, currentExerciseIndex]);

  const logSet = useCallback(
    (weightKg: number | null, reps: number | null): ActiveSet | null => {
      const exercise = exercises[currentExerciseIndex];
      if (!exercise) return null;

      const setLog: SetLog = {
        setNumber: currentSetIndex + 1,
        weightKg,
        reps,
        durationSecs: null,
        completedAt: new Date().toISOString(),
      };

      setExerciseLogs((prev) => {
        const updated = [...prev];
        const existing = updated.find((l) => l.exerciseId === exercise.exerciseId);
        if (existing) {
          existing.sets.push(setLog);
        } else {
          updated.push({ exerciseId: exercise.exerciseId, exerciseName: exercise.name, sets: [setLog] });
        }
        return updated;
      });

      setTotalSetsCompleted((n) => n + 1);

      const nextSetIndex = currentSetIndex + 1;
      if (nextSetIndex < exercise.sets) {
        setCurrentSetIndex(nextSetIndex);
        return { exerciseIndex: currentExerciseIndex, setIndex: nextSetIndex };
      } else {
        const nextExerciseIndex = currentExerciseIndex + 1;
        if (nextExerciseIndex < exercises.length) {
          setCurrentExerciseIndex(nextExerciseIndex);
          setCurrentSetIndex(0);
          return { exerciseIndex: nextExerciseIndex, setIndex: 0 };
        } else {
          setIsComplete(true);
          return null;
        }
      }
    },
    [exercises, currentExerciseIndex, currentSetIndex]
  );

  const skipExercise = useCallback(() => {
    const nextExerciseIndex = currentExerciseIndex + 1;
    if (nextExerciseIndex < exercises.length) {
      setCurrentExerciseIndex(nextExerciseIndex);
      setCurrentSetIndex(0);
    } else {
      setIsComplete(true);
    }
  }, [exercises, currentExerciseIndex]);

  return {
    currentExerciseIndex,
    currentSetIndex,
    exerciseLogs,
    isComplete,
    totalSetsCompleted,
    logSet,
    skipExercise,
    getCurrentExercise,
  };
}
