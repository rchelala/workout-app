/**
 * US Navy Body Fat % Estimation Formula
 *
 * Male:   %BF = 495 / (1.0324 − 0.19077×log10(waist−neck) + 0.15456×log10(height)) − 450
 * Female: %BF = 495 / (1.29579 − 0.35004×log10(waist+hips−neck) + 0.22100×log10(height)) − 450
 *
 * All measurements in centimeters.
 */
export function calculateNavyBodyFat(
  gender: 'male' | 'female',
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipsCm?: number | null
): number | null {
  if (waistCm <= neckCm) return null;
  if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return null;

  let result: number;

  if (gender === 'male') {
    const denominator =
      1.0324 -
      0.19077 * Math.log10(waistCm - neckCm) +
      0.15456 * Math.log10(heightCm);
    if (denominator <= 0) return null;
    result = 495 / denominator - 450;
  } else {
    if (!hipsCm || hipsCm <= 0) return null;
    const denominator =
      1.29579 -
      0.35004 * Math.log10(waistCm + hipsCm - neckCm) +
      0.221 * Math.log10(heightCm);
    if (denominator <= 0) return null;
    result = 495 / denominator - 450;
  }

  if (result < 2 || result > 60) return null;
  return Math.round(result * 10) / 10;
}
