import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ethers } from 'ethers';

interface Token {
  id: string;
  user_id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  token_image?: string;
  balance: number;
  usd_value?: number;
  network: string;
}

export const useTokens = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTokensFromWallet = async (walletAddress: string) => {
    if (!walletAddress || !user) return;

    setLoading(true);
    try {
      // Connect to Avalanche network
      const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
      
      // Get AVAX balance
      const avaxBalance = await provider.getBalance(walletAddress);
      const avaxBalanceFormatted = ethers.formatEther(avaxBalance);

      // Save AVAX token to database
      await supabase
        .from('user_tokens')
        .upsert({
          user_id: user.id,
          token_address: '0x0000000000000000000000000000000000000000',
          token_name: 'Avalanche',
          token_symbol: 'AVAX',
          token_image: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
          balance: parseFloat(avaxBalanceFormatted),
          network: 'avalanche'
        })
        .select();

      await fetchUserTokens();
    } catch (error) {
      console.error('Error fetching tokens from wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTokens = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user tokens:', error);
        return;
      }

      setTokens(data || []);
    } catch (error) {
      console.error('Error fetching user tokens:', error);
    }
  };

  const addCustomToken = async (tokenAddress: string) => {
    if (!user || !tokenAddress) return null;

    setLoading(true);
    try {
      // This is a simplified version - in a real app you'd call a contract to get token details
      const { data, error } = await supabase
        .from('user_tokens')
        .upsert({
          user_id: user.id,
          token_address: tokenAddress.toLowerCase(),
          token_name: 'Custom Token',
          token_symbol: 'CUSTOM',
          balance: 0,
          network: 'avalanche'
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding custom token:', error);
        return null;
      }

      await fetchUserTokens();
      return data;
    } catch (error) {
      console.error('Error adding custom token:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserTokens();
    } else {
      setTokens([]);
    }
  }, [user]);

  return {
    tokens,
    loading,
    fetchTokensFromWallet,
    fetchUserTokens,
    addCustomToken
  };
};