/**
 * One-time script: assigns curated Unsplash thumbnail URLs to each workout plan in Firestore.
 * No API key or credits required — URLs point directly to Unsplash CDN.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/generateWorkoutImages.ts
 *
 * Required env vars in .env or .env.local:
 *   VITE_FIREBASE_PROJECT_ID       — Firebase project ID
 *   GOOGLE_APPLICATION_CREDENTIALS — path to Firebase service account JSON
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const admin = require('firebase-admin') as typeof import('firebase-admin');
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
if (!projectId) { console.error('VITE_FIREBASE_PROJECT_ID is not set'); process.exit(1); }

admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId });
const db = admin.firestore();

// Curated Unsplash photos — one unique image per plan (w=800&q=80&fit=crop&h=450)
const THUMBNAIL_MAP: Record<string, string> = {
  '15-Min Bodyweight HIIT':
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80&fit=crop&h=450',
  '15-Min Dumbbell Strength — Male':
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80&fit=crop&h=450',
  '15-Min Bodyweight Strength — Female':
    'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80&fit=crop&h=450',
  '30-Min Gym Strength — Male':
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&fit=crop&h=450',
  '30-Min Dumbbell Strength — Female':
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&fit=crop&h=450',
  '30-Min No-Equipment HIIT':
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80&fit=crop&h=450',
  '30-Min Cardio Blast':
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80&fit=crop&h=450',
  '45-Min Gym Strength — Male':
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80&fit=crop&h=450',
  '45-Min Gym Strength — Female':
    'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800&q=80&fit=crop&h=450',
  '45-Min Band HIIT':
    'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80&fit=crop&h=450',
  '45-Min Flexibility & Mobility':
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80&fit=crop&h=450',
  '60-Min Gym Strength — Male':
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80&fit=crop&h=450',
  '60-Min Gym Strength — Female':
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80&fit=crop&h=450',
  '60-Min Cardio Endurance':
    'https://images.unsplash.com/photo-1538805060514-97d9cc172698?w=800&q=80&fit=crop&h=450',
  '60-Min Dumbbell HIIT — Male':
    'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80&fit=crop&h=450',
  '60-Min Flexibility & Yoga Flow':
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&fit=crop&h=450',
};

async function main() {
  console.log('Fetching workout plans from Firestore...');
  const plansSnap = await db.collection('workoutPlans').where('isPublished', '==', true).get();

  if (plansSnap.empty) {
    console.error('No published plans found. Run seedWorkouts.ts first.');
    process.exit(1);
  }

  console.log(`Found ${plansSnap.size} plans. Assigning thumbnails...\n`);

  for (const planDoc of plansSnap.docs) {
    const title = planDoc.data().title as string;
    const thumbnailUrl = THUMBNAIL_MAP[title];

    if (!thumbnailUrl) {
      console.warn(`  [SKIP] No thumbnail mapped for: "${title}"`);
      continue;
    }

    await db.collection('workoutPlans').doc(planDoc.id).update({ thumbnailUrl });
    console.log(`  [OK] ${title}`);
  }

  console.log('\nDone. Thumbnails updated in Firestore.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
