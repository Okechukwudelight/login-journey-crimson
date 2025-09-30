import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useToast } from './use-toast';
import { useProfile } from './useProfile';
import { useTokens } from './useTokens';
import { useAuth } from './useAuth';
import { db } from '@/integrations/firebase/client';
// Firestore imports kept for future use if needed

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

      // Require sign-in before linking wallet
      if (!user) {
        toast({
          title: "Please Sign In First",
          description: "Please sign in to your account first, then connect your wallet.",
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

      // Require sign-in before linking wallet
      if (!user) {
        toast({
          title: "Please Sign In First",
          description: "Please sign in to your account first, then connect your wallet.",
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

  const disconnect = useCallback(async () => {
    try {
      localStorage.removeItem('walletConnection');
      setWallet(null);
      // Optionally clear wallet address from profile
      await updateWalletAddress('');
      toast({
        title: 'Disconnected',
        description: 'Wallet connection has been removed.',
      });
      // Refresh UI to reflect disconnected state
      if (typeof window !== 'undefined') {
        if (window.location.pathname !== '/wallet') {
          window.location.href = '/wallet';
        } else {
          window.location.reload();
        }
      }
      return true;
    } catch (error: any) {
      toast({
        title: 'Failed to disconnect',
        description: error?.message || 'Please try again',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast, updateWalletAddress]);

  return {
    wallet,
    connecting,
    connectMetaMask,
    connectCoreWallet,
    disconnect,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}