import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronDown, ArrowDownUp, Info, Search, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useTokens } from "@/hooks/useTokens";
import { AddTokenDialog } from "@/components/add-token-dialog";

const Swap = () => {
  const [isSwapped, setIsSwapped] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [selectedFromToken, setSelectedFromToken] = useState<string>("avax");
  const [selectedToToken, setSelectedToToken] = useState<string>("usdt");
  const { tokens } = useTokens();

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
          <p className="text-muted-foreground">Please connect your wallet to access swap features.</p>
        </div>
      </div>
    );
  }

  // Get user's AVAX balance
  const avaxToken = tokens.find(token => token.token_symbol === 'AVAX');
  const avaxBalance = avaxToken ? avaxToken.balance : 0;

  // Get selected token details
  const fromToken = tokens.find(token => 
    selectedFromToken === 'avax' ? token.token_symbol === 'AVAX' : token.id === selectedFromToken
  ) || { balance: 0, token_symbol: 'AVAX', token_image: '/lovable-uploads/eed6b042-1aa0-4ad2-bda2-0ba7736494c6.png' };

  const toToken = tokens.find(token => 
    selectedToToken === 'usdt' ? token.token_symbol === 'USDT' : 
    selectedToToken === 'usdc' ? token.token_symbol === 'USDC' : 
    token.id === selectedToToken
  );

  const handleSwap = () => {
    setIsSwapped(!isSwapped);
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
            <div className="max-w-md mx-auto w-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pt-16">
                <h1 className="text-xl font-bold">Pay & Receive</h1>
              </div>

              {/* Swap Container */}
              <div className="rounded-xl bg-card/50 p-4 space-y-4">
                {/* You'll Pay Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>You'll pay</span>
                    <span>Balance: {fromToken.balance.toFixed(6)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                    {!isSwapped ? (
                      <div className="flex items-center gap-2">
                        <img src={fromToken.token_image || "/lovable-uploads/eed6b042-1aa0-4ad2-bda2-0ba7736494c6.png"} alt="AVAX" className="w-6 h-6 rounded-full" />
                        <span className="font-medium">AVAX</span>
                      </div>
                    ) : (
                      <Select value={selectedFromToken} onValueChange={setSelectedFromToken}>
                        <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto focus:ring-0 [&>svg]:hidden">
                          <div className="flex items-center gap-2">
                            <img src={fromToken.token_image || "/lovable-uploads/2a45c57a-70e8-4c85-81d7-a9bf54acff10.png"} alt={fromToken.token_symbol} className="w-6 h-6 rounded-full" />
                            <span className="font-medium">{fromToken.token_symbol}</span>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          {tokens.map((token) => (
                            <SelectItem key={token.id} value={token.id}>
                              <div className="flex items-center gap-2">
                                <img src={token.token_image || "/lovable-uploads/2a45c57a-70e8-4c85-81d7-a9bf54acff10.png"} alt={token.token_symbol} className="w-4 h-4 rounded-full" />
                                <span>{token.token_symbol}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <input 
                      type="text" 
                      defaultValue="0"
                      className="text-xl font-medium text-right bg-transparent border-none outline-none focus:ring-0" 
                    />
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-secondary/50 text-xs px-3 py-1 rounded-md">MAX</button>
                  </div>
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center -my-2">
                  <button 
                    onClick={handleSwap}
                    className="bg-background p-3 rounded-full border border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <ArrowDownUp className="h-5 w-5" />
                  </button>
                </div>

                {/* You'll Receive Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>You'll receive</span>
                    <span>Balance: {toToken ? toToken.balance.toFixed(6) : '0.00'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                    {!isSwapped ? (
                      <Select value={selectedToToken} onValueChange={setSelectedToToken}>
                        <SelectTrigger className="w-auto border-none bg-transparent p-0 h-auto focus:ring-0 [&>svg]:hidden">
                          <div className="flex items-center gap-2">
                            <img src={toToken?.token_image || "/lovable-uploads/2a45c57a-70e8-4c85-81d7-a9bf54acff10.png"} alt={toToken?.token_symbol || "USDT"} className="w-6 h-6 rounded-full" />
                            <span className="font-medium">{toToken?.token_symbol || "USDT"}</span>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          <SelectItem value="usdt">
                            <div className="flex items-center gap-2">
                              <img src="/lovable-uploads/2a45c57a-70e8-4c85-81d7-a9bf54acff10.png" alt="USDT" className="w-4 h-4 rounded-full" />
                              <span>USDT</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="usdc">
                            <div className="flex items-center gap-2">
                              <img src="/lovable-uploads/67018b70-553d-4f6e-9045-33cf3d7dd229.png" alt="USDC" className="w-4 h-4 rounded-full" />
                              <span>USDC</span>
                            </div>
                          </SelectItem>
                          {tokens.map((token) => (
                            <SelectItem key={token.id} value={token.id}>
                              <div className="flex items-center gap-2">
                                <img src={token.token_image || "/lovable-uploads/2a45c57a-70e8-4c85-81d7-a9bf54acff10.png"} alt={token.token_symbol} className="w-4 h-4 rounded-full" />
                                <span>{token.token_symbol}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <img src="/lovable-uploads/eed6b042-1aa0-4ad2-bda2-0ba7736494c6.png" alt="AVAX" className="w-6 h-6 rounded-full" />
                        <span className="font-medium">AVAX</span>
                      </div>
                    )}
                    <div className="text-xl font-medium text-right text-cyan-400">
                      0
                    </div>
                  </div>
                </div>

                {/* Rate Info */}
                <div className="flex items-center justify-between text-sm py-2 px-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>1 USDT = 1.00021 AVAX</span>
                    <Info className="h-3 w-3" />
                  </div>
                  <button className="text-muted-foreground flex items-center gap-1">
                    Show details <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Add Token Button */}
                <AddTokenDialog />

                {/* Swap Button */}
                <button className="w-full py-3 rounded-xl bg-[#7D0101] text-white font-medium">
                  Swap Now
                </button>
              </div>
            </div>
          </main>

          {/* Mobile Bottom Navigation - shown only on mobile */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Swap;