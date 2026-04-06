interface Segment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: Segment[];
  centerLabel?: string;
  centerSublabel?: string;
  size?: number;
  strokeWidth?: number;
}

export function DonutChart({
  segments,
  centerLabel,
  centerSublabel,
  size = 160,
  strokeWidth = 18,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const arc = { ...seg, dashArray: `${dash} ${gap}`, dashOffset: -offset * circumference / (total || 1) };
    offset += seg.value;
    return arc;
  });

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#3A3A3A" strokeWidth={strokeWidth} />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
          />
        ))}
      </svg>
      {(centerLabel || centerSublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && <span className="text-xl font-bold text-textPrimary">{centerLabel}</span>}
          {centerSublabel && <span className="text-xs text-textMuted">{centerSublabel}</span>}
        </div>
      )}
    </div>
  );
}
