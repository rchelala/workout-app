import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const googleProvider = new GoogleAuthProvider();

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<string> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user.uid;
}

export async function signIn(email: string, password: string): Promise<string> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user.uid;
}

export async function signInWithGoogle(): Promise<{ uid: string; isNew: boolean }> {
  const result = await signInWithPopup(auth, googleProvider);
  // Use Firebase's official isNewUser flag instead of comparing timestamp strings,
  // which can produce false negatives if the timestamps happen to differ by milliseconds.
  const isNew = getAdditionalUserInfo(result)?.isNewUser ?? false;
  return { uid: result.user.uid, isNew };
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
