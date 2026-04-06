import { Clock, Dumbbell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { WorkoutPlan } from '@/types/workout';

interface WorkoutCardProps {
  plan: WorkoutPlan;
  onClick?: () => void;
}

const TYPE_COLORS = {
  strength:    'orange',
  hiit:        'danger',
  cardio:      'blue',
  flexibility: 'green',
} as const;

export function WorkoutCard({ plan, onClick }: WorkoutCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-surface rounded-2xl overflow-hidden cursor-pointer hover:ring-1 hover:ring-accent transition-all active:scale-95"
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-surfaceHigh flex items-center justify-center">
        {plan.thumbnailUrl ? (
          <img src={plan.thumbnailUrl} alt={plan.title} className="w-full h-full object-cover" />
        ) : (
          <Dumbbell size={40} className="text-border" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 flex gap-1.5">
          <Badge label={`${plan.durationMins} min`} color="orange" size="sm" />
          <Badge label={plan.workoutType} color={TYPE_COLORS[plan.workoutType] as 'orange'} size="sm" />
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-textPrimary line-clamp-2">{plan.title}</h3>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-textMuted flex items-center gap-1">
            <Clock size={11} /> {plan.totalExercises} exercises
          </span>
          {plan.genderFocus !== 'all' && (
            <Badge label={plan.genderFocus} color="muted" size="sm" />
          )}
        </div>
      </div>
    </div>
  );
}
