export type MacroSource = 'ai_photo' | 'manual';

export interface MacroLog {
  logId: string;
  userId: string;
  loggedAt: string;
  date: string;
  source: MacroSource;
  imageUrl: string | null;
  mealDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  aiRawResponse: string | null;
}

export interface MealAnalysisResult {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_description: string;
}

export interface DailyMacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  entries: MacroLog[];
}
