import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query } = req.body as { query: string };
  if (!query) return res.status(400).json({ error: 'query is required' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(
      `Give me the nutrition facts for one standard serving of: ${query}. Return ONLY valid JSON with no markdown: { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "meal_description": string }. The meal_description should be the food name and serving size.`
    );

    const text = result.response.text().trim();
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
