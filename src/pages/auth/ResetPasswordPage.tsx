import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { resetPassword } from '@/services/authService';
import { CheckCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 max-w-sm mx-auto">
      {sent ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle size={56} className="text-accentGreen" />
          <h2 className="text-xl font-bold text-textPrimary">Check your email</h2>
          <p className="text-sm text-textMuted">We sent a password reset link to <strong>{email}</strong></p>
          <Link to="/auth/login" className="text-accentGreen text-sm font-medium">Back to Login</Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-textPrimary mb-2">Reset Password</h1>
          <p className="text-sm text-textMuted mb-8 text-center">Enter your email and we'll send you a reset link.</p>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
              Send Reset Email
            </Button>
          </form>
          <Link to="/auth/login" className="text-sm text-textMuted hover:text-textPrimary mt-4">
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
}
