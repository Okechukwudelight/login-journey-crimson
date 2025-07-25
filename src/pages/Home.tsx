import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { MobileUserMenu } from "@/components/mobile-user-menu";
import { Bell, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
const definexusLogo = "/lovable-uploads/bf68da2b-8484-42fd-bf25-c6cfa88cbe26.png";

const Home = () => {
  const { user, loading } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [dnxRate, setDnxRate] = useState(0.00000);
  const [totalDnxEarned, setTotalDnxEarned] = useState(0);

  // Check for existing mining session on component mount
  useEffect(() => {
    if (user) {
      checkExistingMiningSession();
    }
  }, [user]);

  // Timer effect - MUST be before any conditional returns
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            completeMiningSession();
            return 0;
          }
          return prev - 1;
        });
        // Increase DNX rate every second - 0.02 DNX per hour = 0.02/3600 per second
        setDnxRate((prev) => prev + (0.02 / 3600));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const checkExistingMiningSession = async () => {
    if (!user) return;

    const { data: activeSessions, error } = await supabase
      .from('mining_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking mining session:', error);
      return;
    }

    if (activeSessions && activeSessions.length > 0) {
      const session = activeSessions[0];
      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);
      const now = new Date();

      if (now < endTime) {
        // Session is still active
        const remainingSeconds = Math.floor((endTime.getTime() - now.getTime()) / 1000);
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const currentRate = (elapsedSeconds / 3600) * 0.02; // 0.02 DNX per hour

        setTimeLeft(remainingSeconds);
        setIsRunning(true);
        setDnxRate(currentRate);
        setTotalDnxEarned(session.dnx_earned);
      } else {
        // Session has expired, mark as completed
        await completeMiningSession(session.id);
      }
    }
  };

  const completeMiningSession = async (sessionId?: string) => {
    if (!user) return;

    const finalDnxEarned = 0.48; // 24 hours * 0.02 DNX/hour

    if (sessionId) {
      // Update existing session
      await supabase
        .from('mining_sessions')
        .update({
          is_active: false,
          dnx_earned: finalDnxEarned
        })
        .eq('id', sessionId);
    } else {
      // Update current active session
      await supabase
        .from('mining_sessions')
        .update({
          is_active: false,
          dnx_earned: finalDnxEarned
        })
        .eq('user_id', user.id)
        .eq('is_active', true);
    }

    setIsRunning(false);
    setDnxRate(0.00000);
    setTimeLeft(0);
    setTotalDnxEarned(prev => prev + finalDnxEarned);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/signin';
    return null;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    if (!user || isRunning) return;

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { error } = await supabase
      .from('mining_sessions')
      .insert({
        user_id: user.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        dnx_earned: 0,
        is_active: true
      });

    if (error) {
      console.error('Error starting mining session:', error);
      return;
    }

    setTimeLeft(86400); // 24 hours = 86400 seconds
    setIsRunning(true);
    setDnxRate(0.00000);
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <SidebarProvider>
        <div className="flex w-full">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
            {/* Mobile Header with Notification only */}
            <div className="md:hidden flex justify-end items-center mb-6">
              <div className="relative">
                <div className="bg-white/20 rounded-full p-2">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  3
                </div>
              </div>
            </div>
            
            <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl">
              
              {/* Main Bee Circle */}
              <div className="flex flex-col items-center mb-8 md:mb-12">
                <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
                  {/* Outer Circle */}
                  <div className="absolute inset-0 rounded-full border-8" style={{ borderColor: '#7D0101' }}></div>
                  
                  {/* Middle Circle */}
                  <div className="absolute inset-4 rounded-full border-8" style={{ borderColor: '#9D2525' }}></div>
                  
                  {/* Inner Circle */}
                  <div className="absolute inset-8 rounded-full bg-white/80 flex flex-col items-center justify-center p-8">
                    <div className="text-center mb-4">
                      <p className="text-gray-600 text-lg font-medium mb-2">Balance</p>
                      <p className="text-4xl md:text-5xl font-bold text-gray-800">0</p>
                      <p className="text-lg font-medium mt-2 flex items-center justify-center gap-1" style={{ color: '#7D0101' }}>
                        {dnxRate.toFixed(5)} DNX/hr
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>0/5</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Definexus Logo at bottom - clickable to start timer */}
                  <button 
                    onClick={handleStartTimer}
                    disabled={isRunning}
                    className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-1/2 rounded-full w-16 h-16 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 ${isRunning ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: '#7D0101' }}
                  >
                    <img src={definexusLogo} alt="Definexus" className="w-10 h-10" />
                  </button>
                </div>
              </div>

              {/* Game Status */}
              <div className="text-center mb-6">
              <p className="text-primary text-lg font-medium mb-4">
                Earn $DNX in game, future's not the same!
              </p>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
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