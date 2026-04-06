import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import type { FitnessGoal, FitnessLevel, Equipment } from '@/types/user';

const GOAL_LABELS: Record<FitnessGoal, string> = {
  lose_weight: 'Lose Weight', build_muscle: 'Build Muscle',
  improve_endurance: 'Improve Endurance', stay_active: 'Stay Active',
};
const LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
};
const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'No Equipment', dumbbells: 'Dumbbells', resistance_bands: 'Resistance Bands', full_gym: 'Full Gym',
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate('/auth/login');
  };

  const stat = (label: string, value: string) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-textMuted">{label}</span>
      <span className="text-sm font-medium text-textPrimary">{value}</span>
    </div>
  );

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

      {/* Stats */}
      <section className="bg-surface rounded-2xl px-4 mb-4">
        {stat('Current Streak', `${userProfile?.currentStreak ?? 0} days 🔥`)}
        {stat('Longest Streak', `${userProfile?.longestStreak ?? 0} days`)}
      </section>

      {/* Settings */}
      <section className="bg-surface rounded-2xl px-4 mb-4">
        <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider pt-3 pb-1">Profile</h3>
        {stat('Goal', GOAL_LABELS[userProfile?.goal ?? 'stay_active'])}
        {stat('Fitness Level', LEVEL_LABELS[userProfile?.fitnessLevel ?? 'beginner'])}
        {stat('Equipment', userProfile?.equipment.map((e) => EQUIPMENT_LABELS[e]).join(', ') ?? '—')}
        {stat('Gender', userProfile?.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : '—')}
      </section>

      <section className="bg-surface rounded-2xl px-4 mb-4">
        <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider pt-3 pb-1">Daily Targets</h3>
        {stat('Calories', `${userProfile?.dailyCalorieTarget ?? 2000} kcal`)}
        {stat('Protein', `${userProfile?.dailyProteinTarget ?? 150}g`)}
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
