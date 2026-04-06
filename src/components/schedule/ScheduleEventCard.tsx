import { Calendar, Trash2, CheckCircle } from 'lucide-react';
import type { ScheduledWorkout } from '@/types/schedule';
import { isoToDisplay } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';

interface ScheduleEventCardProps {
  event: ScheduledWorkout;
  onDelete: (id: string) => void;
  onStart: (planId: string) => void;
}

export function ScheduleEventCard({ event, onDelete, onStart }: ScheduleEventCardProps) {
  return (
    <div className="bg-surface rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
        {event.completed
          ? <CheckCircle size={20} className="text-accentGreen" />
          : <Calendar size={20} className="text-accent" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-textPrimary truncate">{event.planTitle}</p>
        <p className="text-xs text-textMuted">
          {isoToDisplay(event.scheduledDate)}
          {event.scheduledTime ? ` · ${event.scheduledTime}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!event.completed && (
          <Button size="sm" variant="primary" onClick={() => onStart(event.planId)}>
            Start
          </Button>
        )}
        <button
          onClick={() => onDelete(event.scheduleId)}
          className="p-2 rounded-full text-textMuted hover:text-danger transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
