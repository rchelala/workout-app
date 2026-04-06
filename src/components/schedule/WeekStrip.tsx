import { useMemo } from 'react';

interface WeekStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  workoutDates: string[];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeekStrip({ selectedDate, onSelectDate, workoutDates }: WeekStripProps) {
  const days = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  return (
    <div className="flex gap-1">
      {days.map((date, i) => {
        const isSelected = date === selectedDate;
        const hasWorkout = workoutDates.includes(date);
        const dayNum = date.slice(8);
        return (
          <button
            key={date}
            onClick={() => onSelectDate(date)}
            className={[
              'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors',
              isSelected ? 'bg-accent' : 'bg-surface hover:bg-surfaceHigh',
            ].join(' ')}
          >
            <span className={`text-xs ${isSelected ? 'text-white' : 'text-textMuted'}`}>
              {DAY_LABELS[i]}
            </span>
            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-textPrimary'}`}>
              {dayNum}
            </span>
            {hasWorkout && (
              <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-accent'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
