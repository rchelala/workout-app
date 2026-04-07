/**
 * One-time script: generates AI workout thumbnail images via kie.ai,
 * uploads them to Firebase Storage, and updates each plan's thumbnailUrl in Firestore.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/generateWorkoutImages.ts
 *
 * Required env vars in .env.local:
 *   KIE_AI_API_KEY          — from kie.ai dashboard
 *   VITE_FIREBASE_PROJECT_ID — Firebase project ID
 *   VITE_FIREBASE_STORAGE_BUCKET — Firebase Storage bucket (e.g. your-app.appspot.com)
 *   GOOGLE_APPLICATION_CREDENTIALS — path to Firebase service account JSON
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const admin = require('firebase-admin') as typeof import('firebase-admin');
import * as dotenv from 'dotenv';
import https from 'https';
import http from 'http';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;
const kieApiKey = process.env.KIE_AI_API_KEY;

if (!projectId) { console.error('VITE_FIREBASE_PROJECT_ID is not set'); process.exit(1); }
if (!storageBucket) { console.error('VITE_FIREBASE_STORAGE_BUCKET is not set'); process.exit(1); }
if (!kieApiKey) { console.error('KIE_AI_API_KEY is not set'); process.exit(1); }

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId,
  storageBucket,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

function buildPrompt(workoutType: string, genderFocus: string, title: string): string {
  const genderPart =
    genderFocus === 'male' ? 'male athlete, masculine physique, ' :
    genderFocus === 'female' ? 'female athlete, feminine physique, ' : '';

  const typePart =
    workoutType === 'strength' ? 'heavy lifting, barbell and dumbbells, gym setting, powerful movement' :
    workoutType === 'hiit' ? 'high intensity interval training, explosive movement, sweat, energy, dynamic pose' :
    workoutType === 'cardio' ? 'cardio workout, running, treadmill, endurance training, motion blur' :
    'yoga and stretching, flexibility, mobility, calm studio, serene';

  return `Professional fitness photography, ${genderPart}${typePart}, dark moody gym background, dramatic lighting, motivational, photorealistic, high quality, 16:9 aspect ratio. Title context: ${title}`;
}

async function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function generateImage(prompt: string): Promise<Buffer> {
  const response = await fetch('https://api.kie.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${kieApiKey}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: '1024x576',
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`kie.ai API error ${response.status}: ${text}`);
  }

  const json = await response.json() as { data: Array<{ url?: string; b64_json?: string }> };
  const item = json.data[0];

  if (item.b64_json) {
    return Buffer.from(item.b64_json, 'base64');
  }
  if (item.url) {
    return fetchBuffer(item.url);
  }
  throw new Error('kie.ai response contained neither url nor b64_json');
}

async function uploadToStorage(planId: string, imageBuffer: Buffer): Promise<string> {
  const file = bucket.file(`workout-thumbnails/${planId}.jpg`);
  await file.save(imageBuffer, {
    metadata: { contentType: 'image/jpeg' },
    public: true,
  });
  const publicUrl = `https://storage.googleapis.com/${storageBucket}/workout-thumbnails/${planId}.jpg`;
  return publicUrl;
}

async function main() {
  console.log('Fetching workout plans from Firestore...');
  const plansSnap = await db.collection('workoutPlans').where('isPublished', '==', true).get();

  if (plansSnap.empty) {
    console.error('No published plans found. Run seedWorkouts.ts first.');
    process.exit(1);
  }

  console.log(`Found ${plansSnap.size} plans. Generating images...\n`);

  for (const planDoc of plansSnap.docs) {
    const plan = planDoc.data();
    const planId = planDoc.id;
    const prompt = buildPrompt(plan.workoutType, plan.genderFocus, plan.title);

    console.log(`[${plan.title}]`);
    console.log(`  Prompt: ${prompt.slice(0, 80)}...`);

    try {
      const imageBuffer = await generateImage(prompt);
      console.log(`  Generated ${imageBuffer.length} bytes — uploading...`);

      const thumbnailUrl = await uploadToStorage(planId, imageBuffer);
      await db.collection('workoutPlans').doc(planId).update({ thumbnailUrl });

      console.log(`  Done: ${thumbnailUrl}\n`);
    } catch (err) {
      console.error(`  FAILED: ${(err as Error).message}\n`);
    }

    // Respect rate limits — wait 2s between requests
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('Image generation complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
