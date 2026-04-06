import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ManualMacroData {
  mealDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface MacroManualFormProps {
  onSubmit: (data: ManualMacroData) => Promise<void>;
}

export function MacroManualForm({ onSubmit }: MacroManualFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ description: '', calories: '', protein: '', carbs: '', fat: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.calories) return;
    setLoading(true);
    await onSubmit({
      mealDescription: form.description || 'Manual entry',
      calories: parseFloat(form.calories),
      proteinG: parseFloat(form.protein) || 0,
      carbsG: parseFloat(form.carbs) || 0,
      fatG: parseFloat(form.fat) || 0,
    });
    setForm({ description: '', calories: '', protein: '', carbs: '', fat: '' });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Meal description" placeholder="e.g. Chicken rice bowl" value={form.description} onChange={set('description')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Calories (kcal)" type="number" inputMode="decimal" placeholder="500" value={form.calories} onChange={set('calories')} />
        <Input label="Protein (g)" type="number" inputMode="decimal" placeholder="30" value={form.protein} onChange={set('protein')} />
        <Input label="Carbs (g)" type="number" inputMode="decimal" placeholder="60" value={form.carbs} onChange={set('carbs')} />
        <Input label="Fat (g)" type="number" inputMode="decimal" placeholder="15" value={form.fat} onChange={set('fat')} />
      </div>
      <Button type="submit" variant="primary" fullWidth loading={loading}>Log Meal</Button>
    </form>
  );
}
