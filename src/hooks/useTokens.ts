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

  const fetchTokenImageFromCoinGecko = async (tokenAddress: string, symbol: string) => {
    try {
      // First try to get token info by contract address on Avalanche
      const contractResponse = await fetch(`https://api.coingecko.com/api/v3/coins/avalanche/contract/${tokenAddress.toLowerCase()}`);
      if (contractResponse.ok) {
        const contractData = await contractResponse.json();
        if (contractData.image?.large || contractData.image?.small || contractData.image?.thumb) {
          return contractData.image.large || contractData.image.small || contractData.image.thumb;
        }
      }
      
      // If contract lookup fails, search by symbol and filter for Avalanche network
      const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const coin = searchData.coins?.find((coin: any) => 
          coin.symbol.toLowerCase() === symbol.toLowerCase()
        );
        if (coin && (coin.large || coin.thumb)) {
          return coin.large || coin.thumb;
        }
      }
      
      // Additional search by token name if symbol search fails
      const nameSearchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${tokenAddress}`);
      if (nameSearchResponse.ok) {
        const nameSearchData = await nameSearchResponse.json();
        const coin = nameSearchData.coins?.[0];
        if (coin && (coin.large || coin.thumb)) {
          return coin.large || coin.thumb;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Could not fetch token image from CoinGecko:', error);
      return null;
    }
  };

  const addCustomToken = async (tokenAddress: string) => {
    if (!user || !tokenAddress) return null;

    // Validate token address format
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid contract address format');
    }

    setLoading(true);
    try {
      // Connect to Avalanche network to get token details
      const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
      
      // ERC-20 ABI for basic token info
      const erc20Abi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function balanceOf(address) view returns (uint256)"
      ];

      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      
      // Get token details with timeout
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);

      // Try to fetch token image from CoinGecko
      const tokenImage = await fetchTokenImageFromCoinGecko(tokenAddress, symbol);

      // Get user's wallet address from profile to check balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('user_id', user.id)
        .single();

      let balance = 0;
      if (profile?.wallet_address) {
        try {
          const balanceWei = await contract.balanceOf(profile.wallet_address);
          balance = parseFloat(ethers.formatUnits(balanceWei, decimals));
        } catch (balanceError) {
          console.warn('Could not fetch balance for token:', balanceError);
          // Continue with 0 balance if balance fetch fails
        }
      }

      const { data, error } = await supabase
        .from('user_tokens')
        .upsert({
          user_id: user.id,
          token_address: tokenAddress.toLowerCase(),
          token_name: name,
          token_symbol: symbol,
          token_image: tokenImage,
          balance: balance,
          network: 'avalanche'
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      await fetchUserTokens();
      return data;
    } catch (error: any) {
      console.error('Error adding custom token:', error);
      throw new Error(error.message || 'Failed to add token. Please check the contract address.');
    } finally {
      setLoading(false);
    }
  };

  const addAvaxToken = async () => {
    if (!user) return;

    try {
      // Check if AVAX token already exists for this user
      const { data: existingToken } = await supabase
        .from('user_tokens')
        .select('id')
        .eq('user_id', user.id)
        .eq('token_address', '0x0000000000000000000000000000000000000000')
        .single();

      if (existingToken) return; // AVAX already exists

      // Get user's wallet address to check AVAX balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('user_id', user.id)
        .single();

      let balance = 0;
      if (profile?.wallet_address) {
        try {
          const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
          const avaxBalance = await provider.getBalance(profile.wallet_address);
          balance = parseFloat(ethers.formatEther(avaxBalance));
        } catch (error) {
          console.warn('Could not fetch AVAX balance:', error);
        }
      }

      // Add AVAX token
      await supabase
        .from('user_tokens')
        .insert({
          user_id: user.id,
          token_address: '0x0000000000000000000000000000000000000000',
          token_name: 'Avalanche',
          token_symbol: 'AVAX',
          token_image: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
          balance: balance,
          network: 'avalanche'
        });

      await fetchUserTokens();
    } catch (error) {
      console.error('Error adding AVAX token:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserTokens();
      addAvaxToken(); // Automatically add AVAX token
    } else {
      setTokens([]);
    }
  }, [user]);

  return {
    tokens,
    loading,
    fetchTokensFromWallet,
    fetchUserTokens,
    addCustomToken,
    addAvaxToken
  };
};