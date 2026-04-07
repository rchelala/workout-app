import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { BodyMetric } from '@/types/progress';
import type { Gender } from '@/types/user';
import { todayISO } from '@/utils/formatters';
import { calculateNavyBodyFat } from '@/utils/bodyFatCalculator';

type MetricField = Omit<BodyMetric, 'metricId' | 'userId' | 'loggedAt'>;

interface MeasurementFormProps {
  gender: Gender;
  onSubmit: (data: MetricField) => Promise<void>;
}

export function MeasurementForm({ gender, onSubmit }: MeasurementFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(),
    weightKg: '',
    heightCm: '',
    neckCm: '',
    bicepsCm: '',
    chestCm: '',
    waistCm: '',
    hipsCm: '',
    thighsCm: '',
    bodyFatPercent: '',
    notes: '',
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const estimatedBodyFat = useMemo(() => {
    const waist = parseFloat(form.waistCm);
    const neck = parseFloat(form.neckCm);
    const height = parseFloat(form.heightCm);
    const hips = parseFloat(form.hipsCm);
    if (!waist || !neck || !height) return null;
    return calculateNavyBodyFat(gender, waist, neck, height, hips || null);
  }, [gender, form.waistCm, form.neckCm, form.heightCm, form.hipsCm]);

  const applyEstimate = () => {
    if (estimatedBodyFat !== null) {
      setForm((f) => ({ ...f, bodyFatPercent: String(estimatedBodyFat) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      date: form.date,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
      neckCm: form.neckCm ? parseFloat(form.neckCm) : null,
      bicepsCm: form.bicepsCm ? parseFloat(form.bicepsCm) : null,
      chestCm: form.chestCm ? parseFloat(form.chestCm) : null,
      waistCm: form.waistCm ? parseFloat(form.waistCm) : null,
      hipsCm: form.hipsCm ? parseFloat(form.hipsCm) : null,
      thighsCm: form.thighsCm ? parseFloat(form.thighsCm) : null,
      bodyFatPercent: form.bodyFatPercent ? parseFloat(form.bodyFatPercent) : null,
      notes: form.notes,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Date" type="date" value={form.date} onChange={set('date')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Weight (kg)" type="number" inputMode="decimal" placeholder="70" value={form.weightKg} onChange={set('weightKg')} />
        <Input label="Height (cm)" type="number" inputMode="decimal" placeholder="175" value={form.heightCm} onChange={set('heightCm')} />
        <Input label="Neck (cm)" type="number" inputMode="decimal" placeholder="38" value={form.neckCm} onChange={set('neckCm')} />
        <Input label="Waist (cm)" type="number" inputMode="decimal" placeholder="80" value={form.waistCm} onChange={set('waistCm')} />
        <Input label="Hips (cm)" type="number" inputMode="decimal" placeholder="95" value={form.hipsCm} onChange={set('hipsCm')} />
        <Input label="Chest (cm)" type="number" inputMode="decimal" placeholder="95" value={form.chestCm} onChange={set('chestCm')} />
        <Input label="Biceps (cm)" type="number" inputMode="decimal" placeholder="35" value={form.bicepsCm} onChange={set('bicepsCm')} />
        <Input label="Thighs (cm)" type="number" inputMode="decimal" placeholder="55" value={form.thighsCm} onChange={set('thighsCm')} />
      </div>

      <div>
        <Input
          label="Body Fat %"
          type="number"
          inputMode="decimal"
          placeholder="20"
          value={form.bodyFatPercent}
          onChange={set('bodyFatPercent')}
        />
        {estimatedBodyFat !== null && (
          <button
            type="button"
            onClick={applyEstimate}
            className="mt-1 text-xs text-accentGreen underline-offset-2 hover:underline"
          >
            Estimated: {estimatedBodyFat}% (Navy method) — tap to apply
          </button>
        )}
      </div>

      <Input label="Notes" type="text" placeholder="Optional" value={form.notes} onChange={set('notes')} />

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Save Measurements
      </Button>
    </form>
  );
}
