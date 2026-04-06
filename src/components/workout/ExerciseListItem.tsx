import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Exercise } from '@/types/workout';

interface ExerciseListItemProps {
  exercise: Exercise;
  index: number;
}

export function ExerciseListItem({ exercise, index }: ExerciseListItemProps) {
  const [expanded, setExpanded] = useState(false);

  const detail = exercise.reps
    ? `${exercise.sets} × ${exercise.reps} reps`
    : `${exercise.sets} × ${exercise.durationSecs}s`;

  return (
    <div className="bg-surface rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Index circle */}
        <div className="w-8 h-8 rounded-full bg-surfaceHigh flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-textMuted">{index + 1}</span>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-textPrimary truncate">{exercise.name}</p>
          <p className="text-xs text-textMuted">{detail} · rest {exercise.restSecs}s</p>
        </div>
        <Badge label={exercise.muscleGroup} color="muted" size="sm" />
        {expanded ? <ChevronUp size={16} className="text-textMuted flex-shrink-0" /> : <ChevronDown size={16} className="text-textMuted flex-shrink-0" />}
      </button>
      {expanded && exercise.notes && (
        <div className="px-3 pb-3">
          <p className="text-xs text-textMuted bg-surfaceHigh rounded-lg p-2">{exercise.notes}</p>
        </div>
      )}
    </div>
  );
}
