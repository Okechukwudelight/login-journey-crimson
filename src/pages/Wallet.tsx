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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Copy, Check, Download } from "lucide-react";
import QRCode from "react-qr-code";
import definexusLogo from "@/assets/defiweld-logo.jpg";
import avaxLogo from "@/assets/avalanche-logo.png";

const Wallet = () => {
  const [hasWallet, setHasWallet] = useState(false);
  const { tokens, loading, fetchTokensFromWallet, activity } = useTokens();
  const { profile } = useProfile();
  const { wallet, disconnect } = useWalletConnection();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [sendOpen, setSendOpen] = useState(false);
  const [recvOpen, setRecvOpen] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useState<SVGSVGElement | null>(null)[0];
  const [selectedToken, setSelectedToken] = useState<string>('avax');

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
      let txHash = '';
      if (selectedToken === 'avax') {
        const tx = await signer.sendTransaction({ to: toAddress, value: ethers.parseEther(String(value)) });
        await tx.wait();
        txHash = tx.hash;
      } else {
        const erc20Abi = [
          "function decimals() view returns (uint8)",
          "function transfer(address to, uint256 value) returns (bool)"
        ];
        const contract = new ethers.Contract(selectedToken, erc20Abi, signer);
        const decimals: number = await contract.decimals();
        const amountWei = ethers.parseUnits(String(value), decimals);
        const tx = await contract.transfer(toAddress, amountWei);
        await tx.wait();
        txHash = tx.hash;
      }
      toast({ title: 'Sent', description: `Tx: ${txHash.slice(0, 10)}...` });
      if (wallet?.address) {
        // Refresh balances immediately after confirmation
        await fetchTokensFromWallet(wallet.address);
      }
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
                      <div className="space-y-4">
                        <div className="w-full flex justify-center py-2">
                          <div className="bg-white p-2 rounded inline-flex items-center justify-center relative">
                            <QRCode value={wallet?.address ? `ethereum:${wallet.address}@43114` : ''} size={160} id="wallet-qr" />
                            {/* Center logo overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-white rounded-full p-1">
                                <img src={definexusLogo} alt="logo" className="w-8 h-8 object-contain rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full flex justify-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const svg = document.getElementById('wallet-qr');
                              if (!(svg instanceof SVGSVGElement)) return;
                              const serializer = new XMLSerializer();
                              const svgString = serializer.serializeToString(svg);
                              const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                              const url = URL.createObjectURL(svgBlob);
                              const img = new Image();
                              img.onload = () => {
                                const scale = 4; // increase resolution
                                const canvas = document.createElement('canvas');
                                const size = (svg.viewBox && (svg.viewBox.baseVal?.width || 0)) || svg.clientWidth || 144;
                                const margin = Math.floor((size * scale) * 0.08); // 8% margin
                                canvas.width = size * scale + margin * 2;
                                canvas.height = size * scale + margin * 2;
                                const ctx = canvas.getContext('2d');
                                if (!ctx) return;
                                // white background
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.imageSmoothingEnabled = false;
                                ctx.drawImage(img, margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
                                URL.revokeObjectURL(url);
                                // draw center logo
                                const logo = new Image();
                                logo.onload = () => {
                                  const qrDrawSize = canvas.width - margin * 2;
                                  const logoSize = Math.floor(qrDrawSize * 0.18); // ~18% of QR drawable area
                                  const x = (canvas.width - logoSize) / 2;
                                  const y = (canvas.height - logoSize) / 2;
                                  // circular white backdrop and circular crop for logo
                                  const pad = Math.floor(logoSize * 0.15);
                                  const centerX = canvas.width / 2;
                                  const centerY = canvas.height / 2;
                                  const radius = Math.floor((logoSize + pad) / 2);
                                  // draw white circle backdrop
                                  ctx.fillStyle = '#ffffff';
                                  ctx.beginPath();
                                  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                                  ctx.closePath();
                                  ctx.fill();
                                  // clip to circle and draw logo
                                  ctx.save();
                                  ctx.beginPath();
                                  ctx.arc(centerX, centerY, radius - Math.floor(pad / 2), 0, Math.PI * 2);
                                  ctx.closePath();
                                  ctx.clip();
                                  ctx.drawImage(logo, x, y, logoSize, logoSize);
                                  ctx.restore();
                                  canvas.toBlob((blob) => {
                                    if (!blob) return;
                                    const pngUrl = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = pngUrl;
                                    a.download = 'wallet-qr.png';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(pngUrl);
                                  }, 'image/png');
                                };
                                logo.src = definexusLogo as unknown as string;
                              };
                              img.src = url;
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Save QR
                  </Button>
                        </div>
                        <Label>Wallet address</Label>
                        <div className="flex items-center gap-2">
                          <Input readOnly value={wallet?.address || ''} />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={async () => {
                              if (wallet?.address) {
                                try {
                                  await navigator.clipboard.writeText(wallet.address);
                                  toast({ title: 'Copied', description: 'Address copied to clipboard' });
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 1500);
                                } catch (err: any) {
                                  toast({ title: 'Copy failed', description: err?.message || 'Could not copy', variant: 'destructive' });
                                }
                              }
                            }}
                            aria-label="Copy address"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                  </Button>
                        </div>
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
                        <DialogTitle>Send</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSend} className="space-y-3">
                        <div className="space-y-1">
                          <Label>Asset</Label>
                          <Select value={selectedToken} onValueChange={setSelectedToken}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="avax">
                                <div className="flex items-center gap-2">
                                  <img src={avaxLogo} alt="AVAX" className="w-5 h-5 rounded-full" />
                                  <span>AVAX</span>
                                </div>
                              </SelectItem>
                              {tokens.filter(t => t.token_symbol !== 'AVAX').map(t => (
                                <SelectItem key={t.token_address} value={t.token_address}>
                                  <div className="flex items-center gap-2">
                                    {t.token_image ? (
                                      <img src={t.token_image} alt={t.token_symbol} className="w-5 h-5 rounded-full" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-[10px] text-white">
                                        {t.token_symbol?.slice(0, 3) || 'TOK'}
                                      </div>
                                    )}
                                    <span>{t.token_symbol} ({t.balance.toFixed(4)})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>To</Label>
                          <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="0x..." />
                        </div>
                        <div className="space-y-1">
                          <Label>Amount</Label>
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
                  {activity.length === 0 ? (
                  <Card className="border border-border/50">
                    <CardContent className="p-6">
                      <p className="text-center text-muted-foreground">No recent activity</p>
                    </CardContent>
                  </Card>
                  ) : (
                    activity.map((item) => (
                      <Card key={item.hash} className="border border-border/50">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">{item.type}</p>
                            <p className="text-sm text-muted-foreground">{new Date(item.timeStamp).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono">{Number(item.valueEth).toFixed(6)} AVAX</p>
                            <a href={`https://testnet.snowtrace.io/tx/${item.hash}`} target="_blank" rel="noreferrer" className="text-xs text-primary">View</a>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
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