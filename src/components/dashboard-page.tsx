"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";
import { 
  Map, 
  Camera, 
  User, 
  LogOut, 
  Shield 
} from "lucide-react";

export function DashboardPage() {
  const { userData, signOut, isAdmin } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const dashboardItems = [
    {
      title: "Our Journey",
      description: "View and complete scavenger hunt tasks",
      icon: Map,
      href: "/journey",
    },
    {
      title: "Our Gallery",
      description: "View your team's uploaded media",
      icon: Camera,
      href: "/gallery",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 font-['Inter','Poppins',sans-serif] relative">
      {/* Dashboard Background */}
      <div className="dashboard-bg"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="w-full flex justify-center px-2 pt-8">
          <div className="w-full max-w-lg text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] leading-tight mb-2" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Welcome back, {userData?.displayName}!
            </div>
            <div className="text-[var(--text-secondary)] text-lg font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              Ready to continue your adventure? ✨
            </div>
            {/* Admin/Logout buttons */}
            <div className="flex justify-center space-x-4 mt-4">
              {isAdmin && (
                <Button
                  onClick={() => router.push("/admin")}
                  variant="secondary"
                  size="sm"
                  className="text-primary bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 rounded-full backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="max-w-lg mx-auto px-2 py-6 grid grid-cols-2 gap-4">
          {dashboardItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`rounded-2xl shadow-md cursor-pointer transition-all duration-200 border border-transparent hover:scale-[1.03] active:scale-95 glass-card hover:shadow-xl group flex flex-col items-center justify-center p-4 min-h-[120px]`}
                onClick={() => router.push(item.href)}
              >
                <div className={`rounded-full p-3 mb-2 bg-[var(--secondary-color)]/30 text-[var(--text-primary)] group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] mb-1 text-center">{item.title}</div>
                <div className="text-xs text-[var(--text-secondary)] text-center">{item.description}</div>
              </div>
            );
          })}
        </div>

        <BottomNavigation />
      </div>
    </div>
  );
}
