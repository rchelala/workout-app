import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { Gender } from '@/types/user';

export function OnboardingGender() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Gender | null>(null);

  const handleNext = () => {
    if (!selected) return;
    sessionStorage.setItem('onboarding_gender', selected);
    navigate('/onboarding/step-2');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 max-w-sm mx-auto">
      <div className="flex justify-end pt-4">
        <div className="flex gap-1">
          {[1,2,3,4].map((n) => (
            <div key={n} className={`h-1 w-8 rounded-full ${n === 1 ? 'bg-accent' : 'bg-border'}`} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">What is your biological sex?</h1>
          <p className="text-textMuted text-sm mt-1">Used to personalise your workout recommendations</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelected(g)}
              className={[
                'h-32 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all capitalize font-semibold text-lg',
                selected === g ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-textMuted',
              ].join(' ')}
            >
              <span className="text-4xl">{g === 'male' ? '♂' : '♀'}</span>
              {g}
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
