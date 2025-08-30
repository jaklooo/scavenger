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
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: "url('/castle-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Logo and Header */}
      <div className="text-center w-full max-w-md mx-auto mb-8 mt-8">
        <div className="mb-6 flex justify-center">
          <img
            src="/logo-bg.png"
            alt="FSV UK logo"
            className="w-20 h-20 rounded-2xl shadow-lg object-cover"
            style={{ background: '#BB133A' }}
          />
        </div>
        {/* Google Fonts import pre Anton */}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap');`}</style>
        <h1
          className="mb-4"
          style={{
            fontFamily: `'Anton', Impact, sans-serif`,
            fontSize: '2.8rem',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '0.08em',
            textShadow: '0 2px 12px rgba(0,0,0,0.7)'
          }}
        >
          SCAVENGER HUNT
        </h1>
        <p className="text-white text-lg drop-shadow-md">
          Join the adventure and complete challenges with your team!
        </p>
      </div>

      {/* Action Buttons & Forms */}
      <div className="w-full max-w-md mx-auto space-y-8">
        {activeForm === "none" && (
          <Card className="border-2 bg-white/90 backdrop-blur-sm">
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
            </CardContent>
          </Card>
        )}

        {activeForm === "register" && (
          <Card className="border-2 bg-white/90 backdrop-blur-sm">
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

        {activeForm === "login" && (
          <Card className="border-2 bg-white/90 backdrop-blur-sm">
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

        {activeForm === "admin" && (
          <AdminLoginForm onBack={() => setActiveForm("none")} />
        )}


        {/* Footer */}
        <div className="text-center text-sm text-white drop-shadow-md mt-8">
          <p>© 2025 FSV UK. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
