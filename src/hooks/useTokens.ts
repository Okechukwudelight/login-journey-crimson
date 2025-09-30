import { useState, useEffect } from 'react';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
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

export interface ActivityItem {
  hash: string;
  timeStamp: number;
  from: string;
  to: string;
  valueEth: string;
  type: 'transfer' | 'receive' | 'send';
}

// Simple in-memory cache for AVAX USD price
let _cachedAvaxPrice = 0;
let _cachedAvaxPriceTs = 0;

export const useTokens = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const fetchAvaxUsdPrice = async (): Promise<number> => {
    // Serve cached (memory or localStorage) if fetched within last 5 minutes
    const now = Date.now();
    if (now - _cachedAvaxPriceTs < 5 * 60 * 1000 && _cachedAvaxPrice > 0) {
      return _cachedAvaxPrice;
    }
    try {
      const ls = localStorage.getItem('avaxUsdPrice');
      if (ls) {
        const { usd, ts } = JSON.parse(ls);
        if (now - ts < 5 * 60 * 1000 && usd > 0) {
          _cachedAvaxPrice = usd;
          _cachedAvaxPriceTs = ts;
          return usd;
        }
      }
    } catch {}

    // Try Coinbase spot price (generally CORS-friendly)
    const tryCoinbase = async () => {
      const res = await fetch('https://api.coinbase.com/v2/prices/AVAX-USD/spot');
      if (!res.ok) throw new Error('coinbase');
      const data = await res.json();
      const usd = parseFloat(data?.data?.amount);
      if (!isFinite(usd)) throw new Error('coinbase-parse');
      return usd;
    };

    // Fallback: CryptoCompare
    const tryCryptoCompare = async () => {
      const res = await fetch('https://min-api.cryptocompare.com/data/price?fsym=AVAX&tsyms=USD');
      if (!res.ok) throw new Error('cryptocompare');
      const data = await res.json();
      const usd = parseFloat(data?.USD);
      if (!isFinite(usd)) throw new Error('cryptocompare-parse');
      return usd;
    };

    // Final fallback: 0 (hide USD value)
    const setCache = (usd: number) => {
      _cachedAvaxPrice = usd;
      _cachedAvaxPriceTs = now;
      try {
        localStorage.setItem('avaxUsdPrice', JSON.stringify({ usd, ts: now }));
      } catch {}
      return usd;
    };

    try {
      const usd = await tryCoinbase();
      return setCache(usd);
    } catch {}
    try {
      const usd = await tryCryptoCompare();
      return setCache(usd);
    } catch {}
    return setCache(0);
  };

  const fetchTokensFromWallet = async (walletAddress: string) => {
    if (!walletAddress || !user) return;

    setLoading(true);
    try {
      // Connect to Avalanche C-Chain mainnet
      const provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
      
      // Get AVAX balance
      const avaxBalance = await provider.getBalance(walletAddress);
      const avaxBalanceFormatted = ethers.formatEther(avaxBalance);
      const avaxPrice = await fetchAvaxUsdPrice();
      const avaxUsd = avaxPrice ? parseFloat(avaxBalanceFormatted) * avaxPrice : 0;
      // Build in-memory tokens list (no DB writes)
      const avaxToken: Token = {
        id: 'avax',
        user_id: user.uid,
        token_address: '0x0000000000000000000000000000000000000000',
        token_name: 'Avalanche',
        token_symbol: 'AVAX',
        token_image: '/src/assets/avalanche-logo.png',
        balance: parseFloat(avaxBalanceFormatted),
        usd_value: avaxUsd,
        network: 'avalanche',
      };

      // Merge AVAX into existing tokens without dropping custom tokens
      setTokens((prev) => {
        const withNoAvax = prev.filter(t => t.id !== 'avax');
        return [...withNoAvax, avaxToken];
      });
    } catch (error) {
      console.error('Error fetching tokens from wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async (walletAddress: string) => {
    try {
      // Snowtrace mainnet API (no key, public rate limits apply)
      const url = `https://api.snowtrace.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status !== '1' || !Array.isArray(data.result)) {
        setActivity([]);
        return;
      }
      const items: ActivityItem[] = data.result.slice(0, 20).map((tx: any) => {
        const valueEth = ethers.formatEther(tx.value || '0');
        const type: ActivityItem['type'] = tx.to?.toLowerCase() === walletAddress.toLowerCase() ? 'receive' : 'send';
        return {
          hash: tx.hash,
          timeStamp: Number(tx.timeStamp) * 1000,
          from: tx.from,
          to: tx.to,
          valueEth,
          type,
        };
      });
      setActivity(items);
    } catch {
      setActivity([]);
    }
  };

  // Deprecated DB-backed fetch; keeping stub for compatibility
  const fetchUserTokens = async () => {
    return;
  };

  const fetchTokenImageFromCoinGecko = async (tokenAddress: string, symbol: string) => {
    try {
      // Try several sources tolerant of testnet contracts
      // 1) Trust Wallet assets repo (may not exist for testnet)
      try {
        const tw = await fetch(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/assets/${tokenAddress.toLowerCase()}/logo.png`);
        if (tw.ok) return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/assets/${tokenAddress.toLowerCase()}/logo.png`;
      } catch {}

      // 2) DexScreener token image proxy
      try {
        const ds = await fetch(`https://cdn.dextools.io/tokens/avalanchec/${tokenAddress.toLowerCase()}.png`);
        if (ds.ok) return `https://cdn.dextools.io/tokens/avalanchec/${tokenAddress.toLowerCase()}.png`;
      } catch {}

      // 3) CoinGecko by contract (often 404 for testnet)
      try {
        const contractResponse = await fetch(`https://api.coingecko.com/api/v3/coins/avalanche/contract/${tokenAddress.toLowerCase()}`);
        if (contractResponse.ok) {
          const contractData = await contractResponse.json();
          if (contractData.image?.large || contractData.image?.small || contractData.image?.thumb) {
            return contractData.image.large || contractData.image.small || contractData.image.thumb;
          }
        }
      } catch {}
      
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
      try {
        const nameSearchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${tokenAddress}`);
        if (nameSearchResponse.ok) {
          const nameSearchData = await nameSearchResponse.json();
          const coin = nameSearchData.coins?.[0];
          if (coin && (coin.large || coin.thumb)) {
            return coin.large || coin.thumb;
          }
        }
      } catch {}
      
      return null;
    } catch (error) {
      console.warn('Could not fetch token image from CoinGecko:', error);
      return null;
    }
  };

  const addCustomToken = async (tokenAddress: string, customImageUrl?: string) => {
    if (!user || !tokenAddress) return null;

    // Validate token address format
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error('Invalid contract address format');
    }

    setLoading(true);
    try {
      // Connect to Avalanche C-Chain mainnet to get token details
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

      // Try to fetch token image from custom or fallbacks
      const tokenImage = customImageUrl || await fetchTokenImageFromCoinGecko(tokenAddress, symbol);

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

      // Append to in-memory token list (no DB writes)
      const token: Token = {
        id: `${symbol}-${tokenAddress.toLowerCase()}`,
        user_id: user.uid,
        token_address: tokenAddress.toLowerCase(),
        token_name: name,
        token_symbol: symbol,
        token_image: tokenImage || undefined,
        balance: balance,
        network: 'avalanche',
      };
      setTokens((prev) => {
        const others = prev.filter(t => t.token_address.toLowerCase() !== tokenAddress.toLowerCase());
        return [...others, token];
      });
      // Persist CA so it survives refresh and gets polled
      try {
        const raw = localStorage.getItem('customTokens');
        const arr = raw ? JSON.parse(raw) : [];
        const set = new Set<string>(Array.isArray(arr) ? arr : []);
        set.add(tokenAddress.toLowerCase());
        localStorage.setItem('customTokens', JSON.stringify(Array.from(set)));
      } catch {}
      // Notify other components (e.g., Wallet) to refresh
      try {
        window.dispatchEvent(new Event('tokensUpdated'));
      } catch {}
      return token;
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
      // Prefer localStorage wallet address set by useWalletConnection
      const saved = localStorage.getItem('walletConnection');
      const addr = saved ? (JSON.parse(saved).address as string) : undefined;
      if (addr) {
        await fetchTokensFromWallet(addr);
      }
    } catch (error) {
      console.error('Error adding AVAX token:', error);
    }
  };

  useEffect(() => {
    if (user) {
      addAvaxToken(); // Populate live AVAX (and appended tokens) from wallet
    } else {
      setTokens([]);
      setActivity([]);
    }
  }, [user]);

  // Real-time-ish updates: throttle to periodic interval to prevent UI flicker
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem('walletConnection');
    const address: string | undefined = saved ? (JSON.parse(saved).address as string) : undefined;
    if (!address) return;

    let isFetching = false;

    const refresh = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        await fetchTokensFromWallet(address);
        await fetchActivity(address);
      } finally {
        isFetching = false;
      }
    };

    const interval = setInterval(refresh, 45000); // 45s throttle
    // Initial fetch on mount
    refresh();

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // React to external token additions (from AddTokenDialog using another hook instance)
  useEffect(() => {
    const handler = async () => {
      const saved = localStorage.getItem('walletConnection');
      const address: string | undefined = saved ? (JSON.parse(saved).address as string) : undefined;
      if (address) {
        await fetchTokensFromWallet(address);
      }
    };
    window.addEventListener('tokensUpdated', handler);
    return () => window.removeEventListener('tokensUpdated', handler);
  }, [user]);

  return {
    tokens,
    loading,
    fetchTokensFromWallet,
    fetchUserTokens,
    addCustomToken,
    addAvaxToken,
    activity,
  };
};