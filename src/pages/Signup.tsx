import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';
import { db } from '@/integrations/firebase/client';
import { doc, setDoc } from 'firebase/firestore';
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useAuth } from "@/hooks/useAuth";
import googleLogo from "@/assets/google-logo.png";
import metamaskLogo from "@/assets/metamask-logo.svg";
import coreWalletLogo from "/lovable-uploads/e86c25ac-3589-408e-a716-131ab21a5d5c.png";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { connectMetaMask, connectCoreWallet, connecting } = useWalletConnection();
  const { user } = useAuth();

  // EmailJS env config
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      window.location.href = "/home";
    }
  }, [user]);

  // Initialize EmailJS
  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);

  // Load countdown from localStorage on component mount
  useEffect(() => {
    const savedCountdown = localStorage.getItem("emailCountdown");
    const savedTimestamp = localStorage.getItem("emailTimestamp");
    
    if (savedCountdown && savedTimestamp) {
      const timeElapsed = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const remainingTime = parseInt(savedCountdown) - timeElapsed;
      
      if (remainingTime > 0) {
        setCountdown(remainingTime);
      } else {
        localStorage.removeItem("emailCountdown");
        localStorage.removeItem("emailTimestamp");
      }
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown - 1 === 0) {
          localStorage.removeItem("emailCountdown");
          localStorage.removeItem("emailTimestamp");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationCode = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const verificationCode = generateVerificationCode();
    setGeneratedCode(verificationCode);

    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error("EmailJS env vars missing: set VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID");
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          email: email,
          to_email: email,
          verification_code: verificationCode,
          reply_to: email,
        }
      );

      toast({
        title: "Code Sent",
        description: "Verification code sent to your email",
      });

      // Start countdown
      setCountdown(10);
      localStorage.setItem("emailCountdown", "10");
      localStorage.setItem("emailTimestamp", Date.now().toString());
    } catch (error) {
      console.error("EmailJS error:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !code) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (code !== generatedCode) {
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Create initial profile document
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        user_id: cred.user.uid,
        email: cred.user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: "Success",
        description: "Account created successfully! Redirecting to home...",
      });
      setTimeout(() => {
        window.location.href = "/home";
      }, 800);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        user_id: cred.user.uid,
        email: cred.user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { merge: true });
      window.location.href = '/home';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || 'Google sign-in failed',
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
          <h1 className="text-2xl font-bold text-foreground">Sign Up</h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input with Send Code */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pr-20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={countdown > 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#7D0101] hover:text-[#7D0101]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `${countdown}s` : "Send Code"}
              </button>
            </div>
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

          {/* Code Input */}
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {/* Register Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
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
              onClick={handleGoogleSignUp}
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

        {/* Sign In Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <a href="/signin" className="text-primary hover:text-primary/80 transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;