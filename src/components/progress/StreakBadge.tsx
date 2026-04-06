import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 rounded-full px-3 py-1.5">
      <Flame size={16} className="text-accent" />
      <span className="text-sm font-bold text-accent">{streak}</span>
      <span className="text-xs text-accent/80">day streak</span>
    </div>
  );
}
