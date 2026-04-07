type BadgeColor = 'orange' | 'green' | 'muted' | 'blue';

interface BadgeProps {
  label: string;
  color?: BadgeColor;
  size?: 'sm' | 'md';
}

const colorClasses: Record<BadgeColor, string> = {
  orange: 'bg-accent/20 text-accent',
  green:  'bg-accentGreen/20 text-accentGreen',
  muted:  'bg-surfaceHigh text-textMuted',
  blue:   'bg-[rgba(99,179,237,0.15)] text-[#63B3ED]',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-3 py-1',
};

export function Badge({ label, color = 'muted', size = 'md' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-block rounded-full font-medium capitalize',
        colorClasses[color],
        sizeClasses[size],
      ].join(' ')}
    >
      {label}
    </span>
  );
}
