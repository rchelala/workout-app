import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import {
  saveCustomPlan,
  updateCustomPlan,
  getPlanById,
  getExercisesForPlan,
} from '@/services/workoutService';
import type { WorkoutType, MuscleGroup } from '@/types/workout';

interface ExerciseForm {
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: number | null;
  durationSecs: number | null;
  restSecs: number;
  isSuperset: boolean;
  supersetWith: string | null;
  secondaryMuscles: MuscleGroup[];
  notes: string;
  sortOrder: number;
}

const WORKOUT_TYPES: WorkoutType[] = ['strength', 'hiit', 'cardio', 'flexibility'];
const DURATIONS: (15 | 30 | 45 | 60)[] = [15, 30, 45, 60];
const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body',
];

const TYPE_LABELS: Record<WorkoutType, string> = {
  strength: 'Strength',
  hiit: 'HIIT',
  cardio: 'Cardio',
  flexibility: 'Flexibility',
};

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  shoulders: 'Shoulders',
  arms: 'Arms',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Full Body',
};

const EMPTY_EXERCISE_FORM: Omit<ExerciseForm, 'sortOrder'> = {
  name: '',
  muscleGroup: 'chest',
  sets: 3,
  reps: 10,
  durationSecs: null,
  restSecs: 60,
  isSuperset: false,
  supersetWith: null,
  secondaryMuscles: [],
  notes: '',
};

export function CustomWorkoutBuilderPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const isEditMode = Boolean(planId);

  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Plan meta
  const [title, setTitle] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutType>('strength');
  const [durationMins, setDurationMins] = useState<15 | 30 | 45 | 60>(30);

  // Exercise list
  const [exercises, setExercises] = useState<ExerciseForm[]>([]);

  // Add-exercise form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<Omit<ExerciseForm, 'sortOrder'>>(EMPTY_EXERCISE_FORM);
  const [timeMode, setTimeMode] = useState(false);

  // Validation errors
  const [titleError, setTitleError] = useState('');
  const [listError, setListError] = useState('');

  // Load existing plan in edit mode
  useEffect(() => {
    if (!planId) return;
    Promise.all([getPlanById(planId), getExercisesForPlan(planId)]).then(([plan, exs]) => {
      if (plan) {
        setTitle(plan.title);
        setWorkoutType(plan.workoutType);
        setDurationMins(plan.durationMins);
      }
      setExercises(
        exs.map((ex) => ({
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          reps: ex.reps,
          durationSecs: ex.durationSecs,
          restSecs: ex.restSecs,
          isSuperset: ex.isSuperset,
          supersetWith: ex.supersetWith,
          secondaryMuscles: ex.secondaryMuscles,
          notes: ex.notes,
          sortOrder: ex.sortOrder,
        }))
      );
      setPageLoading(false);
    });
  }, [planId]);

  const handleDeleteExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, sortOrder: i })));
  };

  const handleAddExercise = () => {
    if (!addForm.name.trim()) return;
    const newEx: ExerciseForm = {
      ...addForm,
      name: addForm.name.trim(),
      reps: timeMode ? null : (addForm.reps ?? 10),
      durationSecs: timeMode ? (addForm.durationSecs ?? 30) : null,
      sortOrder: exercises.length,
    };
    setExercises((prev) => [...prev, newEx]);
    setAddForm(EMPTY_EXERCISE_FORM);
    setTimeMode(false);
    setShowAddForm(false);
    setListError('');
  };

  const handleCancelAdd = () => {
    setAddForm(EMPTY_EXERCISE_FORM);
    setTimeMode(false);
    setShowAddForm(false);
  };

  const handleSave = async () => {
    let valid = true;
    if (!title.trim()) { setTitleError('Workout name is required.'); valid = false; }
    else setTitleError('');
    if (exercises.length === 0) { setListError('Add at least one exercise.'); valid = false; }
    else setListError('');
    if (!valid || !user) return;

    setSaving(true);
    try {
      if (isEditMode && planId) {
        await updateCustomPlan(planId, { title: title.trim(), workoutType, durationMins }, exercises);
      } else {
        await saveCustomPlan(user.uid, { title: title.trim(), workoutType, durationMins }, exercises);
      }
      navigate('/plans');
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AppShell
      title={isEditMode ? 'Edit Workout' : 'Build Workout'}
      showBack
    >
      <div className="pt-2 pb-6 space-y-6">

        {/* Workout name */}
        <div>
          <Input
            label="Workout Name"
            placeholder="e.g. Monday Push Day"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(''); }}
            error={titleError}
          />
        </div>

        {/* Workout type */}
        <div>
          <p className="text-sm font-medium text-textMuted mb-2">Workout Type</p>
          <div className="grid grid-cols-2 gap-2">
            {WORKOUT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setWorkoutType(type)}
                className={[
                  'py-3 rounded-xl text-sm font-semibold transition-colors',
                  workoutType === type
                    ? 'bg-accent text-white'
                    : 'bg-surfaceHigh text-textMuted hover:text-textPrimary',
                ].join(' ')}
              >
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <p className="text-sm font-medium text-textMuted mb-2">Duration</p>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDurationMins(d)}
                className={[
                  'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                  durationMins === d
                    ? 'bg-accent text-white'
                    : 'bg-surfaceHigh text-textMuted hover:text-textPrimary',
                ].join(' ')}
              >
                {d}m
              </button>
            ))}
          </div>
        </div>

        {/* Exercise list */}
        <div>
          <p className="text-sm font-medium text-textMuted mb-2">Exercises</p>
          {listError && <p className="text-xs text-danger mb-2">{listError}</p>}

          {exercises.length === 0 && !showAddForm && (
            <p className="text-textDisabled text-sm text-center py-6 bg-surface rounded-xl">
              No exercises yet. Tap "Add Exercise" below.
            </p>
          )}

          <div className="space-y-2">
            {exercises.map((ex, index) => (
              <div key={index} className="bg-surface rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-textDisabled text-sm font-semibold w-5 shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-textPrimary truncate">{ex.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                      {MUSCLE_LABELS[ex.muscleGroup]}
                    </span>
                    <span className="text-xs text-textMuted">
                      {ex.sets} ×{' '}
                      {ex.durationSecs !== null ? `${ex.durationSecs}s` : `${ex.reps ?? 0} reps`}
                    </span>
                    <span className="text-xs text-textDisabled">rest {ex.restSecs}s</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteExercise(index)}
                  className="p-1.5 rounded-lg text-textDisabled hover:text-danger transition-colors shrink-0"
                  aria-label="Delete exercise"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Inline add form */}
          {showAddForm ? (
            <div className="bg-surface rounded-xl p-4 mt-3 space-y-3">
              <p className="text-sm font-semibold text-textPrimary">New Exercise</p>

              <Input
                label="Exercise Name"
                placeholder="e.g. Bench Press"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />

              {/* Muscle group */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-textMuted">Muscle Group</label>
                <select
                  value={addForm.muscleGroup}
                  onChange={(e) => setAddForm((f) => ({ ...f, muscleGroup: e.target.value as MuscleGroup }))}
                  className="w-full h-12 px-4 rounded-xl bg-surfaceHigh text-textPrimary text-sm border border-border focus:outline-none focus:border-accent"
                >
                  {MUSCLE_GROUPS.map((mg) => (
                    <option key={mg} value={mg}>{MUSCLE_LABELS[mg]}</option>
                  ))}
                </select>
              </div>

              {/* Sets */}
              <Input
                label="Sets"
                type="number"
                min={1}
                value={addForm.sets}
                onChange={(e) => setAddForm((f) => ({ ...f, sets: Math.max(1, Number(e.target.value)) }))}
              />

              {/* Reps vs Time toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-textMuted">Tracking</label>
                <div className="flex bg-surfaceHigh rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setTimeMode(false)}
                    className={[
                      'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
                      !timeMode ? 'bg-accent text-white' : 'text-textMuted',
                    ].join(' ')}
                  >
                    Reps
                  </button>
                  <button
                    onClick={() => setTimeMode(true)}
                    className={[
                      'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
                      timeMode ? 'bg-accent text-white' : 'text-textMuted',
                    ].join(' ')}
                  >
                    Time
                  </button>
                </div>
              </div>

              {timeMode ? (
                <Input
                  label="Duration (seconds)"
                  type="number"
                  min={1}
                  value={addForm.durationSecs ?? 30}
                  onChange={(e) => setAddForm((f) => ({ ...f, durationSecs: Math.max(1, Number(e.target.value)), reps: null }))}
                />
              ) : (
                <Input
                  label="Reps"
                  type="number"
                  min={1}
                  value={addForm.reps ?? 10}
                  onChange={(e) => setAddForm((f) => ({ ...f, reps: Math.max(1, Number(e.target.value)), durationSecs: null }))}
                />
              )}

              <Input
                label="Rest (seconds)"
                type="number"
                min={0}
                value={addForm.restSecs}
                onChange={(e) => setAddForm((f) => ({ ...f, restSecs: Math.max(0, Number(e.target.value)) }))}
              />

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancelAdd}
                  className="flex-1 h-11 rounded-xl bg-surfaceHigh text-textPrimary text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExercise}
                  disabled={!addForm.name.trim()}
                  className="flex-1 h-11 rounded-xl bg-accentGreen text-background text-sm font-semibold disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mt-3 h-11 rounded-xl bg-surfaceHigh text-textMuted text-sm font-semibold flex items-center justify-center gap-2 hover:text-textPrimary transition-colors"
            >
              <Plus size={16} />
              Add Exercise
            </button>
          )}
        </div>

        {/* Save CTA */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accentGreen text-background rounded-2xl h-14 w-full font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Spinner size="sm" color="border-background" /> : null}
          {saving ? 'Saving…' : isEditMode ? 'Update Workout' : 'Save Workout'}
        </button>
      </div>
    </AppShell>
  );
}
