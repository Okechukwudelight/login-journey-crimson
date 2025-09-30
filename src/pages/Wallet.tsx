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
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

const Wallet = () => {
  const [hasWallet, setHasWallet] = useState(false);
  const { tokens, loading } = useTokens();
  const { profile } = useProfile();
  const { wallet, disconnect } = useWalletConnection();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [sendOpen, setSendOpen] = useState(false);
  const [recvOpen, setRecvOpen] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.ethereum) return;
    if (!ethers.isAddress(toAddress)) {
      toast({ title: 'Invalid address', description: 'Please enter a valid address', variant: 'destructive' });
      return;
    }
    const value = Number(amount);
    if (!value || value <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a positive amount', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({ to: toAddress, value: ethers.parseEther(String(value)) });
      await tx.wait();
      toast({ title: 'Sent', description: `Tx: ${tx.hash.slice(0, 10)}...` });
      setSendOpen(false);
      setToAddress("");
      setAmount("");
    } catch (err: any) {
      toast({ title: 'Send failed', description: err?.message || 'Transaction error', variant: 'destructive' });
    } finally {
      setSending(false);
    }
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
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="icon" onClick={() => disconnect()} aria-label="Disconnect Wallet">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
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
                  <Dialog open={recvOpen} onOpenChange={setRecvOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-10 px-6 rounded-lg border-[#7D0101] hover:bg-[#7D0101]/10">
                        <span className="text-sm font-medium">Receive</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Your address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label>Wallet address</Label>
                        <Input readOnly value={wallet?.address || ''} onFocus={(e) => e.currentTarget.select()} />
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={sendOpen} onOpenChange={setSendOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-10 px-6 rounded-lg border-[#7D0101] hover:bg-[#7D0101]/10">
                        <span className="text-sm font-medium">Send</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send AVAX</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSend} className="space-y-3">
                        <div className="space-y-1">
                          <Label>To</Label>
                          <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="0x..." />
                        </div>
                        <div className="space-y-1">
                          <Label>Amount (AVAX)</Label>
                          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.1" />
                        </div>
                        <Button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send'}</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
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
                                { (token.token_symbol === 'AVAX' || token.token_symbol === 'Avax') ? (
                                  <img
                                    src={'/src/assets/avalanche-logo.png'}
                                    alt={token.token_symbol}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : token.token_image ? (
                                  <img 
                                    src={token.token_image} 
                                    alt={token.token_symbol} 
                                    className="w-10 h-10 rounded-full" 
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                    {token.token_symbol?.slice(0, 3) || 'TOK'}
                                  </div>
                                )}
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