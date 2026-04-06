import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Onboarding pages
import { OnboardingGender } from '@/pages/onboarding/OnboardingGender';
import { OnboardingGoal } from '@/pages/onboarding/OnboardingGoal';
import { OnboardingFitnessLevel } from '@/pages/onboarding/OnboardingFitnessLevel';
import { OnboardingEquipment } from '@/pages/onboarding/OnboardingEquipment';

// App pages
import { HomePage } from '@/pages/HomePage';
import { PlansPage } from '@/pages/PlansPage';
import { WorkoutDetailPage } from '@/pages/WorkoutDetailPage';
import { ActiveWorkoutPage } from '@/pages/ActiveWorkoutPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { ProgressPage } from '@/pages/ProgressPage';
import { MacrosPage } from '@/pages/MacrosPage';
import { ProfilePage } from '@/pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Onboarding (auth required but no onboarding check) */}
          <Route path="/onboarding/step-1" element={<OnboardingGender />} />
          <Route path="/onboarding/step-2" element={<OnboardingGoal />} />
          <Route path="/onboarding/step-3" element={<OnboardingFitnessLevel />} />
          <Route path="/onboarding/step-4" element={<OnboardingEquipment />} />

          {/* Protected app routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
          <Route path="/plans/:planId" element={<ProtectedRoute><WorkoutDetailPage /></ProtectedRoute>} />
          <Route path="/workout/active/:planId" element={<ProtectedRoute><ActiveWorkoutPage /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
          <Route path="/macros" element={<ProtectedRoute><MacrosPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
