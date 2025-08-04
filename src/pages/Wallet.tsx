import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WalletConnect } from "@/components/wallet-connect";
import { useEffect, useState } from "react";
import { useTokens } from "@/hooks/useTokens";
import { useProfile } from "@/hooks/useProfile";
import { AddTokenDialog } from "@/components/add-token-dialog";

const Wallet = () => {
  const [hasWallet, setHasWallet] = useState(false);
  const { tokens, loading } = useTokens();
  const { profile } = useProfile();

  useEffect(() => {
    // Check if user has connected wallet
    const walletConnection = localStorage.getItem('walletConnection');
    setHasWallet(!!walletConnection);
  }, []);

  // Calculate total portfolio value
  const portfolioValue = tokens.reduce((total, token) => {
    return total + (token.usd_value || 0);
  }, 0);

  if (!hasWallet) {
    return <WalletConnect />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Portfolio Value and Action Buttons */}
              <div className="space-y-4">
                <Card className="bg-card/50 border border-border/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
                    <p className="text-2xl font-bold">${portfolioValue.toFixed(2)}</p>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-10 px-6 rounded-lg border-[#7D0101] hover:bg-[#7D0101]/10">
                    <span className="text-sm font-medium">Deposit</span>
                  </Button>
                  <Button variant="outline" className="h-10 px-6 rounded-lg border-[#7D0101] hover:bg-[#7D0101]/10">
                    <span className="text-sm font-medium">Withdraw</span>
                  </Button>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="tokens" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="tokens">Tokens</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tokens" className="space-y-4">
                  {loading ? (
                    <Card className="border border-border/50">
                      <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">Loading tokens...</p>
                      </CardContent>
                    </Card>
                  ) : tokens.length === 0 ? (
                    <Card className="border border-border/50">
                      <CardContent className="p-6">
                        <p className="text-center text-muted-foreground">No tokens found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    tokens.map((token) => (
                      <Card key={token.id} className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <img 
                                  src={token.token_image || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop&crop=center"} 
                                  alt={token.token_symbol} 
                                  className="w-10 h-10 rounded-full" 
                                />
                              </div>
                              <div>
                                <p className="font-medium">{token.token_symbol}</p>
                                <p className="text-sm text-muted-foreground">{token.token_name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{token.balance.toFixed(6)}</p>
                              <p className="text-sm text-muted-foreground">
                                ${token.usd_value ? token.usd_value.toFixed(2) : '0.00'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <Card className="border border-border/50">
                    <CardContent className="p-6">
                      <p className="text-center text-muted-foreground">No recent activity</p>
                    </CardContent>
                  </Card>
                 </TabsContent>
               </Tabs>
               
               {/* Add Token Button */}
               <div className="mt-6">
                 <AddTokenDialog />
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

export default Wallet;