import { Home, Bell, Wallet, User, Coins, ArrowUpDown } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Staking", url: "/staking", icon: Coins },
  { title: "Swap", url: "/swap", icon: ArrowUpDown },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Profile", url: "/profile", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-6 w-6" />
          </NavLink>
        ))}
      </div>
    </nav>
  );
}