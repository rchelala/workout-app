import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { formatSeconds } from '@/utils/formatters';

interface WorkoutCompleteModalProps {
  isOpen: boolean;
  durationSecs: number;
  setsCompleted: number;
  planTitle: string;
  onRate: (rating: 1 | 2 | 3 | 4 | 5) => void;
  onClose: () => void;
}

export function WorkoutCompleteModal({
  isOpen,
  durationSecs,
  setsCompleted,
  planTitle,
  onRate,
  onClose,
}: WorkoutCompleteModalProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workout Complete!">
      <div className="flex flex-col items-center gap-4 py-2">
        <CheckCircle size={56} className="text-accentGreen" />
        <p className="text-textPrimary font-semibold text-lg text-center">{planTitle}</p>
        <div className="flex gap-6 w-full">
          <div className="flex-1 bg-surfaceHigh rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-textPrimary">{formatSeconds(durationSecs)}</p>
            <p className="text-xs text-textMuted mt-0.5">Duration</p>
          </div>
          <div className="flex-1 bg-surfaceHigh rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-textPrimary">{setsCompleted}</p>
            <p className="text-xs text-textMuted mt-0.5">Sets Done</p>
          </div>
        </div>
        <p className="text-sm text-textMuted">How hard was this workout?</p>
        <StarRating value={rating} onChange={setRating} />
        <Button variant="primary" fullWidth size="lg" onClick={() => onRate(rating)}>
          Save Workout
        </Button>
      </div>
    </Modal>
  );
}
