type Size = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: Size;
  color?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};

export function Spinner({ size = 'md', color = 'border-accentGreen' }: SpinnerProps) {
  return (
    <div
      className={[
        'rounded-full border-transparent animate-spin',
        sizeClasses[size],
        color,
      ].join(' ')}
      style={{ borderTopColor: 'currentColor' }}
      role="status"
      aria-label="Loading"
    />
  );
}
