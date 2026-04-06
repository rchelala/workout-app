import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Target, Flame, Heart, Zap } from 'lucide-react';
import type { FitnessGoal } from '@/types/user';

const GOALS: { value: FitnessGoal; label: string; desc: string; icon: React.ElementType }[] = [
  { value: 'lose_weight',       label: 'Lose Weight',       desc: 'Burn fat & get lean',         icon: Flame    },
  { value: 'build_muscle',      label: 'Build Muscle',      desc: 'Strength & hypertrophy',      icon: Zap      },
  { value: 'improve_endurance', label: 'Endurance',         desc: 'Cardio & stamina',            icon: Heart    },
  { value: 'stay_active',       label: 'Stay Active',       desc: 'General health & wellbeing',  icon: Target   },
];

export function OnboardingGoal() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<FitnessGoal | null>(null);

  const handleNext = () => {
    if (!selected) return;
    sessionStorage.setItem('onboarding_goal', selected);
    navigate('/onboarding/step-3');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 max-w-sm mx-auto">
      <div className="flex justify-end pt-4">
        <div className="flex gap-1">
          {[1,2,3,4].map((n) => (
            <div key={n} className={`h-1 w-8 rounded-full ${n <= 2 ? 'bg-accent' : 'bg-border'}`} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">What is your primary goal?</h1>
          <p className="text-textMuted text-sm mt-1">We'll tailor your plan around this</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={[
                'h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all p-3',
                selected === value ? 'border-accent bg-accent/10' : 'border-border bg-surface',
              ].join(' ')}
            >
              <Icon size={24} className={selected === value ? 'text-accent' : 'text-textMuted'} />
              <span className={`text-sm font-semibold ${selected === value ? 'text-accent' : 'text-textPrimary'}`}>{label}</span>
              <span className="text-xs text-textMuted text-center leading-tight">{desc}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="pb-8">
        <Button variant="primary" fullWidth size="lg" disabled={!selected} onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
