interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export function LineChart({ data, color = '#FF6B35', height = 120 }: LineChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-24 text-textMuted text-sm">
        Not enough data to display chart
      </div>
    );
  }

  const width = 300;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerW;
    const y = padding.top + innerH - ((d.value - minV) / range) * innerH;
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;
  const gradientId = `line-fill-${color.replace('#', '')}`;
  const glowId = `line-glow-${color.replace('#', '')}`;
  const gridY = [0.25, 0.5, 0.75].map((f) => padding.top + innerH * (1 - f));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {gridY.map((y, i) => (
        <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#3A3A3A" strokeOpacity="0.5" strokeWidth="1" />
      ))}

      {/* Y axis labels */}
      <text x={padding.left - 4} y={padding.top + 4} textAnchor="end" fontSize="9" fill="#9E9E9E">{Math.round(maxV)}</text>
      <text x={padding.left - 4} y={padding.top + innerH + 4} textAnchor="end" fontSize="9" fill="#9E9E9E">{Math.round(minV)}</text>

      {/* Area fill */}
      <path d={areaD} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${glowId})`} />

      {/* Hollow dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" stroke={color} strokeWidth="2" fill="#1A1A1A" />
      ))}

      {/* X axis labels — first and last */}
      <text x={points[0].x} y={height - 2} textAnchor="middle" fontSize="9" fill="#9E9E9E">
        {points[0].date.slice(5)}
      </text>
      <text x={points[points.length - 1].x} y={height - 2} textAnchor="middle" fontSize="9" fill="#9E9E9E">
        {points[points.length - 1].date.slice(5)}
      </text>
    </svg>
  );
}
