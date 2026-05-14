import { describe, it, expect } from 'vitest';
import { calculateMacroTargets } from '../tdeeCalculator';

describe('calculateMacroTargets', () => {
  it('calculates for a male wanting to build muscle', () => {
    const result = calculateMacroTargets({
      age: 27,
      heightCm: 178,
      weightKg: 78,
      activityLevel: 'moderately_active',
      gender: 'male',
      goal: 'build_muscle',
    });
    // BMR = 10*78 + 6.25*178 - 5*27 + 5 = 1762.5
    // TDEE = round(1762.5 * 1.55) = 2732, +300 = 3032
    expect(result.dailyCalorieTarget).toBe(3032);
    // protein = round(78 * 2.205 * 0.9) = 155g
    expect(result.dailyProteinTarget).toBe(155);
    // fat = round(round(3032*0.25) / 9) = round(758/9) = 84g
    expect(result.dailyFatTarget).toBe(84);
    // carbs = round((3032 - 155*4 - 84*9) / 4) = round(1656/4) = 414g
    expect(result.dailyCarbsTarget).toBe(414);
  });

  it('calculates for a female wanting to lose weight', () => {
    const result = calculateMacroTargets({
      age: 30,
      heightCm: 165,
      weightKg: 65,
      activityLevel: 'lightly_active',
      gender: 'female',
      goal: 'lose_weight',
    });
    // BMR = 10*65 + 6.25*165 - 5*30 - 161 = 1370.25
    // TDEE = round(1370.25 * 1.375) = 1884, -400 = 1484
    expect(result.dailyCalorieTarget).toBe(1484);
  });

  it('applies no calorie adjustment for stay_active goal', () => {
    const result = calculateMacroTargets({
      age: 35,
      heightCm: 170,
      weightKg: 70,
      activityLevel: 'sedentary',
      gender: 'male',
      goal: 'stay_active',
    });
    // BMR = 10*70 + 6.25*170 - 5*35 + 5 = 1592.5
    // TDEE = round(1592.5 * 1.2) = 1911, ±0 = 1911
    expect(result.dailyCalorieTarget).toBe(1911);
  });
});
