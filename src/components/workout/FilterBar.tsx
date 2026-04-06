import type { WorkoutFilters, WorkoutType } from '@/types/workout';
import type { Equipment } from '@/types/user';
import { DURATION_OPTIONS, TYPE_OPTIONS, EQUIPMENT_OPTIONS, EQUIPMENT_LABELS, TYPE_LABELS } from '@/utils/workoutFilters';

interface FilterBarProps {
  filters: WorkoutFilters;
  onChange: (f: WorkoutFilters) => void;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
        active ? 'bg-accent text-white' : 'bg-surfaceHigh text-textMuted hover:text-textPrimary',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggle = <K extends keyof WorkoutFilters>(key: K, value: WorkoutFilters[K]) => {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      {/* Duration */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {DURATION_OPTIONS.map((d) => (
          <Chip key={d} label={`${d} min`} active={filters.duration === d} onClick={() => toggle('duration', d)} />
        ))}
      </div>
      {/* Type */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TYPE_OPTIONS.map((t) => (
          <Chip key={t} label={TYPE_LABELS[t]} active={filters.type === t} onClick={() => toggle('type', t as WorkoutType)} />
        ))}
      </div>
      {/* Equipment */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {EQUIPMENT_OPTIONS.map((e) => (
          <Chip key={e} label={EQUIPMENT_LABELS[e]} active={filters.equipment === e} onClick={() => toggle('equipment', e as Equipment)} />
        ))}
      </div>
    </div>
  );
}
