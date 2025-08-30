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
      color: "bg-blue-50 text-blue-600",
      accent: "bg-blue-100 text-blue-500",
      iconBg: "bg-blue-200",
    },
    {
      title: "Our Gallery",
      description: "View your team's uploaded media",
      icon: Camera,
      href: "/gallery",
      color: "bg-green-50 text-green-600",
      accent: "bg-green-100 text-green-500",
      iconBg: "bg-green-200",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 font-['Inter','Poppins',sans-serif]">
      {/* Header */}
      <div className="w-full flex justify-center px-2 pt-4">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl shadow-lg bg-gradient-to-br from-[#BB133A] to-pink-300 p-5 flex items-center relative overflow-hidden">
            <div className="flex-1">
              <div className="uppercase text-xs tracking-widest text-white/80 font-semibold mb-1">FSV UK – Scavenger Hunt</div>
              <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Welcome back, {userData?.displayName}!</div>
              <div className="text-white/90 text-sm mt-1 font-medium">Ready to continue your adventure? ✨</div>
            </div>
            {/* Illustration/Icon */}
            <div className="ml-2 flex-shrink-0">
              {/* Map/Compass/Magnifier SVG */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
                <circle cx="24" cy="24" r="22" fill="#fff" fillOpacity="0.18" />
                <path d="M24 12l6 18-6-4-6 4 6-18z" stroke="#fff" strokeWidth="2.2" fill="#BB133A"/>
                <circle cx="24" cy="24" r="2.5" fill="#fff" />
              </svg>
            </div>
            {/* Admin/Logout buttons */}
            <div className="absolute top-3 right-4 flex space-x-2">
              {isAdmin && (
                <Button
                  onClick={() => router.push("/admin")}
                  variant="secondary"
                  size="sm"
                  className="text-primary bg-white/90 hover:bg-white rounded-full shadow"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 rounded-full"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
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
              className={`rounded-2xl shadow-md cursor-pointer transition-all duration-200 border border-transparent hover:scale-[1.03] active:scale-95 ${item.color} hover:shadow-xl group flex flex-col items-center justify-center p-4 min-h-[120px]`}
              onClick={() => router.push(item.href)}
            >
              <div className={`rounded-full p-3 mb-2 ${item.accent} group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="text-base font-bold text-gray-800 mb-1 text-center">{item.title}</div>
              <div className="text-xs text-gray-500 text-center">{item.description}</div>
            </div>
          );
        })}
      </div>



      <BottomNavigation />
    </div>
  );
}
