import { DonutChart } from '@/components/ui/DonutChart';
import type { DailyMacroTotals } from '@/types/macro';
import type { UserProfile } from '@/types/user';

interface DailyMacroSummaryProps {
  totals: DailyMacroTotals;
  targets: Pick<UserProfile, 'dailyCalorieTarget' | 'dailyProteinTarget' | 'dailyCarbsTarget' | 'dailyFatTarget'>;
}

export function DailyMacroSummary({ totals, targets }: DailyMacroSummaryProps) {
  const segments = [
    { value: totals.proteinG, color: '#FF6B35', label: 'Protein' },
    { value: totals.carbsG,   color: '#00E676', label: 'Carbs' },
    { value: totals.fatG,     color: '#FFD600', label: 'Fat' },
  ];

  return (
    <div className="bg-gradient-to-b from-[#2E2E2E] to-[#252525] rounded-2xl p-4 border border-white/[0.06] shadow-card">
      <h3 className="text-sm font-semibold text-textPrimary mb-3">Today's Macros</h3>
      <div className="flex items-center gap-6">
        <DonutChart
          segments={segments}
          centerLabel={`${Math.round(totals.calories)}`}
          centerSublabel="kcal"
          size={120}
          strokeWidth={14}
        />
        <div className="flex-1 space-y-2">
          {[
            { label: 'Protein',  current: totals.proteinG,  target: targets.dailyProteinTarget,  unit: 'g',    color: 'bg-accent' },
            { label: 'Carbs',    current: totals.carbsG,    target: targets.dailyCarbsTarget,    unit: 'g',    color: 'bg-accentGreen' },
            { label: 'Fat',      current: totals.fatG,      target: targets.dailyFatTarget,      unit: 'g',    color: 'bg-[#FFD600]' },
            { label: 'Calories', current: totals.calories,  target: targets.dailyCalorieTarget,  unit: 'kcal', color: 'bg-accent' },
          ].map(({ label, current, target, unit, color }) => {
            const pct = Math.min((current / (target || 1)) * 100, 100);
            return (
              <div key={label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-textMuted">{label}</span>
                  <span className="text-textPrimary">{Math.round(current)}{unit} / {target}{unit}</span>
                </div>
                <div className="h-1.5 bg-surfaceHigh rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
