import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { MealAnalysisResult } from '@/types/macro';

interface MacroResultCardProps {
  result: MealAnalysisResult;
  onSave: (edited: MealAnalysisResult) => void;
  onDiscard: () => void;
  saving?: boolean;
}

export function MacroResultCard({ result, onSave, onDiscard, saving }: MacroResultCardProps) {
  const [description, setDescription] = useState(result.meal_description);
  const [calories, setCalories] = useState(String(Math.round(result.calories)));
  const [protein, setProtein] = useState(String(Math.round(result.protein_g)));
  const [carbs, setCarbs] = useState(String(Math.round(result.carbs_g)));
  const [fat, setFat] = useState(String(Math.round(result.fat_g)));

  const handleSave = () => {
    onSave({
      meal_description: description || result.meal_description,
      calories: parseFloat(calories) || 0,
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
    });
  };

  const inputClass =
    'w-full bg-background border border-border rounded-lg px-2 py-1 text-center text-lg font-bold text-accent focus:outline-none focus:border-accent';

  return (
    <div className="bg-surface rounded-2xl p-4 space-y-4">
      <p className="text-xs text-textMuted">AI estimate — tap any value to edit</p>

      {/* Description */}
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-semibold text-textPrimary focus:outline-none focus:border-accent"
        placeholder="Meal description"
      />

      {/* Macro values — all editable */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Calories', unit: 'kcal', value: calories, set: setCalories },
          { label: 'Protein', unit: 'g', value: protein, set: setProtein },
          { label: 'Carbs', unit: 'g', value: carbs, set: setCarbs },
          { label: 'Fat', unit: 'g', value: fat, set: setFat },
        ].map(({ label, unit, value, set }) => (
          <div key={label} className="bg-surfaceHigh rounded-xl p-2 text-center">
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => set(e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-textMuted mt-1">{unit}</p>
            <p className="text-xs text-textDisabled">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" fullWidth onClick={onDiscard}>Discard</Button>
        <Button variant="primary" fullWidth onClick={handleSave} loading={saving}>Save Meal</Button>
      </div>
    </div>
  );
}
