import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  current: number | null;
  previous: number | null;
  unit: string;
}

export function MetricCard({ label, current, previous, unit }: MetricCardProps) {
  const delta = current !== null && previous !== null ? current - previous : null;
  const deltaAbs = delta !== null ? Math.abs(delta) : null;

  return (
    <div className="bg-surface rounded-xl p-3 flex flex-col gap-1">
      <p className="text-xs text-textMuted">{label}</p>
      <p className="text-xl font-bold text-textPrimary">
        {current !== null ? `${current} ${unit}` : '—'}
      </p>
      {delta !== null && deltaAbs !== null && (
        <div className={`flex items-center gap-1 text-xs ${delta > 0 ? 'text-accent' : delta < 0 ? 'text-accentGreen' : 'text-textMuted'}`}>
          {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
          <span>{delta > 0 ? '+' : ''}{deltaAbs.toFixed(1)} {unit}</span>
        </div>
      )}
    </div>
  );
}
