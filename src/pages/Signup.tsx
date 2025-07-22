import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import googleLogo from "@/assets/google-logo.png";
import metamaskLogo from "@/assets/metamask-logo.svg";
import coreLogo from "@/assets/core-wallet-logo.svg";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign Up</h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
        </div>

        <form className="space-y-4">
          {/* Email Input with Send Code */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pr-20"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Send Code
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
            />
          </div>

          {/* Code Input */}
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter verification code"
            />
          </div>

          {/* Register Button */}
          <Button type="submit" className="w-full">
            Register
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
              <img src={coreLogo} alt="Core Wallet" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <a href="/login" className="text-primary hover:text-primary/80 transition-colors">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;