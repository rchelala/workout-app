interface BarData {
  label: string;
  value: number | null;
  unit?: string;
  active?: boolean;
}

interface BarChartProps {
  data: BarData[];
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value ?? 0), 1);

  return (
    <div className="flex items-end gap-2 h-40 w-full px-2">
      {data.map((item, i) => {
        const height = item.value !== null ? Math.max((item.value / max) * 100, 8) : 8;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {item.value !== null && (
              <span className={`text-xs font-semibold ${item.active ? 'text-accent' : 'text-textMuted'}`}>
                {item.active ? '↑ ' : ''}{item.value}
              </span>
            )}
            <div className="w-full flex items-end" style={{ height: '120px' }}>
              <div
                className={`w-full rounded-t-lg transition-all duration-500 ${item.active ? 'bg-gradient-to-t from-accent/80 to-accent shadow-[0_-4px_12px_rgba(255,107,53,0.4)]' : 'bg-surfaceHigh'}`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-xs text-textMuted">{item.unit ?? ''}</span>
            <span className="text-xs text-textMuted truncate w-full text-center">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
