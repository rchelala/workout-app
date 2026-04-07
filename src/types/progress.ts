export interface BodyMetric {
  metricId: string;
  userId: string;
  date: string;
  weightKg: number | null;
  heightCm: number | null;
  bicepsCm: number | null;
  neckCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  thighsCm: number | null;
  bodyFatPercent: number | null;
  notes: string;
  loggedAt: string;
}
