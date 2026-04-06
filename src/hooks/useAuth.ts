import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/services/userService';
import type { UserProfile } from '@/types/user';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        setState({ user, userProfile: profile, loading: false });
      } else {
        setState({ user: null, userProfile: null, loading: false });
      }
    });
    return unsubscribe;
  }, []);

  return state;
}
