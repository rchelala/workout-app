/**
 * One-time seeding script for Firestore workout plans + exercises.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/seedWorkouts.ts
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to a Firebase
 * service account JSON key, OR VITE_FIREBASE_PROJECT_ID set in .env/.env.local.
 *
 * Download service account key:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const admin = require('firebase-admin') as typeof import('firebase-admin');
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
if (!projectId) {
  console.error('VITE_FIREBASE_PROJECT_ID is not set');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId,
});

const db = admin.firestore();
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
const collection = (path: string) => db.collection(path);

interface ExerciseSeed {
  name: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  sets: number;
  reps: number | null;
  durationSecs: number | null;
  restSecs: number;
  notes: string;
}

interface PlanSeed {
  title: string;
  description: string;
  durationMins: 15 | 30 | 45 | 60;
  workoutType: string;
  genderFocus: string;
  equipment: string[];
  fitnessLevel: string;
  thumbnailUrl: string;
  muscleGroups: string[];
  exercises: ExerciseSeed[];
}

const plans: PlanSeed[] = [
  {
    title: '15-Min Bodyweight HIIT',
    description: 'A fast-paced high-intensity interval workout requiring no equipment. Perfect for burning calories in minimal time.',
    durationMins: 15, workoutType: 'hiit', genderFocus: 'all', equipment: ['none'],
    fitnessLevel: 'all', thumbnailUrl: '', muscleGroups: ['full_body', 'core', 'cardio'],
    exercises: [
      { name: 'Jumping Jacks',   muscleGroup: 'cardio', secondaryMuscles: [], sets: 3, reps: null, durationSecs: 30, restSecs: 15, notes: 'Keep a steady pace' },
      { name: 'Burpees',         muscleGroup: 'full_body', secondaryMuscles: ['core', 'chest'], sets: 3, reps: null, durationSecs: 20, restSecs: 20, notes: 'Explode up on each rep' },
      { name: 'High Knees',      muscleGroup: 'cardio', secondaryMuscles: ['core'], sets: 3, reps: null, durationSecs: 30, restSecs: 15, notes: 'Drive knees to hip height' },
      { name: 'Mountain Climbers', muscleGroup: 'core', secondaryMuscles: ['cardio'], sets: 3, reps: null, durationSecs: 30, restSecs: 15, notes: 'Keep hips level' },
    ],
  },
  {
    title: '15-Min Dumbbell Strength — Male',
    description: 'Quick upper-body focused strength session targeting chest, back, and arms.',
    durationMins: 15, workoutType: 'strength', genderFocus: 'male', equipment: ['dumbbells'],
    fitnessLevel: 'beginner', thumbnailUrl: '', muscleGroups: ['chest', 'back', 'arms'],
    exercises: [
      { name: 'Dumbbell Bench Press', muscleGroup: 'chest', secondaryMuscles: ['arms'], sets: 3, reps: 10, durationSecs: null, restSecs: 45, notes: 'Keep elbows at 45°' },
      { name: 'Dumbbell Row',         muscleGroup: 'back',  secondaryMuscles: ['arms'], sets: 3, reps: 10, durationSecs: null, restSecs: 45, notes: 'Pull elbow back and up' },
      { name: 'Dumbbell Curl',        muscleGroup: 'arms',  secondaryMuscles: [],       sets: 3, reps: 12, durationSecs: null, restSecs: 30, notes: 'Control the eccentric' },
    ],
  },
  {
    title: '15-Min Bodyweight Strength — Female',
    description: 'A targeted lower-body and glute workout using just bodyweight.',
    durationMins: 15, workoutType: 'strength', genderFocus: 'female', equipment: ['none'],
    fitnessLevel: 'beginner', thumbnailUrl: '', muscleGroups: ['legs', 'core'],
    exercises: [
      { name: 'Bodyweight Squat',  muscleGroup: 'legs', secondaryMuscles: ['core'], sets: 3, reps: 15, durationSecs: null, restSecs: 45, notes: 'Knees track over toes' },
      { name: 'Glute Bridge',      muscleGroup: 'legs', secondaryMuscles: ['core'], sets: 3, reps: 15, durationSecs: null, restSecs: 45, notes: 'Squeeze glutes at top' },
      { name: 'Reverse Lunge',     muscleGroup: 'legs', secondaryMuscles: [],       sets: 3, reps: 10, durationSecs: null, restSecs: 45, notes: '10 per leg' },
    ],
  },
  {
    title: '30-Min Gym Strength — Male',
    description: 'Full-gym push/pull workout hitting chest, back, and shoulders with compound movements.',
    durationMins: 30, workoutType: 'strength', genderFocus: 'male', equipment: ['full_gym'],
    fitnessLevel: 'intermediate', thumbnailUrl: '', muscleGroups: ['chest', 'back', 'shoulders'],
    exercises: [
      { name: 'Barbell Bench Press',  muscleGroup: 'chest',     secondaryMuscles: ['arms', 'shoulders'], sets: 4, reps: 8,  durationSecs: null, restSecs: 90, notes: 'Full range of motion' },
      { name: 'Cable Row',            muscleGroup: 'back',      secondaryMuscles: ['arms'],             sets: 4, reps: 10, durationSecs: null, restSecs: 75, notes: 'Squeeze shoulder blades together' },
      { name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders', secondaryMuscles: ['arms'],          sets: 3, reps: 10, durationSecs: null, restSecs: 60, notes: 'Don\'t lock out at top' },
      { name: 'Tricep Pushdown',      muscleGroup: 'arms',      secondaryMuscles: [],                   sets: 3, reps: 12, durationSecs: null, restSecs: 45, notes: 'Keep elbows tucked' },
    ],
  },
  {
    title: '30-Min Dumbbell Strength — Female',
    description: 'Full body dumbbell circuit focusing on glutes, back, and shoulders.',
    durationMins: 30, workoutType: 'strength', genderFocus: 'female', equipment: ['dumbbells'],
    fitnessLevel: 'intermediate', thumbnailUrl: '', muscleGroups: ['legs', 'back', 'shoulders'],
    exercises: [
      { name: 'Dumbbell Romanian Deadlift', muscleGroup: 'legs',     secondaryMuscles: ['back'],      sets: 4, reps: 10, durationSecs: null, restSecs: 60, notes: 'Hinge at hips, slight knee bend' },
      { name: 'Dumbbell Lateral Raise',     muscleGroup: 'shoulders', secondaryMuscles: [],           sets: 3, reps: 15, durationSecs: null, restSecs: 45, notes: 'Lead with elbows, slight bend' },
      { name: 'Single-Arm Row',             muscleGroup: 'back',      secondaryMuscles: ['arms'],     sets: 3, reps: 12, durationSecs: null, restSecs: 45, notes: 'Brace core, keep back flat' },
      { name: 'Dumbbell Hip Thrust',        muscleGroup: 'legs',      secondaryMuscles: ['core'],     sets: 4, reps: 12, durationSecs: null, restSecs: 60, notes: 'Full hip extension at top' },
    ],
  },
  {
    title: '30-Min No-Equipment HIIT',
    description: 'Bodyweight circuit to spike heart rate and burn fat — no gym needed.',
    durationMins: 30, workoutType: 'hiit', genderFocus: 'all', equipment: ['none'],
    fitnessLevel: 'all', thumbnailUrl: '', muscleGroups: ['full_body', 'cardio', 'core'],
    exercises: [
      { name: 'Jump Squats',     muscleGroup: 'legs',  secondaryMuscles: ['cardio'], sets: 4, reps: null, durationSecs: 40, restSecs: 20, notes: 'Land softly' },
      { name: 'Push-Ups',        muscleGroup: 'chest', secondaryMuscles: ['arms', 'core'], sets: 4, reps: 15, durationSecs: null, restSecs: 30, notes: 'Full body straight' },
      { name: 'Speed Skaters',   muscleGroup: 'cardio', secondaryMuscles: ['legs'], sets: 4, reps: null, durationSecs: 40, restSecs: 20, notes: 'Reach low on each side' },
      { name: 'Plank',           muscleGroup: 'core',  secondaryMuscles: [],       sets: 4, reps: null, durationSecs: 30, restSecs: 20, notes: 'Squeeze everything' },
      { name: 'Burpees',         muscleGroup: 'full_body', secondaryMuscles: ['cardio'], sets: 4, reps: null, durationSecs: 30, restSecs: 30, notes: 'Controlled pace' },
    ],
  },
  {
    title: '30-Min Cardio Blast',
    description: 'Steady-state and interval cardio session with zero equipment to boost endurance.',
    durationMins: 30, workoutType: 'cardio', genderFocus: 'all', equipment: ['none'],
    fitnessLevel: 'all', thumbnailUrl: '', muscleGroups: ['cardio', 'full_body'],
    exercises: [
      { name: 'Jog in Place',       muscleGroup: 'cardio', secondaryMuscles: [], sets: 5, reps: null, durationSecs: 60, restSecs: 15, notes: 'Moderate pace warm-up' },
      { name: 'High Knees',         muscleGroup: 'cardio', secondaryMuscles: ['core'], sets: 5, reps: null, durationSecs: 45, restSecs: 15, notes: 'Sprint intensity' },
      { name: 'Lateral Shuffles',   muscleGroup: 'cardio', secondaryMuscles: ['legs'], sets: 5, reps: null, durationSecs: 30, restSecs: 15, notes: 'Low athletic stance' },
      { name: 'Cool-Down Walk',     muscleGroup: 'cardio', secondaryMuscles: [], sets: 1, reps: null, durationSecs: 120, restSecs: 0, notes: 'Slow to a comfortable pace' },
    ],
  },
  {
    title: '45-Min Gym Strength — Male',
    description: 'Hypertrophy-focused push day: chest, shoulders, triceps. Moderate weights, high volume.',
    durationMins: 45, workoutType: 'strength', genderFocus: 'male', equipment: ['full_gym'],
    fitnessLevel: 'intermediate', thumbnailUrl: '', muscleGroups: ['chest', 'shoulders', 'arms'],
    exercises: [
      { name: 'Incline Barbell Press',    muscleGroup: 'chest',     secondaryMuscles: ['shoulders', 'arms'], sets: 4, reps: 8, durationSecs: null, restSecs: 90, notes: 'Upper chest focus' },
      { name: 'Flat Dumbbell Flyes',      muscleGroup: 'chest',     secondaryMuscles: [],                   sets: 3, reps: 12, durationSecs: null, restSecs: 60, notes: 'Wide arc, slight elbow bend' },
      { name: 'Overhead Press',           muscleGroup: 'shoulders', secondaryMuscles: ['arms'],             sets: 4, reps: 8, durationSecs: null, restSecs: 90, notes: 'Brace core, don\'t hyperextend' },
      { name: 'Cable Lateral Raise',      muscleGroup: 'shoulders', secondaryMuscles: [],                   sets: 3, reps: 15, durationSecs: null, restSecs: 45, notes: 'Constant tension via cable' },
      { name: 'Skull Crushers',           muscleGroup: 'arms',      secondaryMuscles: [],                   sets: 3, reps: 12, durationSecs: null, restSecs: 60, notes: 'Lower bar to forehead' },
      { name: 'Cable Tricep Pushdown',    muscleGroup: 'arms',      secondaryMuscles: [],                   sets: 3, reps: 15, durationSecs: null, restSecs: 45, notes: 'Full extension each rep' },
    ],
  },
  {
    title: '45-Min Gym Strength — Female',
    description: 'Glute and lower-body day using machines and free weights for maximum activation.',
    durationMins: 45, workoutType: 'strength', genderFocus: 'female', equipment: ['full_gym'],
    fitnessLevel: 'intermediate', thumbnailUrl: '', muscleGroups: ['legs', 'core'],
    exercises: [
      { name: 'Barbell Hip Thrust',    muscleGroup: 'legs',  secondaryMuscles: ['core'],  sets: 4, reps: 10, durationSecs: null, restSecs: 90, notes: 'Full hip extension, squeeze at top' },
      { name: 'Leg Press',             muscleGroup: 'legs',  secondaryMuscles: [],        sets: 4, reps: 12, durationSecs: null, restSecs: 75, notes: 'Feet shoulder-width on platform' },
      { name: 'Cable Kickback',        muscleGroup: 'legs',  secondaryMuscles: [],        sets: 3, reps: 15, durationSecs: null, restSecs: 45, notes: 'Slow and controlled, glute focus' },
      { name: 'Romanian Deadlift',     muscleGroup: 'legs',  secondaryMuscles: ['back'],  sets: 4, reps: 10, durationSecs: null, restSecs: 75, notes: 'Feel stretch in hamstrings' },
      { name: 'Lying Leg Curl',        muscleGroup: 'legs',  secondaryMuscles: [],        sets: 3, reps: 12, durationSecs: null, restSecs: 60, notes: 'Curl heel to glute' },
      { name: 'Ab Crunches',           muscleGroup: 'core',  secondaryMuscles: [],        sets: 3, reps: 20, durationSecs: null, restSecs: 30, notes: 'Exhale on way up' },
    ],
  },
  {
    title: '45-Min Band HIIT',
    description: 'High-intensity interval training using resistance bands for added challenge.',
    durationMins: 45, workoutType: 'hiit', genderFocus: 'all', equipment: ['resistance_bands'],
    fitnessLevel: 'intermediate', thumbnailUrl: '', muscleGroups: ['full_body', 'cardio'],
    exercises: [
      { name: 'Band Squat Jump',       muscleGroup: 'legs',     secondaryMuscles: ['cardio'], sets: 4, reps: null, durationSecs: 40, restSecs: 20, notes: 'Band around thighs' },
      { name: 'Band Pull Apart',       muscleGroup: 'shoulders', secondaryMuscles: ['back'],  sets: 4, reps: 20, durationSecs: null, restSecs: 30, notes: 'Arms straight, pull to chest' },
      { name: 'Band Lateral Walk',     muscleGroup: 'legs',     secondaryMuscles: [],        sets: 4, reps: null, durationSecs: 30, restSecs: 20, notes: '15 steps each direction' },
      { name: 'Band Bicep Curl',       muscleGroup: 'arms',     secondaryMuscles: [],        sets: 3, reps: 15, durationSecs: null, restSecs: 30, notes: 'Step on band for resistance' },
      { name: 'Band Overhead Tricep',  muscleGroup: 'arms',     secondaryMuscles: [],        sets: 3, reps: 15, durationSecs: null, restSecs: 30, notes: 'Full extension above head' },
      { name: 'Band Deadbug',          muscleGroup: 'core',     secondaryMuscles: [],        sets: 3, reps: null, durationSecs: 30, restSecs: 20, notes: 'Keep low back pressed to floor' },
    ],
  },
  {
    title: '45-Min Flexibility & Mobility',
    description: 'Full-body stretch and mobility flow to improve range of motion and recovery.',
    durationMins: 45, workoutType: 'flexibility', genderFocus: 'all', equipment: ['none'],
    fitnessLevel: 'all', thumbnailUrl: '', muscleGroups: ['full_body'],
    exercises: [
      { name: 'Cat-Cow Stretch',       muscleGroup: 'back',  secondaryMuscles: ['core'], sets: 3, reps: null, durationSecs: 45, restSecs: 10, notes: 'Sync with breathing' },
      { name: 'Hip Flexor Stretch',    muscleGroup: 'legs',  secondaryMuscles: [],       sets: 3, reps: null, durationSecs: 60, restSecs: 10, notes: '60 seconds each side' },
      { name: 'Pigeon Pose',           muscleGroup: 'legs',  secondaryMuscles: [],       sets: 2, reps: null, durationSecs: 60, restSecs: 10, notes: 'Hold and breathe deeply' },
      { name: 'Thoracic Rotation',     muscleGroup: 'back',  secondaryMuscles: [],       sets: 3, reps: 10,   durationSecs: null, restSecs: 15, notes: 'Controlled rotation each side' },
      { name: 'Standing Hamstring Stretch', muscleGroup: 'legs', secondaryMuscles: [], sets: 3, reps: null, durationSecs: 45, restSecs: 10, notes: 'Keep knee soft' },
      { name: 'Child\'s Pose',         muscleGroup: 'back',  secondaryMuscles: ['shoulders'], sets: 2, reps: null, durationSecs: 60, restSecs: 10, notes: 'Breathe into the lower back' },
    ],
  },
  {
    title: '60-Min Gym Strength — Male',
    description: 'Full push-pull-legs split: chest, back, and legs in one comprehensive session.',
    durationMins: 60, workoutType: 'strength', genderFocus: 'male', equipment: ['full_gym'],
    fitnessLevel: 'advanced', thumbnailUrl: '', muscleGroups: ['chest', 'back', 'legs', 'shoulders'],
    exercises: [
      { name: 'Barbell Squat',          muscleGroup: 'legs',     secondaryMuscles: ['back', 'core'], sets: 5, reps: 5, durationSecs: null, restSecs: 180, notes: 'Below parallel' },
      { name: 'Bench Press',            muscleGroup: 'chest',    secondaryMuscles: ['arms', 'shoulders'], sets: 4, reps: 8, durationSecs: null, restSecs: 120, notes: 'Touch chest each rep' },
      { name: 'Weighted Pull-Up',       muscleGroup: 'back',     secondaryMuscles: ['arms'],         sets: 4, reps: 6, durationSecs: null, restSecs: 120, notes: 'Full hang at bottom' },
      { name: 'Romanian Deadlift',      muscleGroup: 'legs',     secondaryMuscles: ['back'],         sets: 4, reps: 8, durationSecs: null, restSecs: 90, notes: 'Hip hinge pattern' },
      { name: 'Dips',                   muscleGroup: 'chest',    secondaryMuscles: ['arms'],         sets: 3, reps: 10, durationSecs: null, restSecs: 75, notes: 'Slight forward lean for chest' },
      { name: 'Face Pulls',             muscleGroup: 'shoulders', secondaryMuscles: ['back'],        sets: 3, reps: 15, durationSecs: null, restSecs: 45, notes: 'High attachment, pull to forehead' },
    ],
  },
  {
    title: '60-Min Gym Strength — Female',
    description: 'Full-body sculpting session: glutes, back, and arms for a balanced physique.',
    durationMins: 60, workoutType: 'strength', genderFocus: 'female', equipment: ['full_gym'],
    fitnessLevel: 'advanced', thumbnailUrl: '', muscleGroups: ['legs', 'back', 'arms', 'core'],
    exercises: [
      { name: 'Sumo Deadlift',          muscleGroup: 'legs',  secondaryMuscles: ['back', 'core'], sets: 4, reps: 8, durationSecs: null, restSecs: 120, notes: 'Wide stance, toes out' },
      { name: 'Barbell Hip Thrust',     muscleGroup: 'legs',  secondaryMuscles: ['core'],         sets: 4, reps: 10, durationSecs: null, restSecs: 90, notes: 'Full hip extension at top' },
      { name: 'Lat Pulldown',           muscleGroup: 'back',  secondaryMuscles: ['arms'],         sets: 4, reps: 12, durationSecs: null, restSecs: 75, notes: 'Pull to upper chest' },
      { name: 'Seated Row',             muscleGroup: 'back',  secondaryMuscles: ['arms'],         sets: 3, reps: 12, durationSecs: null, restSecs: 60, notes: 'Squeeze shoulder blades' },
      { name: 'Dumbbell Curl',          muscleGroup: 'arms',  secondaryMuscles: [],               sets: 3, reps: 12, durationSecs: null, restSecs: 45, notes: 'Slow eccentric' },
      { name: 'Cable Crunch',           muscleGroup: 'core',  secondaryMuscles: [],               sets: 3, reps: 15, durationSecs: null, restSecs: 45, notes: 'Round the spine at bottom' },
    ],
  },
  {
    title: '60-Min Cardio Endurance',
    description: 'Long-form cardio and core session to build aerobic base and endurance.',
    durationMins: 60, workoutType: 'cardio', genderFocus: 'all', equipment: ['none'],
    fitnessLevel: 'all', thumbnailUrl: '', muscleGroups: ['cardio', 'core', 'full_body'],
    exercises: [
      { name: 'Warm-Up Jog',        muscleGroup: 'cardio', secondaryMuscles: [], sets: 1, reps: null, durationSecs: 300, restSecs: 0, notes: 'Easy conversational pace' },
      { name: 'Sprint Intervals',   muscleGroup: 'cardio', secondaryMuscles: [], sets: 8, reps: null, durationSecs: 30,  restSecs: 90, notes: '90% effort' },
      { name: 'Box Steps',          muscleGroup: 'cardio', secondaryMuscles: ['legs'], sets: 4, reps: null, durationSecs: 60, restSecs: 30, notes: 'Steady rhythm' },
      { name: 'Plank Hold',         muscleGroup: 'core',   secondaryMuscles: [], sets: 4, reps: null, durationSecs: 45,  restSecs: 30, notes: 'Perfect form' },
      { name: 'Cool-Down Stretch',  muscleGroup: 'full_body', secondaryMuscles: [], sets: 1, reps: null, durationSecs: 300, restSecs: 0, notes: 'Hold each stretch 30s' },
    ],
  },
  {
    title: '60-Min Dumbbell HIIT — Male',
    description: 'Strength-cardio hybrid using dumbbells for maximum metabolic stress.',
    durationMins: 60, workoutType: 'hiit', genderFocus: 'male', equipment: ['dumbbells'],
    fitnessLevel: 'advanced', thumbnailUrl: '', muscleGroups: ['full_body', 'cardio'],
    exercises: [
      { name: 'Dumbbell Thruster',     muscleGroup: 'full_body', secondaryMuscles: ['cardio', 'shoulders'], sets: 5, reps: 10, durationSecs: null, restSecs: 60, notes: 'Squat into press in one motion' },
      { name: 'Renegade Row',          muscleGroup: 'back',     secondaryMuscles: ['core', 'arms'],        sets: 4, reps: 8,  durationSecs: null, restSecs: 60, notes: 'Keep hips square' },
      { name: 'Dumbbell Clean',        muscleGroup: 'full_body', secondaryMuscles: ['cardio'],             sets: 4, reps: 8,  durationSecs: null, restSecs: 75, notes: 'Explosive hip drive' },
      { name: 'Suitcase Carry',        muscleGroup: 'core',     secondaryMuscles: ['legs'],                sets: 4, reps: null, durationSecs: 30, restSecs: 30, notes: 'Resist lateral lean' },
      { name: 'Dumbbell Swing',        muscleGroup: 'full_body', secondaryMuscles: ['cardio'],             sets: 4, reps: 15, durationSecs: null, restSecs: 45, notes: 'Power from hips not arms' },
    ],
  },
  {
    title: '60-Min Flexibility & Yoga Flow',
    description: 'An extended yoga-inspired mobility session to restore and rejuvenate.',
    durationMins: 60, workoutType: 'flexibility', genderFocus: 'all', equipment: ['none'],
    fitnessLevel: 'all', thumbnailUrl: '', muscleGroups: ['full_body'],
    exercises: [
      { name: 'Sun Salutation',         muscleGroup: 'full_body', secondaryMuscles: [], sets: 5, reps: null, durationSecs: 60, restSecs: 0, notes: 'Flowing transitions' },
      { name: 'Downward Dog Hold',      muscleGroup: 'back',     secondaryMuscles: ['legs', 'shoulders'], sets: 3, reps: null, durationSecs: 60, restSecs: 10, notes: 'Pedal feet' },
      { name: 'Warrior I & II',         muscleGroup: 'legs',     secondaryMuscles: ['shoulders'],         sets: 3, reps: null, durationSecs: 60, restSecs: 10, notes: '30s each side' },
      { name: 'Seated Spinal Twist',    muscleGroup: 'back',     secondaryMuscles: ['core'],              sets: 3, reps: null, durationSecs: 45, restSecs: 10, notes: 'Tall spine, gentle rotation' },
      { name: 'Happy Baby Pose',        muscleGroup: 'legs',     secondaryMuscles: ['back'],              sets: 2, reps: null, durationSecs: 60, restSecs: 0, notes: 'Rock side to side gently' },
      { name: 'Savasana',               muscleGroup: 'full_body', secondaryMuscles: [],                   sets: 1, reps: null, durationSecs: 300, restSecs: 0, notes: 'Complete relaxation' },
    ],
  },
];

async function seed() {
  console.log(`Seeding ${plans.length} workout plans…`);

  for (const plan of plans) {
    const { exercises, ...planData } = plan;
    const planRef = await collection('workoutPlans').add({
      ...planData,
      totalExercises: exercises.length,
      isPublished: true,
      createdAt: serverTimestamp(),
    });
    console.log(`  Created plan: ${plan.title} (${planRef.id})`);

    for (let i = 0; i < exercises.length; i++) {
      await db.collection('workoutPlans').doc(planRef.id).collection('exercises').add({
        ...exercises[i],
        sortOrder: i,
        isSuperset: false,
        supersetWith: null,
      });
    }
    console.log(`    → ${exercises.length} exercises added`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
