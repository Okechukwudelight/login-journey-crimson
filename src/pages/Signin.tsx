import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useAuth } from "@/hooks/useAuth";
import googleLogo from "@/assets/google-logo.png";
import metamaskLogo from "@/assets/metamask-logo.svg";
import coreWalletLogo from "/lovable-uploads/e86c25ac-3589-408e-a716-131ab21a5d5c.png";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { connectMetaMask, connectCoreWallet, connecting } = useWalletConnection();
  const { user } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      window.location.href = "/home";
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Welcome back!",
        });
        window.location.href = "/home";
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMetaMaskConnect = async () => {
    const success = await connectMetaMask();
    if (success) {
      window.location.href = "/home";
    }
  };

  const handleCoreWalletConnect = async () => {
    const success = await connectCoreWallet();
    if (success) {
      window.location.href = "/home";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="text-muted-foreground mt-2">Welcome back to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Sign In Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Continue With Section */}
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Continue with
          </div>
          
          {/* Social Login Options */}
          <div className="flex justify-center items-center gap-6">
            <button 
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center w-12 h-12 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <img src={googleLogo} alt="Google" className="w-6 h-6 rounded-full" />
            </button>
            <button 
              onClick={handleMetaMaskConnect}
              disabled={connecting}
              className="flex items-center justify-center w-12 h-12 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
            >
              <img src={metamaskLogo} alt="MetaMask" className="w-6 h-6 rounded-full" />
            </button>
            <button 
              onClick={handleCoreWalletConnect}
              disabled={connecting}
              className="flex items-center justify-center w-12 h-12 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50"
            >
              <img src={coreWalletLogo} alt="Core Wallet" className="w-6 h-6 rounded-full" />
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <a href="/signup" className="text-primary hover:text-primary/80 transition-colors">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signin;