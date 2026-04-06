import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (v: 1 | 2 | 3 | 4 | 5) => void;
  readOnly?: boolean;
  size?: number;
}

export function StarRating({ value, onChange, readOnly = false, size = 28 }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}
        >
          <Star
            size={size}
            className={star <= value ? 'text-accent fill-accent' : 'text-border'}
          />
        </button>
      ))}
    </div>
  );
}
