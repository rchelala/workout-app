import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { FitnessLevel } from '@/types/user';

const LEVELS: { value: FitnessLevel; label: string; desc: string }[] = [
  { value: 'beginner',     label: 'Beginner',     desc: 'New to working out or returning after a long break' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Working out regularly for 6+ months' },
  { value: 'advanced',     label: 'Advanced',     desc: 'Training consistently for 2+ years' },
];

export function OnboardingFitnessLevel() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<FitnessLevel | null>(null);

  const handleNext = () => {
    if (!selected) return;
    sessionStorage.setItem('onboarding_level', selected);
    navigate('/onboarding/step-4');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 max-w-sm mx-auto">
      <div className="flex justify-end pt-4">
        <div className="flex gap-1">
          {[1,2,3,4].map((n) => (
            <div key={n} className={`h-1 w-8 rounded-full ${n <= 3 ? 'bg-accent' : 'bg-border'}`} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">What's your fitness level?</h1>
          <p className="text-textMuted text-sm mt-1">This helps us set the right intensity</p>
        </div>
        <div className="flex flex-col gap-3">
          {LEVELS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={[
                'rounded-2xl border-2 p-4 text-left transition-all',
                selected === value ? 'border-accent bg-accent/10' : 'border-border bg-surface',
              ].join(' ')}
            >
              <p className={`font-semibold ${selected === value ? 'text-accent' : 'text-textPrimary'}`}>{label}</p>
              <p className="text-sm text-textMuted mt-0.5">{desc}</p>
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
