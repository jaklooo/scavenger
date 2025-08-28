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
    },
    {
      title: "Our Gallery",
      description: "View your team's uploaded media",
      icon: Camera,
      href: "/gallery",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Team Profile",
      description: "Manage your team settings",
      icon: User,
      href: "/profile",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">FSV UK</h1>
              <p className="text-primary-200">Scavenger Hunt</p>
            </div>
            <div className="flex space-x-2">
              {isAdmin && (
                <Button
                  onClick={() => router.push("/admin")}
                  variant="secondary"
                  size="sm"
                  className="text-primary bg-white/90 hover:bg-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Welcome back, {userData?.displayName}!
            </h2>
            {userData?.teamId && (
              <p className="text-primary-200">
                Ready to continue your adventure?
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="max-w-lg mx-auto p-6 space-y-4">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.title}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
              onClick={() => router.push(item.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}

        {/* Team Info Card */}
        {userData?.teamId && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Team Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team ID:</span>
                  <span className="font-mono text-xs">{userData.teamId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="capitalize">{userData.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{userData.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
