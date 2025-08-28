"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamRegistrationForm } from "@/components/team-registration-form";
import { TeamLoginForm } from "@/components/team-login-form";
import { AdminLoginForm } from "@/components/admin-login-form";

export function LandingPage() {
  const [activeForm, setActiveForm] = useState<"none" | "register" | "login" | "admin">("none");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              FSV<br />UK
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            FSV UK
            <br />
            <span className="text-primary">SCAVENGER HUNT</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Join the adventure and complete challenges with your team!
          </p>
        </div>

        {/* Action Buttons */}
        {activeForm === "none" && (
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Choose an option below to begin your scavenger hunt journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setActiveForm("register")}
                className="w-full h-12 text-base"
                size="lg"
              >
                Team Registration
              </Button>
              <Button 
                onClick={() => setActiveForm("login")}
                variant="outline"
                className="w-full h-12 text-base"
                size="lg"
              >
                Team Login
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setActiveForm("admin")}
                variant="secondary"
                className="w-full h-10 text-sm bg-[#BB133A] hover:bg-[#9A0F2E] text-white"
                size="lg"
              >
                🔑 Admin Access
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        {activeForm === "register" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Team Registration</CardTitle>
              <CardDescription>
                Create a new team account to start participating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamRegistrationForm onBack={() => setActiveForm("none")} />
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        {activeForm === "login" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Team Login</CardTitle>
              <CardDescription>
                Sign in to your existing team account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamLoginForm onBack={() => setActiveForm("none")} />
            </CardContent>
          </Card>
        )}

        {/* Admin Login Form */}
        {activeForm === "admin" && (
          <AdminLoginForm onBack={() => setActiveForm("none")} />
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 FSV UK. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
