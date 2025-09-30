import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet as EthersWallet } from 'ethers';
import { encryptJson, decryptJson } from '@/lib/crypto';
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useAuth } from "@/hooks/useAuth";
import { MoreHorizontal } from "lucide-react";
import metamaskLogo from "@/assets/metamask-logo.svg";
import coreWalletLogo from "/lovable-uploads/e86c25ac-3589-408e-a716-131ab21a5d5c.png";

export function WalletConnect() {
  const { connectMetaMask, connectCoreWallet, connecting } = useWalletConnection();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [confirmIdx, setConfirmIdx] = useState<number[]>([]);
  const [confirmInputs, setConfirmInputs] = useState<string[]>(["", "", ""]);
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<'show'|'confirm'|'secure'|'done'>('show');
  const [creating, setCreating] = useState(false);

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
          <p className="text-muted-foreground mt-2">{user ? 'Choose your preferred wallet to continue' : 'Please sign in first, then connect your wallet'}</p>
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

          <div className="text-center text-xs text-muted-foreground">or</div>

          <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-10" variant="outline">
                <MoreHorizontal className="w-4 h-4 mr-2" />
                More option
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Wallet options</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Button className="w-full h-10" onClick={() => { setMoreOpen(false); setCreateOpen(true); }}>
                  Create new wallet
                </Button>
                <Button className="w-full h-10" variant="outline" onClick={() => { setMoreOpen(false); setCreateOpen(true); setStep('show'); setMnemonic(''); }}>
                  Import secret phrase
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Wallet Flow */}
          <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setMnemonic(null); setStep('show'); setConfirmIdx([]); setConfirmInputs(["","",""]); setPassword(""); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new wallet</DialogTitle>
              </DialogHeader>
              {!mnemonic && step === 'show' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Generate a new 24‑word secret phrase. Store it securely; we cannot recover it.</p>
                  <Button className="w-full" disabled={creating} onClick={async () => {
                    setCreating(true);
                    try {
                      const w = EthersWallet.createRandom();
                      const phrase = w.mnemonic?.phrase || '';
                      setMnemonic(phrase);
                      // Pick three random positions to confirm later
                      const count = phrase.split(' ').length || 24;
                      const idxs = Array.from({length: count}, (_, i) => i);
                      for (let i=idxs.length-1; i>0; i--) { const j = Math.floor(Math.random()* (i+1)); [idxs[i], idxs[j]] = [idxs[j], idxs[i]]; }
                      setConfirmIdx(idxs.slice(0,3).sort((a,b)=>a-b));
                    } finally { setCreating(false); }
                  }}>Generate secret phrase</Button>
                  <div className="text-center text-xs text-muted-foreground">or</div>
                  <div className="space-y-2">
                    <Label>Import existing secret phrase</Label>
                    <Input placeholder="Enter 12/24 words separated by spaces" onChange={(e)=> setMnemonic(e.target.value.trim())} />
                    <Button className="w-full" disabled={!mnemonic || (mnemonic?.split(' ').length ?? 0) < 12} onClick={() => {
                      const count = mnemonic!.split(' ').length;
                      const idxs = Array.from({length: count}, (_, i) => i);
                      for (let i=idxs.length-1; i>0; i--) { const j = Math.floor(Math.random()* (i+1)); [idxs[i], idxs[j]] = [idxs[j], idxs[i]]; }
                      setConfirmIdx(idxs.slice(0,3).sort((a,b)=>a-b));
                      setStep('confirm');
                    }}>Continue</Button>
                  </div>
                </div>
              )}

              {mnemonic && step === 'show' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-md border bg-muted">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {mnemonic.split(' ').map((w, i) => (
                        <div key={i} className="flex items-center gap-2"><span className="text-muted-foreground">{i+1}.</span><span className="font-medium select-all">{w}</span></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Write these 24 words down in order. Never share them.</p>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => setStep('confirm')}>I wrote it down</Button>
                    <Button className="flex-1" variant="outline" onClick={() => navigator.clipboard.writeText(mnemonic!)}>Copy</Button>
                  </div>
                </div>
              )}

              {mnemonic && step === 'confirm' && (
                <div className="space-y-3">
                  <p className="text-sm">Confirm these words to continue.</p>
                  {confirmIdx.map((idx, k) => (
                    <div key={idx} className="space-y-1">
                      <Label>Word #{idx+1}</Label>
                      <Input value={confirmInputs[k]}
                        onChange={(e)=>{
                          const arr=[...confirmInputs]; arr[k]=e.target.value.trim(); setConfirmInputs(arr);
                        }} placeholder="enter word" />
                    </div>
                  ))}
                  <Button className="w-full" onClick={() => {
                    const words = mnemonic!.split(' ');
                    const ok = confirmIdx.every((idx, k) => words[idx].toLowerCase() === (confirmInputs[k]||'').toLowerCase());
                    if (!ok) return;
                    setStep('secure');
                  }}>Continue</Button>
                </div>
              )}

              {mnemonic && step === 'secure' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Protect your wallet with a password. This encrypts your wallet on this device.</p>
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter a strong password" />
                  </div>
                  <Button className="w-full" disabled={password.length < 8} onClick={async () => {
                    try {
                      const payload = { mnemonic };
                      const enc = await encryptJson(payload, password);
                      localStorage.setItem('localWallet', JSON.stringify({ enc, createdAt: Date.now() }));
                      setStep('done');
                    } catch {}
                  }}>Encrypt & save</Button>
                </div>
              )}

              {mnemonic && step === 'done' && (
                <div className="space-y-3">
                  <p className="text-sm">Wallet created. You can now use the Receive and Send actions with this local wallet after unlocking.</p>
                  <Button className="w-full" onClick={() => setCreateOpen(false)}>Done</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}