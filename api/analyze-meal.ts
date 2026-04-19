import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalyzeMealRequest {
  imageBase64?: string;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
  mealText?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType, mealText } = req.body as AnalyzeMealRequest;

  if (!imageBase64 && !mealText) {
    return res.status(400).json({ error: 'imageBase64 or mealText is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let result;

    if (mealText) {
      result = await model.generateContent(
        `Analyze this meal and estimate macros. Return ONLY valid JSON with no markdown: { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "meal_description": string }. Meal: "${mealText}"`
      );
    } else {
      result = await model.generateContent([
        { inlineData: { data: imageBase64!, mimeType: mimeType! } },
        'Analyze this meal photo. Return ONLY valid JSON with no markdown or code fences: { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "meal_description": string }',
      ]);
    }

    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json({ result: parsed });
    } catch {
      return res.status(200).json({ result: clean, raw: true });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: `Gemini API error: ${message}` });
  }
}
