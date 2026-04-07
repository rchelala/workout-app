import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { startSession, completeSession } from '@/services/sessionService';
import { updateStreak } from '@/services/streakService';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { formatSeconds } from '@/utils/formatters';
import type { ExerciseLog, SetLog } from '@/types/workout';

interface LoggedExercise {
  id: string;
  name: string;
  sets: Array<{ reps: string; weightKg: string }>;
}

export function QuickLogPage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const timer = useWorkoutTimer();

  const defaultName = `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Workout`;
  const [workoutName, setWorkoutName] = useState(defaultName);
  const [exercises, setExercises] = useState<LoggedExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  // Add exercise form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');
  const [newExWeight, setNewExWeight] = useState('');

  const handleStart = () => {
    setStarted(true);
    timer.start();
  };

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    const setCount = parseInt(newExSets) || 1;
    const sets = Array.from({ length: setCount }, () => ({
      reps: newExReps,
      weightKg: newExWeight,
    }));
    setExercises((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newExName.trim(), sets },
    ]);
    setNewExName('');
    setNewExSets('3');
    setNewExReps('10');
    setNewExWeight('');
    setShowAddForm(false);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateSet = (exId: string, setIdx: number, field: 'reps' | 'weightKg', value: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exId
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, i) => (i === setIdx ? { ...s, [field]: value } : s)),
            }
      )
    );
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    timer.pause();

    try {
      const totalSets = exercises.reduce((s, e) => s + e.sets.length, 0);
      const sessionId = await startSession(user.uid, 'custom', workoutName || defaultName, totalSets);

      const exerciseLogs: ExerciseLog[] = exercises.map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: ex.sets.map((s, i): SetLog => ({
          setNumber: i + 1,
          weightKg: s.weightKg ? parseFloat(s.weightKg) : null,
          reps: s.reps ? parseInt(s.reps) : null,
          durationSecs: null,
          completedAt: new Date().toISOString(),
        })),
      }));

      await completeSession(sessionId, timer.elapsedSecs, totalSets, exerciseLogs);
      if (userProfile) await updateStreak(userProfile);
      navigate('/', { state: { toast: 'Workout saved!' } });
    } catch {
      setSaveError('Failed to save workout. Check your connection and try again.');
      timer.start();
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'bg-surfaceHigh border border-border rounded-lg px-3 py-2 text-textPrimary text-sm focus:outline-none focus:border-accent w-full';

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center px-4 h-14 gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-textMuted">
          <X size={22} />
        </button>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className="flex-1 bg-transparent text-textPrimary font-semibold text-base focus:outline-none"
          placeholder="Workout name"
        />
        {started && (
          <span className="text-sm font-mono text-accent">{formatSeconds(timer.elapsedSecs)}</span>
        )}
      </header>

      <div className="flex-1 px-4 pb-6 overflow-y-auto space-y-4">
        {/* Start banner */}
        {!started && (
          <div className="bg-surface rounded-2xl p-5 text-center space-y-3">
            <p className="text-textMuted text-sm">Add exercises and log your sets as you go.</p>
            <Button variant="primary" fullWidth size="lg" onClick={handleStart}>
              Start Workout
            </Button>
          </div>
        )}

        {/* Exercise list */}
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-surface rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-textPrimary">{ex.name}</p>
              <button
                onClick={() => handleRemoveExercise(ex.id)}
                className="p-1 text-textMuted hover:text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {/* Set rows */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs text-textMuted text-center">
                <span>Set</span><span>Weight (kg)</span><span>Reps</span>
              </div>
              {ex.sets.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-xs text-textMuted text-center">{i + 1}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={s.weightKg}
                    onChange={(e) => handleUpdateSet(ex.id, i, 'weightKg', e.target.value)}
                    className="h-9 text-center text-sm font-bold bg-surfaceHigh border border-border rounded-lg focus:outline-none focus:border-accent text-textPrimary"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={s.reps}
                    onChange={(e) => handleUpdateSet(ex.id, i, 'reps', e.target.value)}
                    className="h-9 text-center text-sm font-bold bg-surfaceHigh border border-border rounded-lg focus:outline-none focus:border-accent text-textPrimary"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add exercise form */}
        {showAddForm ? (
          <div className="bg-surface rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-textPrimary">Add Exercise</p>
            <input
              type="text"
              placeholder="Exercise name (e.g. Bench Press)"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              className={inputClass}
              autoFocus
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-textMuted">Sets</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newExSets}
                  onChange={(e) => setNewExSets(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-textMuted">Reps</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newExReps}
                  onChange={(e) => setNewExReps(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-textMuted">Weight (kg)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={newExWeight}
                  onChange={(e) => setNewExWeight(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" fullWidth onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button variant="primary" fullWidth onClick={handleAddExercise} disabled={!newExName.trim()}>
                Add
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-border text-textMuted hover:border-accent hover:text-accent transition-colors"
          >
            <Plus size={18} /> Add Exercise
          </button>
        )}

        {/* Save error */}
        {saveError && (
          <p className="text-xs text-danger text-center">{saveError}</p>
        )}

        {/* Finish button */}
        {started && exercises.length > 0 && (
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleFinish}
            loading={saving}
          >
            Finish Workout
          </Button>
        )}
      </div>
    </div>
  );
}
