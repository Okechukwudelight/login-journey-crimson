import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import googleLogo from "@/assets/google-logo.png";
import metamaskLogo from "@/assets/metamask-logo.svg";
import coreWalletLogo from "/lovable-uploads/e86c25ac-3589-408e-a716-131ab21a5d5c.png";

const Signin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="text-muted-foreground mt-2">Welcome back to your account</p>
        </div>

        <form className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          {/* Sign In Button */}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        {/* Continue With Section */}
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Continue with
          </div>
          
          {/* Social Login Options */}
          <div className="flex justify-center items-center gap-6">
            <button className="flex items-center justify-center w-12 h-12 rounded-lg border border-border hover:bg-accent transition-colors">
              <img src={googleLogo} alt="Google" className="w-6 h-6" />
            </button>
            <button className="flex items-center justify-center w-12 h-12 rounded-lg border border-border hover:bg-accent transition-colors">
              <img src={metamaskLogo} alt="MetaMask" className="w-6 h-6" />
            </button>
            <button className="flex items-center justify-center w-12 h-12 rounded-lg border border-border hover:bg-accent transition-colors">
              <img src={coreWalletLogo} alt="Core Wallet" className="w-6 h-6" />
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