# CLAUDE.md — FitAssist Web App

> AI-powered personal fitness web app | React 18 + TypeScript + Vite + Tailwind CSS + Firebase + Gemini 2.5 Flash | Deployed on Vercel

---

## 1. Project Overview

**FitAssist** is a mobile-first progressive web app (PWA) for personal fitness management. It targets everyday gym-goers and home exercisers who want a single app for workout planning, active session tracking, body measurement logging, macro nutrition tracking via AI photo analysis, and workout scheduling.

**Primary user persona:** Adults aged 18–45 who work out 3–5x per week, may or may not have gym equipment, and want intelligent recommendations without paying for a personal trainer.

**Core value propositions:**
- Curated workout plans filtered by duration (15/30/45/60 min), equipment availability, and gender focus
- Live active workout experience with rest timer, set tracking, and exercise queue
- AI-powered macro estimation from a single food photo (Gemini 2.5 Flash)
- Body measurement tracking with progress visualization over time
- Calendar-based workout scheduling with streak tracking for habit formation

**What this app is NOT:**
- Not a social platform (no public profiles, feeds, or sharing in MVP)
- Not a custom workout builder in MVP (plans are seeded; editing is post-MVP)
- Not a wearable sync app (no Apple Watch / Fitbit integration in MVP)

---

## 2. Tech Stack

| Layer           | Technology                                              | Notes                                              |
|-----------------|---------------------------------------------------------|----------------------------------------------------|
| Framework       | React 18 + TypeScript 5                                 | Strict mode enabled                                |
| Build Tool      | Vite 5                                                  | ESM, fast HMR                                      |
| Styling         | Tailwind CSS v3 + custom design tokens                  | Dark theme only, no light mode                     |
| Routing         | React Router v6                                         | Data router pattern, nested layouts                |
| Auth            | Firebase Authentication (Email/Password + Google OAuth) | `onAuthStateChanged` listener at app root          |
| Database        | Cloud Firestore                                         | NoSQL, real-time listeners on active screens       |
| File Storage    | Firebase Storage                                        | Food photos only; max 5 MB per upload              |
| AI              | Google Gemini 2.5 Flash via `@google/generative-ai`     | Called exclusively from Vercel serverless function |
| Serverless      | Vercel Functions (`/api/*.ts`)                          | Node 20 runtime                                    |
| Deployment      | Vercel                                                  | Auto-deploy on `main`; preview on PR               |
| Package Manager | npm                                                     | `package-lock.json` must be committed              |
| Linting         | ESLint + `eslint-plugin-react-hooks` + `@typescript-eslint` | Zero warnings policy                           |
| Formatting      | Prettier (default config)                               | Format on save required                            |

---

## 3. Feature Set

### MVP Features (v1.0 — must ship)

| Feature                     | Description                                                                  |
|-----------------------------|------------------------------------------------------------------------------|
| Email/Password Auth         | Sign up, log in, log out, password reset                                     |
| Google OAuth                | One-tap Google sign-in                                                       |
| Onboarding Flow             | 4-step wizard: gender → goal → fitness level → equipment                     |
| Dashboard (Home)            | Streak counter, today's scheduled workout, macro ring, water tracker         |
| Workout Plan Browser        | Filter by duration, equipment, gender, workout type                          |
| Workout Detail Page         | Plan overview, exercise list with sets/reps, muscle tags, Start CTA          |
| Active Workout Screen       | Exercise queue, set tracker (weight + reps), rest timer, skip/complete       |
| Workout Completion          | Session saved, effort rating (1–5), streak updated                           |
| Body Measurement Log        | Log weight, biceps, waist, chest, hips, thighs in cm/kg                     |
| Progress Charts             | Line chart for weight over time; bar chart for body measurements             |
| AI Macro Tracking           | Upload food photo → Gemini returns macro JSON → saved to daily log           |
| Manual Macro Entry          | Fallback form: calories, protein, carbs, fat                                 |
| Daily Macro Summary         | Donut chart showing protein/carbs/fat % vs. daily targets                    |
| Workout Scheduler           | Pick a date, assign a plan, view on month calendar                           |
| Streak Tracking             | Daily workout streak counter persisted in Firestore user doc                 |
| Water Intake Logger         | +/- glass counter, daily reset at midnight                                   |
| Profile Page                | Edit gender, goal, fitness level, equipment; view account info; logout        |

### Post-MVP / Future (do NOT build in v1.0 — design data models to support them)

| Feature                     | Notes                                                             |
|-----------------------------|-------------------------------------------------------------------|
| Custom Workout Builder      | User creates own exercises and plans                              |
| Superset Support            | Pair two exercises as a superset in a plan                        |
| AI Workout Personalization  | Adapt plan recommendations based on logged history               |
| Muscle Group SVG Diagram    | Body diagram highlighting targeted muscles                        |
| Weekly Volume Tracking      | Sets x reps x weight aggregated per muscle group per week        |
| Push Notification Reminders | Scheduled workout reminders via browser push API                 |
| Exercise Library            | Searchable, filterable catalog of 200+ exercises with instructions|
| Social Features             | Friends, shared workouts, leaderboards                           |

---

## 4. Authentication & Onboarding Flow

### Auth Screens

All auth screens use full-screen dark layout with FitAssist wordmark centered at top.

**`/auth/login`** — `LoginPage.tsx`
- Email + Password inputs + "Log In" green CTA button
- "Forgot Password?" text link → `sendPasswordResetEmail`
- "Don't have an account? Sign Up" → `/auth/signup`
- Google Sign-In button (secondary, outlined)
- If already authenticated → redirect to `/`

**`/auth/signup`** — `SignupPage.tsx`
- Display Name + Email + Password (min 8 chars) + Confirm Password inputs
- "Create Account" green CTA
- "Already have an account? Log In" link
- Google Sign-In button
- On success → redirect to `/onboarding/step-1`

**`/auth/reset-password`** — `ResetPasswordPage.tsx`
- Email input + "Send Reset Email" button
- Success state shows confirmation message

### Onboarding Flow (4 steps, post-signup only)

Runs once. After completion, `userProfile.onboardingComplete = true`. Any logged-in user hitting `/onboarding/*` with `onboardingComplete === true` is redirected to `/`.

**Step 1 `/onboarding/step-1`** — `OnboardingGender.tsx`
- "What is your biological sex?" — Two large tap cards: **Male** | **Female**
- Progress indicator: 1 of 4

**Step 2 `/onboarding/step-2`** — `OnboardingGoal.tsx`
- "What is your primary goal?" — Icon cards (single select):
  - `lose_weight` | `build_muscle` | `improve_endurance` | `stay_active`

**Step 3 `/onboarding/step-3`** — `OnboardingFitnessLevel.tsx`
- "What is your current fitness level?" — Cards: `beginner` | `intermediate` | `advanced`

**Step 4 `/onboarding/step-4`** — `OnboardingEquipment.tsx`
- "What equipment do you have access to?" — Multi-select:
  - `none` (bodyweight only) | `dumbbells` | `resistance_bands` | `full_gym`
- "Let's Go!" green CTA
- On submit: writes `UserProfile` to `users/{uid}`, sets `onboardingComplete: true`, redirects to `/`

### Auth Guard

`ProtectedRoute.tsx` wraps all app routes:
- `user === null` → redirect to `/auth/login`
- `user` exists + `onboardingComplete === false` → redirect to `/onboarding/step-1`

---

## 5. Project Structure

```
fitassist/
├── api/
│   └── analyze-meal.ts              # Vercel serverless fn — Gemini vision call
├── public/
│   └── icons/                       # PWA icons (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx            # variant: 'primary'|'secondary'|'ghost', size: 'sm'|'md'|'lg'
│   │   │   ├── Card.tsx              # Dark surface card, optional onClick (adds hover border)
│   │   │   ├── Modal.tsx             # Bottom-sheet style modal
│   │   │   ├── Badge.tsx             # Pill badge — muscle group tags, duration labels
│   │   │   ├── ProgressRing.tsx      # SVG dashed ring with center label
│   │   │   ├── DonutChart.tsx        # SVG donut for macro split
│   │   │   ├── LineChart.tsx         # SVG line chart for metric over time
│   │   │   ├── BarChart.tsx          # Bar chart for body measurements
│   │   │   ├── Input.tsx             # Dark styled input with label + error state
│   │   │   ├── Spinner.tsx           # Loading spinner
│   │   │   ├── Toast.tsx             # Auto-dismissing feedback (3s)
│   │   │   └── StarRating.tsx        # 1-5 interactive stars for effort rating
│   │   ├── layout/
│   │   │   ├── AppShell.tsx          # TopBar + children + BottomNav
│   │   │   ├── TopBar.tsx            # title prop + optional rightAction
│   │   │   └── BottomNav.tsx         # 4 tabs: Home | Plans | Progress | Profile
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx    # Auth + onboarding guard
│   │   ├── workout/
│   │   │   ├── WorkoutCard.tsx       # Plan card: thumbnail, badges, title
│   │   │   ├── ExerciseListItem.tsx  # Expandable exercise row
│   │   │   ├── ActiveExerciseCard.tsx# Full-width card during active workout
│   │   │   ├── RestTimerOverlay.tsx  # Countdown overlay between sets
│   │   │   ├── SetLogger.tsx         # Weight (kg) + reps inputs per set
│   │   │   ├── WorkoutCompleteModal.tsx # Stats + StarRating
│   │   │   └── FilterBar.tsx         # Scrollable filter chips
│   │   ├── progress/
│   │   │   ├── MeasurementForm.tsx   # All body metric inputs + date picker
│   │   │   ├── MetricCard.tsx        # Latest value + delta from previous
│   │   │   └── StreakBadge.tsx       # Flame icon + streak count
│   │   ├── macros/
│   │   │   ├── MacroCameraUpload.tsx # File input + preview + analyze trigger
│   │   │   ├── MacroResultCard.tsx   # AI-returned breakdown + save/discard
│   │   │   ├── MacroManualForm.tsx   # Manual entry: calories, protein, carbs, fat
│   │   │   └── DailyMacroSummary.tsx # Donut + progress bars vs. targets
│   │   ├── schedule/
│   │   │   ├── WeekStrip.tsx         # 7-day strip; active day = orange circle
│   │   │   ├── MonthCalendar.tsx     # Month grid with workout dot indicators
│   │   │   └── ScheduleEventCard.tsx # Plan name + date/time + complete CTA
│   │   └── water/
│   │       └── WaterTracker.tsx      # Glass icons + +/- controls + daily total
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── onboarding/
│   │   │   ├── OnboardingGender.tsx
│   │   │   ├── OnboardingGoal.tsx
│   │   │   ├── OnboardingFitnessLevel.tsx
│   │   │   └── OnboardingEquipment.tsx
│   │   ├── HomePage.tsx              # Dashboard
│   │   ├── PlansPage.tsx             # Browse + filter plans
│   │   ├── WorkoutDetailPage.tsx     # Plan detail + Start CTA
│   │   ├── ActiveWorkoutPage.tsx     # Live workout (no BottomNav)
│   │   ├── SchedulePage.tsx          # Calendar + upcoming list
│   │   ├── ProgressPage.tsx          # Body metrics + charts
│   │   ├── MacrosPage.tsx            # AI photo + manual + daily summary
│   │   └── ProfilePage.tsx           # Settings + logout
│   ├── hooks/
│   │   ├── useAuth.ts                # Returns { user, userProfile, loading }
│   │   ├── useWorkoutTimer.ts        # Countdown: start/pause/reset/complete
│   │   ├── useRestTimer.ts           # Rest timer, auto-dismiss on expiry
│   │   ├── useWorkoutPlans.ts        # Fetch + filter plans from Firestore
│   │   ├── useActiveWorkout.ts       # Exercise queue + set state during session
│   │   ├── useProgress.ts            # Fetch bodyMetrics for current user
│   │   ├── useMacros.ts              # Fetch + post macro logs, daily totals
│   │   ├── useSchedule.ts            # Fetch + create scheduledWorkouts
│   │   ├── useStreak.ts              # Read + update workout streak
│   │   └── useWater.ts               # Today's water count, +/- actions
│   ├── lib/
│   │   └── firebase.ts               # Exports: auth, db, storage
│   ├── services/
│   │   ├── authService.ts            # signUp, signIn, signInWithGoogle, signOut, resetPassword
│   │   ├── userService.ts            # createUserProfile, getUserProfile, updateUserProfile
│   │   ├── workoutService.ts         # getPlans, getPlanById, getExercisesForPlan
│   │   ├── sessionService.ts         # startSession, completeSession, rateSession, getHistory
│   │   ├── progressService.ts        # addBodyMetric, getBodyMetrics
│   │   ├── macroService.ts           # analyzeMealPhoto, addManualMacroLog, getDailyMacros
│   │   ├── scheduleService.ts        # scheduleWorkout, getScheduledWorkouts, markComplete
│   │   ├── streakService.ts          # getStreak, updateStreak
│   │   └── waterService.ts           # getTodayWater, setWaterCount
│   ├── types/
│   │   ├── user.ts
│   │   ├── workout.ts
│   │   ├── progress.ts
│   │   ├── macro.ts
│   │   ├── schedule.ts
│   │   └── common.ts
│   ├── utils/
│   │   ├── formatters.ts             # formatDuration, formatDate, formatMacro, formatWeight
│   │   ├── workoutFilters.ts         # filterByDuration, filterByEquipment, filterByGender, filterByType
│   │   ├── macroCalculator.ts        # computeDailyTotals, computeMacroPercentages
│   │   └── streakUtils.ts            # isConsecutiveDay, computeCurrentStreak
│   ├── constants/
│   │   ├── colors.ts                 # Design tokens mirroring tailwind.config.ts
│   │   └── workoutDefaults.ts        # DEFAULT_REST_SECS=60, DEFAULT_WATER_GOAL=8
│   ├── App.tsx                       # Router setup + auth listener + route tree
│   └── main.tsx                      # React DOM render + StrictMode
├── scripts/
│   └── seedWorkouts.ts               # One-time Firestore seeding script (run via ts-node)
├── .env.local                        # NEVER committed
├── .env.example                      # Committed — all keys listed, values empty
├── vercel.json                       # SPA rewrite — ALWAYS present
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json                     # strict: true, noUncheckedIndexedAccess: true
└── package.json
```

---

## 6. Routes

| Route                     | Page Component           | Auth Required | Notes                                           |
|---------------------------|--------------------------|---------------|-------------------------------------------------|
| `/auth/login`             | `LoginPage`              | No            | Redirect to `/` if already authed               |
| `/auth/signup`            | `SignupPage`             | No            | Redirect to `/onboarding/step-1` after success  |
| `/auth/reset-password`    | `ResetPasswordPage`      | No            |                                                 |
| `/onboarding/step-1`      | `OnboardingGender`       | Yes           | Skip if `onboardingComplete === true`           |
| `/onboarding/step-2`      | `OnboardingGoal`         | Yes           |                                                 |
| `/onboarding/step-3`      | `OnboardingFitnessLevel` | Yes           |                                                 |
| `/onboarding/step-4`      | `OnboardingEquipment`    | Yes           | Writes profile on submit                        |
| `/`                       | `HomePage`               | Yes           | Dashboard                                       |
| `/plans`                  | `PlansPage`              | Yes           |                                                 |
| `/plans/:planId`          | `WorkoutDetailPage`      | Yes           |                                                 |
| `/workout/active/:planId` | `ActiveWorkoutPage`      | Yes           | Full-screen, no BottomNav — separate layout     |
| `/schedule`               | `SchedulePage`           | Yes           |                                                 |
| `/progress`               | `ProgressPage`           | Yes           |                                                 |
| `/macros`                 | `MacrosPage`             | Yes           |                                                 |
| `/profile`                | `ProfilePage`            | Yes           |                                                 |

`ActiveWorkoutPage` must suppress `BottomNav`. Use a separate layout route without `AppShell`, or pass `fullScreen` prop.

---

## 7. Firestore Collections

All documents use `serverTimestamp()` from `firebase/firestore` for server-side time fields. Client-side date strings use ISO `'YYYY-MM-DD'` for calendar queries.

### `users/{uid}`
```
uid:                string
displayName:        string
email:              string
gender:             'male' | 'female'
goal:               'lose_weight' | 'build_muscle' | 'improve_endurance' | 'stay_active'
fitnessLevel:       'beginner' | 'intermediate' | 'advanced'
equipment:          Array<'none' | 'dumbbells' | 'resistance_bands' | 'full_gym'>
onboardingComplete: boolean
currentStreak:      number           // consecutive workout days
longestStreak:      number
lastWorkoutDate:    string | null    // ISO 'YYYY-MM-DD'
dailyWaterGoal:     number           // glasses, default 8
dailyCalorieTarget: number           // kcal, default 2000
dailyProteinTarget: number           // grams
dailyCarbsTarget:   number           // grams
dailyFatTarget:     number           // grams
createdAt:          Timestamp
updatedAt:          Timestamp
```

### `workoutPlans/{planId}`
```
planId:         string
title:          string              // e.g. "30-Min Dumbbell Strength — Male"
description:    string
durationMins:   15 | 30 | 45 | 60
workoutType:    'strength' | 'hiit' | 'cardio' | 'flexibility'
genderFocus:    'male' | 'female' | 'all'
equipment:      Array<'none' | 'dumbbells' | 'resistance_bands' | 'full_gym'>
fitnessLevel:   'beginner' | 'intermediate' | 'advanced' | 'all'
thumbnailUrl:   string
muscleGroups:   string[]            // e.g. ['chest', 'triceps', 'shoulders']
totalExercises: number              // denormalized for display
isPublished:    boolean
createdAt:      Timestamp
```

### `workoutPlans/{planId}/exercises/{exerciseId}`
```
exerciseId:       string
name:             string
muscleGroup:      string            // 'chest'|'back'|'legs'|'shoulders'|'arms'|'core'|'cardio'
secondaryMuscles: string[]
sets:             number
reps:             number | null     // null if time-based
durationSecs:     number | null     // null if rep-based
restSecs:         number            // default 60
notes:            string            // form cues shown to user
sortOrder:        number            // 0-indexed position
isSuperset:       boolean           // future-proofing only
supersetWith:     string | null
```

### `workoutSessions/{sessionId}`
```
sessionId:     string
userId:        string
planId:        string
planTitle:     string               // denormalized
startedAt:     Timestamp
completedAt:   Timestamp | null
durationSecs:  number
status:        'in_progress' | 'completed' | 'abandoned'
effortRating:  1 | 2 | 3 | 4 | 5 | null
setsCompleted: number
totalSets:     number
exerciseLogs:  Array<{
  exerciseId:   string
  exerciseName: string
  sets: Array<{
    setNumber:    number
    weightKg:     number | null
    reps:         number | null
    durationSecs: number | null
    completedAt:  Timestamp
  }>
}>
```

### `scheduledWorkouts/{scheduleId}`
```
scheduleId:    string
userId:        string
planId:        string
planTitle:     string              // denormalized
scheduledDate: string             // ISO 'YYYY-MM-DD'
scheduledTime: string | null      // 'HH:MM' 24h, optional
completed:     boolean
sessionId:     string | null      // linked if completed
createdAt:     Timestamp
```

### `bodyMetrics/{metricId}`
```
metricId:       string
userId:         string
date:           string            // ISO 'YYYY-MM-DD'
weightKg:       number | null
heightCm:       number | null
bicepsCm:       number | null
chestCm:        number | null
waistCm:        number | null
hipsCm:         number | null
thighsCm:       number | null
bodyFatPercent: number | null
notes:          string
loggedAt:       Timestamp
```

### `macroLogs/{logId}`
```
logId:           string
userId:          string
loggedAt:        Timestamp
date:            string            // ISO 'YYYY-MM-DD'
source:          'ai_photo' | 'manual'
imageUrl:        string | null
mealDescription: string
calories:        number
proteinG:        number
carbsG:          number
fatG:            number
aiRawResponse:   string | null     // full Gemini response for debugging
```

### `waterLogs/{logId}`
```
logId:     string
userId:    string
date:      string                 // ISO 'YYYY-MM-DD' — one doc per user per day
glasses:   number
updatedAt: Timestamp
```

### Firestore Security Rules

Deploy before any frontend data calls:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /workoutPlans/{planId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /workoutPlans/{planId}/exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /workoutSessions/{sessionId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
    match /scheduledWorkouts/{scheduleId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
    match /bodyMetrics/{metricId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
    match /macroLogs/{logId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
    match /waterLogs/{logId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 8. Type Definitions

All types in `src/types/`. **No `any` allowed.**

### `src/types/user.ts`
```typescript
export type Gender = 'male' | 'female';
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'improve_endurance' | 'stay_active';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'none' | 'dumbbells' | 'resistance_bands' | 'full_gym';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  gender: Gender;
  goal: FitnessGoal;
  fitnessLevel: FitnessLevel;
  equipment: Equipment[];
  onboardingComplete: boolean;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;   // ISO 'YYYY-MM-DD'
  dailyWaterGoal: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbsTarget: number;
  dailyFatTarget: number;
  createdAt: string;
  updatedAt: string;
}
```

### `src/types/workout.ts`
```typescript
import type { Equipment, FitnessLevel } from './user';

export type WorkoutType = 'strength' | 'hiit' | 'cardio' | 'flexibility';
export type GenderFocus = 'male' | 'female' | 'all';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'full_body';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Exercise {
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  sets: number;
  reps: number | null;
  durationSecs: number | null;
  restSecs: number;
  notes: string;
  sortOrder: number;
  isSuperset: boolean;
  supersetWith: string | null;
}

export interface WorkoutPlan {
  planId: string;
  title: string;
  description: string;
  durationMins: 15 | 30 | 45 | 60;
  workoutType: WorkoutType;
  genderFocus: GenderFocus;
  equipment: Equipment[];
  fitnessLevel: FitnessLevel | 'all';
  thumbnailUrl: string;
  muscleGroups: MuscleGroup[];
  totalExercises: number;
  isPublished: boolean;
  createdAt: string;
}

export interface SetLog {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  durationSecs: number | null;
  completedAt: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  sessionId: string;
  userId: string;
  planId: string;
  planTitle: string;
  startedAt: string;
  completedAt: string | null;
  durationSecs: number;
  status: SessionStatus;
  effortRating: 1 | 2 | 3 | 4 | 5 | null;
  setsCompleted: number;
  totalSets: number;
  exerciseLogs: ExerciseLog[];
}
```

### `src/types/progress.ts`
```typescript
export interface BodyMetric {
  metricId: string;
  userId: string;
  date: string;                 // ISO 'YYYY-MM-DD'
  weightKg: number | null;
  heightCm: number | null;
  bicepsCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  thighsCm: number | null;
  bodyFatPercent: number | null;
  notes: string;
  loggedAt: string;
}
```

### `src/types/macro.ts`
```typescript
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
```

### `src/types/schedule.ts`
```typescript
export interface ScheduledWorkout {
  scheduleId: string;
  userId: string;
  planId: string;
  planTitle: string;
  scheduledDate: string;         // ISO 'YYYY-MM-DD'
  scheduledTime: string | null;  // 'HH:MM'
  completed: boolean;
  sessionId: string | null;
  createdAt: string;
}
```

### `src/types/common.ts`
```typescript
export interface FirestoreDoc {
  id: string;
}

export interface ApiError {
  code: string;
  message: string;
}
```

---

## 9. AI Integration — Vercel Serverless Function

### `api/analyze-meal.ts`
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalyzeMealRequest {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType } = req.body as AnalyzeMealRequest;

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'imageBase64 and mimeType are required' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    { inlineData: { data: imageBase64, mimeType } },
    'Analyze this meal photo. Return ONLY valid JSON with no markdown: { "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "meal_description": string }'
  ]);

  const text = result.response.text();

  try {
    const parsed = JSON.parse(text);
    return res.status(200).json({ result: parsed });
  } catch {
    return res.status(200).json({ result: text, raw: true });
  }
}
```

**Client call pattern in `macroService.ts`:**
```typescript
const response = await fetch('/api/analyze-meal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ imageBase64, mimeType }),
});
const data = await response.json();
```

**Image prep:** Resize/compress client-side to max 1024px wide, convert to base64. Max accepted: 5 MB.

---

## 10. UI Design System

### Color Palette

```typescript
// tailwind.config.ts
colors: {
  background:   '#1A1A1A',   // App background — outermost wrapper
  surface:      '#2A2A2A',   // Cards, nav bar, modals
  surfaceHigh:  '#3A3A3A',   // Elevated surface, input backgrounds, filter chips
  accent:       '#FF6B35',   // Orange — active day, bar chart highlight, badges
  accentGreen:  '#00E676',   // Green — primary CTA, Start Workout, completion states
  textPrimary:  '#FFFFFF',   // Headings, primary labels
  textMuted:    '#9E9E9E',   // Sub-labels, secondary text
  textDisabled: '#5A5A5A',   // Disabled state
  danger:       '#FF4444',   // Error states, destructive actions
  border:       '#3A3A3A',   // Card borders, dividers
}
```

### Typography

System font stack only — no custom fonts.

| Token      | Tailwind Class           | Use Case                  |
|------------|--------------------------|---------------------------|
| Heading 1  | `text-2xl font-bold`     | Page titles               |
| Heading 2  | `text-xl font-semibold`  | Section headers           |
| Heading 3  | `text-lg font-semibold`  | Card titles               |
| Body       | `text-sm`                | Default body text         |
| Caption    | `text-xs text-textMuted` | Sub-labels, timestamps    |
| CTA Button | `text-base font-semibold`| Button labels             |

### Key UI Patterns

| Pattern          | Implementation                                                                          |
|------------------|-----------------------------------------------------------------------------------------|
| Week Strip       | 7-day horizontal scroll; active day = orange filled circle; workout days get a dot      |
| Bar Chart        | Vertical bars — `#FF6B35` active, `#3A3A3A` inactive; label above each bar             |
| Timer Ring       | Dashed SVG circle; MM:SS countdown in center; orange progress stroke                    |
| Bottom Nav       | Fixed bottom; active tab in `#FF6B35`; inactive in `#9E9E9E`                           |
| Primary CTA      | `bg-accentGreen text-background rounded-2xl h-14 w-full font-semibold`                 |
| Secondary Button | `bg-surfaceHigh text-textPrimary rounded-2xl`                                           |
| Exercise Card    | Dark card; left circle placeholder; right: name + sets x reps + muscle badge           |
| Filter Chips     | Horizontal scroll; selected: `bg-accent text-white`; unselected: `bg-surfaceHigh`      |
| Workout Card     | Dark surface card; 16:9 image top with gradient overlay for title text                 |

### Bottom Nav Icons (`lucide-react`)
- Home → `Home`
- Plans → `Dumbbell`
- Progress → `TrendingUp`
- Profile → `User`

---

## 11. Data Seeding

Workout plans are seeded once via `scripts/seedWorkouts.ts`. Run locally:

```bash
npx ts-node --project tsconfig.json scripts/seedWorkouts.ts
```

Minimum **16 plans** covering all filter combinations:

| Duration | Type        | Gender | Equipment        |
|----------|-------------|--------|------------------|
| 15 min   | HIIT        | all    | none             |
| 15 min   | Strength    | male   | dumbbells        |
| 15 min   | Strength    | female | none             |
| 30 min   | Strength    | male   | full_gym         |
| 30 min   | Strength    | female | dumbbells        |
| 30 min   | HIIT        | all    | none             |
| 30 min   | Cardio      | all    | none             |
| 45 min   | Strength    | male   | full_gym         |
| 45 min   | Strength    | female | full_gym         |
| 45 min   | HIIT        | all    | resistance_bands |
| 45 min   | Flexibility | all    | none             |
| 60 min   | Strength    | male   | full_gym         |
| 60 min   | Strength    | female | full_gym         |
| 60 min   | Cardio      | all    | none             |
| 60 min   | HIIT        | male   | dumbbells        |
| 60 min   | Flexibility | all    | none             |

Each plan must have 4–12 exercises with realistic sets/reps/rest values.

---

## 12. Environment Variables

```bash
# .env.example — committed, values empty

# Firebase (VITE_ prefix = client-safe; secured by Auth + Firestore rules)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Gemini — server-side ONLY, never use VITE_ prefix
GEMINI_API_KEY=
```

**Rules:**
- `GEMINI_API_KEY` must NEVER have `VITE_` prefix — it would be exposed in the client bundle
- `VITE_` Firebase keys are safe because Firestore security rules + Auth enforce data access
- Real values go in `.env.local` — never committed; add to `.gitignore`

---

## 13. Non-Negotiable Rules

- **No `any` types** — define all interfaces in `src/types/`
- **`GEMINI_API_KEY` is server-side only** — never prefix with `VITE_`
- **Firestore security rules must be deployed** before any frontend data calls
- **`vercel.json` always present** — SPA routing breaks without it:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **No inline styles** — Tailwind classes only
- **No `console.log` in committed code** — remove before committing
- **Firestore timestamps**: use `serverTimestamp()` for server fields; convert to ISO strings in the service layer before returning to UI
- **Image uploads**: validate file type and size (max 5 MB) client-side before uploading to Firebase Storage
- **Auth state**: use `useAuth()` hook only — never access `firebase.auth().currentUser` directly in components
- **Branch strategy**: `main` → production. Feature branches → PR → Vercel preview → merge

---

## 14. Quality Gates

Run before every commit and deploy:

```bash
npm run lint          # ESLint — zero warnings policy
npm run type-check    # tsc --noEmit
npm run build         # Vite production build must succeed
```

### `package.json` scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "type-check": "tsc --noEmit",
    "format": "prettier --write src"
  }
}
```
