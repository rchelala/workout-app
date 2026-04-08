import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { todayISO } from '@/utils/formatters';

interface MacroCalendarProps {
  selectedDate: string;
  datesWithEntries: Set<string>;
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function MacroCalendar({ selectedDate, datesWithEntries, onSelectDate }: MacroCalendarProps) {
  const today = todayISO();
  const [year, setYear] = useState(() => parseInt(selectedDate.slice(0, 4)));
  const [month, setMonth] = useState(() => parseInt(selectedDate.slice(5, 7)) - 1);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const todayDate = new Date();
    if (year > todayDate.getFullYear() || (year === todayDate.getFullYear() && month >= todayDate.getMonth())) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const isNextDisabled = (() => {
    const todayDate = new Date();
    return year > todayDate.getFullYear() || (year === todayDate.getFullYear() && month >= todayDate.getMonth());
  })();

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-surface rounded-xl p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 text-textMuted hover:text-textPrimary transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-textPrimary">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          disabled={isNextDisabled}
          className="p-1 text-textMuted hover:text-textPrimary transition-colors disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs text-textMuted py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }
          const iso = toISO(year, month, day);
          const isToday = iso === today;
          const isSelected = iso === selectedDate;
          const isFuture = iso > today;
          const hasEntry = datesWithEntries.has(iso);

          return (
            <button
              key={iso}
              onClick={() => !isFuture && onSelectDate(iso)}
              disabled={isFuture}
              className={[
                'flex flex-col items-center justify-center h-9 w-full rounded-lg text-xs font-medium transition-colors relative',
                isFuture ? 'opacity-30 cursor-default' : 'cursor-pointer',
                isSelected && !isToday ? 'ring-1 ring-accentGreen text-textPrimary' : '',
                isToday && isSelected ? 'bg-accent text-white ring-1 ring-accentGreen' : '',
                isToday && !isSelected ? 'bg-accent text-white' : '',
                !isToday && !isSelected ? 'text-textPrimary hover:bg-surfaceHigh' : '',
              ].join(' ')}
            >
              {day}
              {hasEntry && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-accentGreen'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
