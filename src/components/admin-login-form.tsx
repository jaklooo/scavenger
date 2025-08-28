"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

interface AdminLoginFormProps {
  onBack: () => void;
}

export function AdminLoginForm({ onBack }: AdminLoginFormProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check admin credentials
    if (credentials.username !== "admin" || credentials.password !== "fsv12345") {
      toast.error("Invalid admin credentials");
      return;
    }

    setIsLoading(true);
    try {
      // Sign in with pre-created admin account  
      await signIn("admin@fsv-uk-scave.com", "fsv12345");
      toast.success("Admin login successful!");
      router.push("/admin");
    } catch (error: any) {
      console.error("Admin login error:", error);
      
      // If admin account doesn't exist, create it
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          await signUp("admin@fsv-uk-scave.com", "fsv12345", "Admin User");
          toast.success("Admin account created and logged in!");
          router.push("/admin");
        } catch (createError: any) {
          console.error("Failed to create admin account:", createError);
          toast.error("Admin setup failed - contact developer");
        }
      } else {
        toast.error("Admin login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to options
      </Button>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#BB133A]">Admin Login</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Enter admin credentials to access management features
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#BB133A] hover:bg-[#9A0F2E] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In as Admin"}
            </Button>
          </form>

          <div className="text-xs text-center text-muted-foreground">
            🔒 Secure admin access for FSV UK Scavenger Hunt
          </div>
        </div>
      </Card>
    </div>
  );
}
