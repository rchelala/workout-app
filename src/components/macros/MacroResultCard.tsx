import { Button } from '@/components/ui/Button';
import type { MealAnalysisResult } from '@/types/macro';

interface MacroResultCardProps {
  result: MealAnalysisResult;
  onSave: () => void;
  onDiscard: () => void;
  saving?: boolean;
}

export function MacroResultCard({ result, onSave, onDiscard, saving }: MacroResultCardProps) {
  return (
    <div className="bg-surface rounded-2xl p-4 space-y-4">
      <p className="text-sm font-semibold text-textPrimary capitalize">{result.meal_description}</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Calories', value: `${Math.round(result.calories)}`, unit: 'kcal' },
          { label: 'Protein', value: `${Math.round(result.protein_g)}`, unit: 'g' },
          { label: 'Carbs', value: `${Math.round(result.carbs_g)}`, unit: 'g' },
          { label: 'Fat', value: `${Math.round(result.fat_g)}`, unit: 'g' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-surfaceHigh rounded-xl p-2 text-center">
            <p className="text-lg font-bold text-accent">{value}</p>
            <p className="text-xs text-textMuted">{unit}</p>
            <p className="text-xs text-textDisabled">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" fullWidth onClick={onDiscard}>Discard</Button>
        <Button variant="primary" fullWidth onClick={onSave} loading={saving}>Save Meal</Button>
      </div>
    </div>
  );
}
