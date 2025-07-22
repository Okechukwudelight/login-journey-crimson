import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { Bell } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 p-6 pb-20 md:pb-6">
            {/* Mobile Header with Notification */}
            <div className="md:hidden flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Welcome Home</h1>
              <div className="relative">
                <div className="bg-notification rounded-full p-2">
                  <Bell className="h-6 w-6 text-notification-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 bg-[#7D0101] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  3
                </div>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Desktop Header */}
              <h1 className="hidden md:block text-3xl font-bold mb-6">Welcome Home</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
                  <p className="text-muted-foreground">Your account overview and quick stats</p>
                </div>
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                  <p className="text-muted-foreground">Latest transactions and updates</p>
                </div>
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <p className="text-muted-foreground">Frequently used features</p>
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