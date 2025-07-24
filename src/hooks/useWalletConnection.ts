import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useToast } from './use-toast';

interface WalletInfo {
  address: string;
  provider: string;
}

export const useWalletConnection = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

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

      setWallet({ address, provider: 'MetaMask' });
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
  }, [toast]);

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

      setWallet({ address, provider: 'Core Wallet' });
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
  }, [toast]);

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