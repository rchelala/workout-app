import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  clickable?: boolean;
}

export function Card({ padding = true, clickable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-surface rounded-2xl',
        padding ? 'p-4' : '',
        clickable ? 'cursor-pointer hover:border hover:border-accent transition-colors' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
