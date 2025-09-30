import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTokens } from "@/hooks/useTokens";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export const AddTokenDialog = () => {
  const [open, setOpen] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { addCustomToken, loading } = useTokens();
  const { wallet } = useWalletConnection();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token contract address",
        variant: "destructive",
      });
      return;
    }

    try {
      await addCustomToken(tokenAddress.trim(), imageUrl.trim() || undefined);
      toast({
        title: "Success",
        description: "Token added successfully!",
      });
      setTokenAddress("");
      setImageUrl("");
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add token",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-lg border-[#7D0101] hover:bg-[#7D0101]/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Token</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {wallet && (
            <div className="text-xs text-muted-foreground break-all">Connected: {wallet.address}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="tokenAddress">Token Contract Address</Label>
            <Input
              id="tokenAddress"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Custom Image URL (optional)</Label>
            <Input
              id="imageUrl"
              placeholder="https://.../logo.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Token"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};