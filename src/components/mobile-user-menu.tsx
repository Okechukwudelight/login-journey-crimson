import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function MobileUserMenu() {
  const [showLogout, setShowLogout] = useState(false);
  const { user, signOut } = useAuth();

  const handleUserClick = () => {
    setShowLogout(!showLogout);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="relative">
      <button onClick={handleUserClick} className="flex items-center">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </button>
      
      {showLogout && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowLogout(false)}
          />
          
          {/* Logout button */}
          <div className="absolute top-12 right-0 z-20">
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </>
      )}
    </div>
  );
}