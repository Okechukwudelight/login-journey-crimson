import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { doc, setDoc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
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

      // Save AVAX token to Firestore (use deterministic doc id)
      const tokenId = `${user.uid}_0x0000000000000000000000000000000000000000`;
      await setDoc(doc(db, 'user_tokens', tokenId), {
        user_id: user.uid,
        token_address: '0x0000000000000000000000000000000000000000',
        token_name: 'Avalanche',
        token_symbol: 'AVAX',
        token_image: '/src/assets/avalanche-logo.png',
        balance: parseFloat(avaxBalanceFormatted),
        network: 'avalanche',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }, { merge: true });

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
      const tokensRef = collection(db, 'user_tokens');
      try {
        const q = query(tokensRef, where('user_id', '==', user.uid), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as any[];
        setTokens(rows || []);
      } catch (err: any) {
        // Fallback if composite index is not yet created
        if (typeof err?.message === 'string' && err.message.includes('index')) {
          const qNoOrder = query(tokensRef, where('user_id', '==', user.uid));
          const snap = await getDocs(qNoOrder);
          const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as any[];
          setTokens(rows || []);
        } else {
          throw err;
        }
      }
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
      const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
      const profile = profileSnap.exists() ? profileSnap.data() as any : null;

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

      const tokenId = `${user.uid}_${tokenAddress.toLowerCase()}`;
      await setDoc(doc(db, 'user_tokens', tokenId), {
        user_id: user.uid,
        token_address: tokenAddress.toLowerCase(),
        token_name: name,
        token_symbol: symbol,
        token_image: tokenImage,
        balance: balance,
        network: 'avalanche',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }, { merge: true });

      await fetchUserTokens();
      const saved = await getDoc(doc(db, 'user_tokens', tokenId));
      return saved.exists() ? { id: saved.id, ...(saved.data() as any) } : null;
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
      const tokenId = `${user.uid}_0x0000000000000000000000000000000000000000`;
      const existingToken = await getDoc(doc(db, 'user_tokens', tokenId));
      if (existingToken.exists()) return; // AVAX already exists

      // Get user's wallet address to check AVAX balance
      const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
      const profile = profileSnap.exists() ? profileSnap.data() as any : null;

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
      await setDoc(doc(db, 'user_tokens', tokenId), {
        user_id: user.uid,
        token_address: '0x0000000000000000000000000000000000000000',
        token_name: 'Avalanche',
        token_symbol: 'AVAX',
        token_image: '/src/assets/avalanche-logo.png',
        balance: balance,
        network: 'avalanche',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { merge: true });

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