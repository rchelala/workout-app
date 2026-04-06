import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-textMuted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full h-12 px-4 rounded-xl bg-surfaceHigh text-textPrimary text-sm',
          'border border-border focus:outline-none focus:border-accent',
          'placeholder:text-textDisabled transition-colors',
          error ? 'border-danger focus:border-danger' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
