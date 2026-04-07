/**
 * One-time script: generates AI workout thumbnail images via kie.ai (4o Image API),
 * uploads them to Firebase Storage, and updates each plan's thumbnailUrl in Firestore.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/generateWorkoutImages.ts
 *
 * Required env vars in .env or .env.local:
 *   KIE_AI_API_KEY               — from https://kie.ai/api-key
 *   VITE_FIREBASE_PROJECT_ID     — Firebase project ID
 *   VITE_FIREBASE_STORAGE_BUCKET — e.g. your-app.appspot.com
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

const KIE_BASE = 'https://api.kie.ai/api/v1/gpt4o-image';

function buildPrompt(workoutType: string, genderFocus: string, title: string): string {
  const genderPart =
    genderFocus === 'male' ? 'male athlete, ' :
    genderFocus === 'female' ? 'female athlete, ' : '';

  const typePart =
    workoutType === 'strength' ? 'heavy lifting, barbell and dumbbells, gym setting, powerful movement' :
    workoutType === 'hiit' ? 'high intensity interval training, explosive movement, energy, dynamic pose' :
    workoutType === 'cardio' ? 'cardio workout, running, treadmill, endurance training' :
    'yoga and stretching, flexibility, mobility, calm studio';

  return `Professional fitness photography, ${genderPart}${typePart}, dark moody gym background, dramatic lighting, motivational, photorealistic, high quality. ${title}`;
}

interface GenerateResponse {
  code: number;
  msg: string;
  data?: { taskId: string };
}

interface StatusResponse {
  code: number;
  successFlag: number; // 0 = in progress, 1 = done, 2 = failed
  msg?: string;
  data?: { urls: string[] };
  progress?: number;
}

async function submitGeneration(prompt: string): Promise<string> {
  const res = await fetch(`${KIE_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${kieApiKey}`,
    },
    body: JSON.stringify({ prompt, size: '3:2', nVariants: 1, isEnhance: false }),
  });

  if (!res.ok) {
    throw new Error(`kie.ai generate error ${res.status}: ${await res.text()}`);
  }

  const json = await res.json() as GenerateResponse;
  if (!json.data?.taskId) {
    throw new Error(`kie.ai did not return a taskId: ${JSON.stringify(json)}`);
  }
  return json.data.taskId;
}

async function pollForResult(taskId: string, timeoutMs = 120_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));

    const res = await fetch(`${KIE_BASE}/record-info?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${kieApiKey}` },
    });

    if (!res.ok) {
      throw new Error(`kie.ai poll error ${res.status}: ${await res.text()}`);
    }

    const status = await res.json() as StatusResponse;

    if (status.successFlag === 1 && status.data?.urls?.[0]) {
      return status.data.urls[0];
    }
    if (status.successFlag === 2) {
      throw new Error(`kie.ai generation failed: ${status.msg ?? 'unknown error'}`);
    }

    process.stdout.write(`  Progress: ${status.progress ?? '?'}%\r`);
  }

  throw new Error(`kie.ai generation timed out after ${timeoutMs / 1000}s`);
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

async function uploadToStorage(planId: string, imageBuffer: Buffer): Promise<string> {
  const file = bucket.file(`workout-thumbnails/${planId}.jpg`);
  await file.save(imageBuffer, {
    metadata: { contentType: 'image/jpeg' },
    public: true,
  });
  return `https://storage.googleapis.com/${storageBucket}/workout-thumbnails/${planId}.jpg`;
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
    const prompt = buildPrompt(plan.workoutType as string, plan.genderFocus as string, plan.title as string);

    console.log(`[${plan.title as string}]`);
    console.log(`  Submitting...`);

    try {
      const taskId = await submitGeneration(prompt);
      console.log(`  Task ID: ${taskId} — polling for result...`);

      const imageUrl = await pollForResult(taskId);
      console.log(`\n  Image URL: ${imageUrl}`);

      const buffer = await fetchBuffer(imageUrl);
      console.log(`  Downloaded ${buffer.length} bytes — uploading to Storage...`);

      const thumbnailUrl = await uploadToStorage(planId, buffer);
      await db.collection('workoutPlans').doc(planId).update({ thumbnailUrl });
      console.log(`  Saved: ${thumbnailUrl}\n`);
    } catch (err) {
      console.error(`\n  FAILED: ${(err as Error).message}\n`);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
