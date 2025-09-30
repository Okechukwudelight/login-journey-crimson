import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  user_id: string;
  wallet_address?: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const ref = doc(db, 'profiles', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile({ id: snap.id, ...(snap.data() as any) });
      } else {
        const referralCode = Math.random().toString(36).slice(2, 8).toUpperCase();
        const referralBase = 'https://definexushq.vercel.app/referral';
        const payload = {
          user_id: user.uid,
          email: user.email || '',
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
        const created = await getDoc(ref);
        setProfile(created.exists() ? { id: created.id, ...(created.data() as any) } : null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateProfile = async (updates: Partial<Profile>) => {
    if (!user) return null;

    try {
      const ref = doc(db, 'profiles', user.uid);
      const payload = {
        user_id: user.uid,
        updated_at: new Date().toISOString(),
        ...updates,
      } as any;
      await setDoc(ref, payload, { merge: true });
      const snap = await getDoc(ref);
      const data = snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  };

  const updateWalletAddress = async (walletAddress: string) => {
    return await createOrUpdateProfile({ wallet_address: walletAddress });
  };

  return {
    profile,
    loading,
    fetchProfile,
    createOrUpdateProfile,
    updateWalletAddress
  };
};