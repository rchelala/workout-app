import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { completeOnboarding } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import type { Equipment, FitnessGoal, FitnessLevel, Gender } from '@/types/user';
import { Dumbbell, Package, Activity, User } from 'lucide-react';

const EQUIPMENT_OPTIONS: { value: Equipment; label: string; desc: string; icon: React.ElementType }[] = [
  { value: 'none',             label: 'No Equipment', desc: 'Bodyweight only',                    icon: User     },
  { value: 'dumbbells',        label: 'Dumbbells',    desc: 'Adjustable or fixed weights',        icon: Dumbbell },
  { value: 'resistance_bands', label: 'Bands',        desc: 'Resistance bands or tubes',          icon: Activity },
  { value: 'full_gym',         label: 'Full Gym',     desc: 'Machines, barbells, cables & more',  icon: Package  },
];

export function OnboardingEquipment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<Equipment[]>(['none']);
  const [loading, setLoading] = useState(false);

  const toggle = (eq: Equipment) => {
    setSelected((prev) =>
      prev.includes(eq)
        ? prev.filter((e) => e !== eq)
        : [...prev.filter((e) => e !== 'none'), eq].filter(Boolean) as Equipment[]
    );
  };

  const handleFinish = async () => {
    if (!user || !selected.length) return;
    setLoading(true);
    const gender = (sessionStorage.getItem('onboarding_gender') ?? 'male') as Gender;
    const goal = (sessionStorage.getItem('onboarding_goal') ?? 'stay_active') as FitnessGoal;
    const level = (sessionStorage.getItem('onboarding_level') ?? 'beginner') as FitnessLevel;
    await completeOnboarding(user.uid, gender, goal, level, selected.length ? selected : ['none']);
    sessionStorage.removeItem('onboarding_gender');
    sessionStorage.removeItem('onboarding_goal');
    sessionStorage.removeItem('onboarding_level');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 max-w-sm mx-auto">
      <div className="flex justify-end pt-4">
        <div className="flex gap-1">
          {[1,2,3,4].map((n) => (
            <div key={n} className="h-1 w-8 rounded-full bg-accent" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">What equipment do you have?</h1>
          <p className="text-textMuted text-sm mt-1">Select all that apply</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {EQUIPMENT_OPTIONS.map(({ value, label, desc, icon: Icon }) => {
            const active = selected.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                className={[
                  'rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2',
                  active ? 'border-accent bg-accent/10' : 'border-border bg-surface',
                ].join(' ')}
              >
                <Icon size={22} className={active ? 'text-accent' : 'text-textMuted'} />
                <div>
                  <p className={`text-sm font-semibold ${active ? 'text-accent' : 'text-textPrimary'}`}>{label}</p>
                  <p className="text-xs text-textMuted mt-0.5 leading-tight">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pb-8">
        <Button variant="primary" fullWidth size="lg" loading={loading} onClick={handleFinish}>
          Let's Go!
        </Button>
      </div>
    </div>
  );
}
