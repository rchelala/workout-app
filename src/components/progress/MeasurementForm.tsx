import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { BodyMetric } from '@/types/progress';
import { todayISO } from '@/utils/formatters';

type MetricField = Omit<BodyMetric, 'metricId' | 'userId' | 'loggedAt'>;

interface MeasurementFormProps {
  onSubmit: (data: MetricField) => Promise<void>;
}

export function MeasurementForm({ onSubmit }: MeasurementFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(),
    weightKg: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      date: form.date,
      heightCm: null,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
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
        <Input label="Body Fat %" type="number" inputMode="decimal" placeholder="20" value={form.bodyFatPercent} onChange={set('bodyFatPercent')} />
        <Input label="Biceps (cm)" type="number" inputMode="decimal" placeholder="35" value={form.bicepsCm} onChange={set('bicepsCm')} />
        <Input label="Chest (cm)" type="number" inputMode="decimal" placeholder="95" value={form.chestCm} onChange={set('chestCm')} />
        <Input label="Waist (cm)" type="number" inputMode="decimal" placeholder="80" value={form.waistCm} onChange={set('waistCm')} />
        <Input label="Hips (cm)" type="number" inputMode="decimal" placeholder="95" value={form.hipsCm} onChange={set('hipsCm')} />
        <Input label="Thighs (cm)" type="number" inputMode="decimal" placeholder="55" value={form.thighsCm} onChange={set('thighsCm')} />
      </div>
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Save Measurements
      </Button>
    </form>
  );
}
