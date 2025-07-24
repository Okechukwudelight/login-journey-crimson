import { Button } from "@/components/ui/button";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import metamaskLogo from "@/assets/metamask-logo.svg";
import coreWalletLogo from "/lovable-uploads/e86c25ac-3589-408e-a716-131ab21a5d5c.png";

export function WalletConnect() {
  const { connectMetaMask, connectCoreWallet, connecting } = useWalletConnection();

  const handleMetaMaskConnect = async () => {
    const success = await connectMetaMask();
    if (success) {
      window.location.reload();
    }
  };

  const handleCoreWalletConnect = async () => {
    const success = await connectCoreWallet();
    if (success) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Connect Wallet</h1>
          <p className="text-muted-foreground mt-2">Choose your preferred wallet to continue</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleMetaMaskConnect}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-3 h-12"
            variant="outline"
          >
            <img src={metamaskLogo} alt="MetaMask" className="w-6 h-6" />
            Connect MetaMask
          </Button>

          <Button
            onClick={handleCoreWalletConnect}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-3 h-12"
            variant="outline"
          >
            <img src={coreWalletLogo} alt="Core Wallet" className="w-6 h-6" />
            Connect Core Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}