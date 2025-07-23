import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Wallet = () => {
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
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Portfolio Value and Action Buttons */}
              <div className="space-y-4">
                <Card className="bg-card/50 border border-border/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
                    <p className="text-2xl font-bold">$0.67</p>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-10 px-6 rounded-lg border-[#7D0101] hover:bg-[#7D0101]/10">
                    <span className="text-sm font-medium">Deposit</span>
                  </Button>
                  <Button variant="outline" className="h-10 px-6 rounded-lg border-[#7D0101] hover:bg-[#7D0101]/10">
                    <span className="text-sm font-medium">Withdraw</span>
                  </Button>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="tokens" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="tokens">Tokens</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tokens" className="space-y-4">
                  {/* AVAX Token */}
                  <Card className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=40&h=40&fit=crop" alt="AVAX" className="w-10 h-10 rounded-full" />
                          </div>
                          <div>
                            <p className="font-medium">AVAX</p>
                            <p className="text-sm text-muted-foreground">Avalanche</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">0.0122</p>
                          <p className="text-sm text-muted-foreground">$0.3</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SENA Token */}
                  <Card className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <img src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=40&h=40&fit=crop" alt="SENA" className="w-10 h-10 rounded-full" />
                          </div>
                          <div>
                            <p className="font-medium">$ENA</p>
                            <p className="text-sm text-muted-foreground">Everyone Needs Avax</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">156.30M</p>
                          <p className="text-sm text-muted-foreground">$0.37</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <Card className="border border-border/50">
                    <CardContent className="p-6">
                      <p className="text-center text-muted-foreground">No recent activity</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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

export default Wallet;