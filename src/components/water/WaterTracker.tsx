import { Droplets, Plus, Minus } from 'lucide-react';

interface WaterTrackerProps {
  glasses: number;
  goal: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function WaterTracker({ glasses, goal, onIncrement, onDecrement }: WaterTrackerProps) {
  return (
    <div className="bg-surface rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-400" />
          <span className="text-sm font-semibold text-textPrimary">Water Intake</span>
        </div>
        <span className="text-sm text-textMuted">{glasses} / {goal} glasses</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: goal }, (_, i) => (
          <div
            key={i}
            className={`flex-1 h-3 rounded-full transition-colors ${i < glasses ? 'bg-blue-400' : 'bg-surfaceHigh'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onDecrement}
          disabled={glasses <= 0}
          className="w-10 h-10 rounded-full bg-surfaceHigh flex items-center justify-center text-textMuted hover:text-textPrimary disabled:opacity-40 transition-colors"
        >
          <Minus size={18} />
        </button>
        <span className="text-2xl font-bold text-textPrimary w-12 text-center">{glasses}</span>
        <button
          onClick={onIncrement}
          disabled={glasses >= goal}
          className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400 hover:bg-blue-400/30 disabled:opacity-40 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
