import { useEffect, useState } from 'react';
import { BottomNav } from "@/components/bottom-nav";

const Staking = () => {
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    // Check if user has connected wallet
    const walletConnection = localStorage.getItem('walletConnection');
    setHasWallet(!!walletConnection);
  }, []);

  if (!hasWallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Wallet Connected</h1>
          <p className="text-muted-foreground">Please connect your wallet to access staking features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Staking</h1>
        {/* Add your staking interface here */}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Staking;