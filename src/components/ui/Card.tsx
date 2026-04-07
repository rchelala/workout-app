import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  clickable?: boolean;
}

export function Card({ padding = true, clickable = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-gradient-to-b from-[#2E2E2E] to-[#252525] rounded-2xl border border-white/[0.06] shadow-card',
        padding ? 'p-4' : '',
        clickable ? 'cursor-pointer hover:shadow-glow-accent hover:border-accent/50 transition-all duration-200' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
