import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useToast } from './use-toast';
import { useProfile } from './useProfile';
import { useTokens } from './useTokens';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface WalletInfo {
  address: string;
  provider: string;
}

export const useWalletConnection = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { updateWalletAddress } = useProfile();
  const { fetchTokensFromWallet } = useTokens();

  // Load wallet from localStorage on mount
  useState(() => {
    const savedWallet = localStorage.getItem('walletConnection');
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    }
  });

  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      });
      return false;
    }

    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check if this wallet address is already registered
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('wallet_address', address)
        .single();

      if (!existingProfile) {
        toast({
          title: "Wallet Not Registered",
          description: "This wallet address is not linked to any account. Please sign up with email/password or Google first, then link your wallet.",
          variant: "destructive",
        });
        return false;
      }

      // If user is logged in but trying to connect a different wallet
      if (user && existingProfile.user_id !== user.id) {
        toast({
          title: "Wallet Belongs to Another Account",
          description: "This wallet is linked to a different account. Please use the correct wallet or sign in to the associated account.",
          variant: "destructive",
        });
        return false;
      }

      // If user is not logged in but wallet is registered, require login first
      if (!user) {
        toast({
          title: "Please Sign In First",
          description: "This wallet is registered. Please sign in to your account first, then connect your wallet.",
          variant: "destructive",
        });
        return false;
      }

      const walletInfo = { address, provider: 'MetaMask' };
      setWallet(walletInfo);
      localStorage.setItem('walletConnection', JSON.stringify(walletInfo));
      
      // Save wallet address to user profile and fetch tokens
      await updateWalletAddress(address);
      await fetchTokensFromWallet(address);
      
      toast({
        title: "Connected",
        description: `Connected to MetaMask: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      });
      return false;
    } finally {
      setConnecting(false);
    }
  }, [toast, user, updateWalletAddress, fetchTokensFromWallet]);

  const connectCoreWallet = useCallback(async () => {
    // Check for Core Wallet (Avalanche Core)
    if (!window.ethereum || !window.ethereum.isAvalanche) {
      toast({
        title: "Core Wallet Not Found",
        description: "Please install Core Wallet to continue",
        variant: "destructive",
      });
      return false;
    }

    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check if this wallet address is already registered
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('wallet_address', address)
        .single();

      if (!existingProfile) {
        toast({
          title: "Wallet Not Registered",
          description: "This wallet address is not linked to any account. Please sign up with email/password or Google first, then link your wallet.",
          variant: "destructive",
        });
        return false;
      }

      // If user is logged in but trying to connect a different wallet
      if (user && existingProfile.user_id !== user.id) {
        toast({
          title: "Wallet Belongs to Another Account",
          description: "This wallet is linked to a different account. Please use the correct wallet or sign in to the associated account.",
          variant: "destructive",
        });
        return false;
      }

      // If user is not logged in but wallet is registered, require login first
      if (!user) {
        toast({
          title: "Please Sign In First",
          description: "This wallet is registered. Please sign in to your account first, then connect your wallet.",
          variant: "destructive",
        });
        return false;
      }

      const walletInfo = { address, provider: 'Core Wallet' };
      setWallet(walletInfo);
      localStorage.setItem('walletConnection', JSON.stringify(walletInfo));
      
      // Save wallet address to user profile and fetch tokens
      await updateWalletAddress(address);
      await fetchTokensFromWallet(address);
      
      toast({
        title: "Connected",
        description: `Connected to Core Wallet: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Core Wallet",
        variant: "destructive",
      });
      return false;
    } finally {
      setConnecting(false);
    }
  }, [toast, user, updateWalletAddress, fetchTokensFromWallet]);

  return {
    wallet,
    connecting,
    connectMetaMask,
    connectCoreWallet,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}