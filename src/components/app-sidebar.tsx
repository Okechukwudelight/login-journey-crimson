import { Home, Bell, Wallet, User, Search, MessageCircle, MoreHorizontal } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "More", url: "/more", icon: MoreHorizontal },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar className="w-64 bg-background border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-16">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                     <NavLink 
                       to={item.url} 
                       className={({ isActive }) => 
                         `flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 text-xl font-bold ${
                           isActive 
                             ? "bg-primary/10 text-primary" 
                             : "hover:bg-muted/50 text-foreground"
                         }`
                       }
                     >
                      <item.icon className="h-7 w-7 font-bold" strokeWidth={2.5} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <NavLink 
          to="/profile"
          className={({ isActive }) => 
            `flex items-center gap-3 p-3 rounded-full transition-all duration-200 ${
              isActive 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-muted/50"
            }`
          }
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Profile</span>
            <span className="text-xs text-muted-foreground">@username</span>
          </div>
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}