import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Ensure profile exists immediately upon sign-in/signup
      if (currentUser) {
        try {
          const ref = doc(db, 'profiles', currentUser.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            const referralCode = Math.random().toString(36).slice(2, 8).toUpperCase();
            const referralBase = 'https://definexushq.vercel.app/referral';
            const payload = {
              user_id: currentUser.uid,
              email: currentUser.email || '',
              wallet_address: '',
              display_name: '',
              total_dnx_earned: 0,
              referrals_count: 0,
              referral_code: referralCode,
              referral_link: `${referralBase}/${referralCode}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any;
            await setDoc(ref, payload, { merge: true });
          }
        } catch (err) {
          // Non-fatal; profile hook will still try to fetch/create
          console.warn('ensureProfileExists failed:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    localStorage.removeItem('walletConnection');
    window.location.href = '/signin';
    return { error: null } as const;
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};