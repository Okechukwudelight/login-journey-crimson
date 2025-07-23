import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { Bell, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 via-orange-200 to-orange-100">
      <SidebarProvider>
        <div className="flex w-full">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {/* Mobile Header with Notification */}
            <div className="md:hidden flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Bee Game</h1>
              <div className="relative">
                <div className="bg-white/20 rounded-full p-2">
                  <Bell className="h-6 w-6 text-gray-700" />
                </div>
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  3
                </div>
              </div>
            </div>
            
            <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
              {/* Desktop Header */}
              <h1 className="hidden md:block text-3xl font-bold mb-8 text-gray-800 text-center">Bee Game</h1>
              
              {/* Main Bee Circle */}
              <div className="flex flex-col items-center mb-8 md:mb-12">
                <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
                  {/* Outer Circle */}
                  <div className="absolute inset-0 rounded-full border-8 border-orange-200"></div>
                  
                  {/* Middle Circle */}
                  <div className="absolute inset-4 rounded-full border-8 border-orange-100"></div>
                  
                  {/* Inner Circle */}
                  <div className="absolute inset-8 rounded-full bg-white/80 flex flex-col items-center justify-center p-8">
                    <div className="text-center mb-4">
                      <p className="text-gray-600 text-lg font-medium mb-2">Balance</p>
                      <p className="text-4xl md:text-5xl font-bold text-gray-800">736.8262</p>
                      <p className="text-orange-500 text-lg font-medium mt-2 flex items-center justify-center gap-1">
                        🐝 0.00 BEE/hr
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>1/5</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bee Icon at bottom */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center">
                    <span className="text-white text-2xl">🐝</span>
                  </div>
                </div>
              </div>

              {/* Game Status */}
              <div className="text-center mb-6">
                <p className="text-gray-700 text-lg font-medium mb-4">
                  Earn a Bee in game, future's not the same!
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-xl font-mono">00:00:00</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 max-w-xs mx-auto">
                  <Progress value={20} className="h-2" />
                </div>
              </div>

              {/* Invite Section */}
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 mx-4 md:mx-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-400 rounded-full p-3">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                      <p className="text-gray-800 font-medium text-lg">
                        1 more friend = 25% bonus
                      </p>
                      <p className="text-gray-700">rate, uncapped!</p>
                    </div>
                  </div>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium">
                    Invite Now →
                  </Button>
                </div>
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

export default Home;