import { useState, useEffect } from 'react';
import { LogOut, Minus, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/authService';
import { updateUserProfile } from '@/services/userService';
import { calculateMacroTargets } from '@/utils/tdeeCalculator';
import { useNavigate } from 'react-router-dom';
import type { FitnessGoal, FitnessLevel, Equipment, ActivityLevel } from '@/types/user';

const GOAL_LABELS: Record<FitnessGoal, string> = {
  lose_weight: 'Lose Weight', build_muscle: 'Build Muscle',
  improve_endurance: 'Improve Endurance', stay_active: 'Stay Active',
};
const LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
};
const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'No Equipment', dumbbells: 'Dumbbells',
  resistance_bands: 'Resistance Bands', full_gym: 'Full Gym',
};
const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
  { value: 'lightly_active', label: 'Lightly Active (1–3 days/wk)' },
  { value: 'moderately_active', label: 'Moderately Active (3–5 days/wk)' },
  { value: 'very_active', label: 'Very Active (6–7 days/wk)' },
  { value: 'super_active', label: 'Super Active (physical job)' },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(userProfile?.weeklyWorkoutGoal ?? 3);

  // Body stats (string state for number inputs)
  const [age, setAge] = useState(userProfile?.age?.toString() ?? '');
  const [heightCm, setHeightCm] = useState(userProfile?.heightCm?.toString() ?? '');
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg?.toString() ?? '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    userProfile?.activityLevel ?? null
  );

  // Macro target display — initialized from profile, updated after apply
  const [calTarget, setCalTarget] = useState(userProfile?.dailyCalorieTarget ?? 2000);
  const [proteinTarget, setProteinTarget] = useState(userProfile?.dailyProteinTarget ?? 150);
  const [carbsTarget, setCarbsTarget] = useState(userProfile?.dailyCarbsTarget ?? 200);
  const [fatTarget, setFatTarget] = useState(userProfile?.dailyFatTarget ?? 65);
  const [applying, setApplying] = useState(false);
  const [calculateError, setCalculateError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    setAge(userProfile.age?.toString() ?? '');
    setHeightCm(userProfile.heightCm?.toString() ?? '');
    setWeightKg(userProfile.weightKg?.toString() ?? '');
    setActivityLevel(userProfile.activityLevel ?? null);
    setCalTarget(userProfile.dailyCalorieTarget);
    setProteinTarget(userProfile.dailyProteinTarget);
    setCarbsTarget(userProfile.dailyCarbsTarget);
    setFatTarget(userProfile.dailyFatTarget);
  }, [userProfile?.uid]);

  const canCalculate =
    age !== '' && !isNaN(parseFloat(age)) &&
    heightCm !== '' && !isNaN(parseFloat(heightCm)) &&
    weightKg !== '' && !isNaN(parseFloat(weightKg)) &&
    activityLevel !== null &&
    !!userProfile;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/auth/login');
  };

  const adjustWeeklyGoal = async (delta: number) => {
    if (!user) return;
    const next = Math.min(7, Math.max(1, weeklyGoal + delta));
    setWeeklyGoal(next);
    await updateUserProfile(user.uid, { weeklyWorkoutGoal: next });
  };

  const saveBodyStat = async (field: 'age' | 'heightCm' | 'weightKg', raw: string) => {
    if (!user) return;
    const value = raw !== '' ? parseFloat(raw) : null;
    if (value !== null && isNaN(value)) return; // reject partial/invalid input
    await updateUserProfile(user.uid, { [field]: value });
  };

  const handleActivityChange = async (value: ActivityLevel | '') => {
    if (!user) return;
    const next = value === '' ? null : value;
    setActivityLevel(next);
    await updateUserProfile(user.uid, { activityLevel: next });
  };

  const handleCalculate = async () => {
    if (!user || !userProfile || !canCalculate) return;
    const parsedAge = parseFloat(age);
    const parsedHeight = parseFloat(heightCm);
    const parsedWeight = parseFloat(weightKg);

    if (
      parsedAge < 10 || parsedAge > 120 ||
      parsedHeight < 50 || parsedHeight > 280 ||
      parsedWeight < 20 || parsedWeight > 500
    ) {
      setCalculateError('Please enter valid body stats before calculating.');
      return;
    }

    const targets = calculateMacroTargets({
      age: parsedAge,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      activityLevel: activityLevel!,
      gender: userProfile.gender,
      goal: userProfile.goal,
    });
    setApplying(true);
    setCalculateError(null);
    try {
      await updateUserProfile(user.uid, targets);
      setCalTarget(targets.dailyCalorieTarget);
      setProteinTarget(targets.dailyProteinTarget);
      setCarbsTarget(targets.dailyCarbsTarget);
      setFatTarget(targets.dailyFatTarget);
    } catch {
      setCalculateError('Failed to save targets. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const stat = (label: string, value: string) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-textMuted">{label}</span>
      <span className="text-sm font-medium text-textPrimary">{value}</span>
    </div>
  );

  const inputClass =
    'w-full bg-surfaceHigh rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none';

  return (
    <AppShell title="Profile">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-2 py-6">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-3xl font-bold text-accent">
            {userProfile?.displayName?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <h2 className="text-xl font-bold text-textPrimary">{userProfile?.displayName}</h2>
        <p className="text-sm text-textMuted">{user?.email}</p>
      </div>

      {/* Streak */}
      <section className="bg-surface rounded-2xl px-4 mb-4">
        {stat('Current Streak', `${userProfile?.currentStreak ?? 0} days 🔥`)}
        {stat('Longest Streak', `${userProfile?.longestStreak ?? 0} days`)}
      </section>

      {/* Weekly Goal */}
      <section className="bg-surface rounded-2xl px-4 mb-4">
        <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider pt-3 pb-1">
          Workout Goal
        </h3>
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-textMuted">Weekly Workout Goal</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustWeeklyGoal(-1)}
              disabled={weeklyGoal <= 1}
              className="w-8 h-8 rounded-full bg-surfaceHigh flex items-center justify-center text-textPrimary disabled:text-textDisabled"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-semibold text-textPrimary w-16 text-center">
              {weeklyGoal} day{weeklyGoal !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => adjustWeeklyGoal(1)}
              disabled={weeklyGoal >= 7}
              className="w-8 h-8 rounded-full bg-surfaceHigh flex items-center justify-center text-textPrimary disabled:text-textDisabled"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Profile info */}
      <section className="bg-surface rounded-2xl px-4 mb-4">
        <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider pt-3 pb-1">
          Profile
        </h3>
        {stat('Goal', GOAL_LABELS[userProfile?.goal ?? 'stay_active'])}
        {stat('Fitness Level', LEVEL_LABELS[userProfile?.fitnessLevel ?? 'beginner'])}
        {stat(
          'Equipment',
          userProfile?.equipment.map((e) => EQUIPMENT_LABELS[e]).join(', ') ?? '—'
        )}
        {stat(
          'Gender',
          userProfile?.gender
            ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)
            : '—'
        )}
      </section>

      {/* Body Stats */}
      <section className="bg-surface rounded-2xl px-4 mb-4">
        <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider pt-3 pb-1">
          Body Stats
        </h3>
        <div className="grid grid-cols-2 gap-3 py-3">
          <div>
            <label className="text-xs text-textMuted block mb-1">Age (years)</label>
            <input
              type="number"
              min={10}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              onBlur={() => saveBodyStat('age', age)}
              className={inputClass}
              placeholder="—"
            />
          </div>
          <div>
            <label className="text-xs text-textMuted block mb-1">Height (cm)</label>
            <input
              type="number"
              min={100}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              onBlur={() => saveBodyStat('heightCm', heightCm)}
              className={inputClass}
              placeholder="—"
            />
          </div>
          <div>
            <label className="text-xs text-textMuted block mb-1">Weight (kg)</label>
            <input
              type="number"
              min={20}
              max={500}
              step={0.1}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              onBlur={() => saveBodyStat('weightKg', weightKg)}
              className={inputClass}
              placeholder="—"
            />
          </div>
          <div>
            <label className="text-xs text-textMuted block mb-1">Activity Level</label>
            <select
              value={activityLevel ?? ''}
              onChange={(e) => handleActivityChange(e.target.value as ActivityLevel | '')}
              className={inputClass}
            >
              <option value="">Select…</option>
              {ACTIVITY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Macro Targets */}
      <section className="bg-surface rounded-2xl px-4 mb-4">
        <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider pt-3 pb-1">
          Macro Targets
        </h3>
        <div className="grid grid-cols-2 gap-2 py-3">
          <div className="bg-surfaceHigh rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-accentGreen">{calTarget} kcal</p>
            <p className="text-xs text-textMuted">Calories</p>
          </div>
          <div className="bg-surfaceHigh rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-accent">{proteinTarget}g</p>
            <p className="text-xs text-textMuted">Protein</p>
          </div>
          <div className="bg-surfaceHigh rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-yellow-400">{carbsTarget}g</p>
            <p className="text-xs text-textMuted">Carbs</p>
          </div>
          <div className="bg-surfaceHigh rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{fatTarget}g</p>
            <p className="text-xs text-textMuted">Fat</p>
          </div>
        </div>
        <button
          onClick={handleCalculate}
          disabled={!canCalculate || applying}
          className="w-full bg-accentGreen text-background rounded-2xl h-14 font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed mb-3"
        >
          {applying
            ? 'Applying…'
            : canCalculate
              ? 'Calculate & Apply Targets'
              : 'Fill in Body Stats above to calculate'}
        </button>
        {calculateError && (
          <p className="text-xs text-danger mt-1">{calculateError}</p>
        )}
      </section>

      {/* Daily Targets (water only — calories/macros live in Macro Targets above) */}
      <section className="bg-surface rounded-2xl px-4 mb-4">
        <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider pt-3 pb-1">
          Daily Targets
        </h3>
        {stat('Water', `${userProfile?.dailyWaterGoal ?? 8} glasses`)}
      </section>

      {/* Sign out */}
      <Button variant="danger" fullWidth size="lg" loading={signingOut} onClick={handleSignOut}>
        <LogOut size={18} />
        Sign Out
      </Button>
      <div className="h-6" />
    </AppShell>
  );
}
