import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signIn, signInWithGoogle } from '@/services/authService';
import { getUserProfile, createUserProfile } from '@/services/userService';

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(form.email, form.password);
      navigate('/');
    } catch (err) {
      console.error('[LoginPage] Email sign-in error:', err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { uid } = await signInWithGoogle();
      let profile = await getUserProfile(uid);
      if (!profile) {
        const firebaseUser = (await import('@/lib/firebase')).auth.currentUser;
        await createUserProfile(uid, firebaseUser?.displayName ?? 'User', firebaseUser?.email ?? '');
        profile = await getUserProfile(uid);
      }
      navigate(profile?.onboardingComplete ? '/' : '/onboarding/step-1');
    } catch (err) {
      console.error('[LoginPage] Google sign-in error:', err);
      setError('Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-16 h-16 rounded-2xl bg-accentGreen/10 flex items-center justify-center">
          <Dumbbell size={32} className="text-accentGreen" />
        </div>
        <h1 className="text-2xl font-bold text-textPrimary">FitAssist</h1>
        <p className="text-textMuted text-sm">Your AI fitness companion</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
        <Input label="Password" type="password" autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={set('password')} />
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
          Log In
        </Button>
      </form>

      <Link to="/auth/reset-password" className="text-sm text-textMuted hover:text-textPrimary mt-3">
        Forgot Password?
      </Link>

      <div className="w-full flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-textDisabled">OR</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button variant="ghost" fullWidth size="lg" onClick={handleGoogle} loading={googleLoading}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      <p className="text-sm text-textMuted mt-6">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="text-accentGreen font-medium">Sign Up</Link>
      </p>
    </div>
  );
}
