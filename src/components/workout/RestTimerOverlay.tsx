import { ProgressRing } from '@/components/ui/ProgressRing';
import { Button } from '@/components/ui/Button';
import { formatSeconds } from '@/utils/formatters';

interface RestTimerOverlayProps {
  remaining: number;
  totalSecs: number;
  onSkip: () => void;
}

export function RestTimerOverlay({ remaining, totalSecs, onSkip }: RestTimerOverlayProps) {
  const pct = totalSecs > 0 ? ((totalSecs - remaining) / totalSecs) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6">
      <p className="text-textMuted text-sm font-medium uppercase tracking-widest">Rest Time</p>
      <ProgressRing
        percentage={pct}
        size={200}
        label={formatSeconds(remaining)}
        sublabel="remaining"
        color="#FF6B35"
      />
      <Button variant="secondary" onClick={onSkip}>
        Skip Rest
      </Button>
    </div>
  );
}
