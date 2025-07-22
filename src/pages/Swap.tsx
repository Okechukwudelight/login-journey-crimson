import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { ChevronDown, ArrowDownUp, Info } from "lucide-react";

const Swap = () => {
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
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold">Pay & Receive</h1>
                <button className="flex items-center gap-1 bg-secondary/60 px-3 py-1 rounded-lg text-foreground">
                  Crypto <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Swap Container */}
              <div className="rounded-xl bg-card/50 p-4 space-y-4">
                {/* You'll Pay Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>You'll pay</span>
                    <span>Balance: 0.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">$</div>
                      <span className="font-medium">USDC</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-xl font-medium text-right">1207</div>
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-secondary/50 text-xs px-3 py-1 rounded-md">MAX</button>
                  </div>
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center -my-2">
                  <div className="bg-background p-3 rounded-full border border-border/50">
                    <ArrowDownUp className="h-5 w-5" />
                  </div>
                </div>

                {/* You'll Receive Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>You'll receive</span>
                    <span>Balance: 0.00</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs">T</div>
                      <span className="font-medium">USDT</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-xl font-medium text-right text-cyan-400">1206.73</div>
                  </div>
                </div>

                {/* Rate Info */}
                <div className="flex items-center justify-between text-sm py-2 px-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>1 USDT = 1.00021 USDC</span>
                    <Info className="h-3 w-3" />
                  </div>
                  <button className="text-muted-foreground flex items-center gap-1">
                    Show details <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Swap Button */}
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium">
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