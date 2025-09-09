"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

interface TeamRegistrationFormProps {
  onBack: () => void;
}

export function TeamRegistrationForm({ onBack }: TeamRegistrationFormProps) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showTeamNamePrompt, setShowTeamNamePrompt] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamNameError, setTeamNameError] = useState<string | null>(null);
  const { signUp, signInWithGoogle } = useAuth();
  // Google sign up handler
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // Po Google sign up presmeruj na team name prompt, ak je nový user
      setShowTeamNamePrompt(true);
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };
  const router = useRouter();

  const handleInputChange = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const schema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    });
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: { email?: string; password?: string } = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as "email" | "password";
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Always set displayName to email for initial user creation (required by schema)
      await signUp(formData.email, formData.password, formData.email);
      setShowTeamNamePrompt(true);
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setTeamNameError("Team name is required");
      return;
    }
    if (teamName.length > 50) {
      setTeamNameError("Team name must be less than 50 characters");
      return;
    }
    setTeamNameError(null);
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not found");
      const teamRef = doc(db, "teams", user.uid);
      await setDoc(teamRef, {
        name: teamName,
        createdAt: new Date(),
        memberCount: 1,
      });
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        teamId: user.uid,
        teamName: teamName,
        displayName: teamName, // always set displayName for schema
      }, { merge: true });
      // Optionally update Firebase Auth profile too
      if (user.displayName !== teamName) {
        await user.updateProfile?.({ displayName: teamName });
      }
      toast.success("Team name set successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to set team name");
    } finally {
      setIsLoading(false);
    }
  };

  if (showTeamNamePrompt) {
    return (
      <form onSubmit={handleTeamNameSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="teamName" className="font-medium text-black">Team Name</label>
          <Input
            id="teamName"
            type="text"
            placeholder="Enter your team name"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            maxLength={50}
            disabled={isLoading}
            className="border-gray-300 focus:border-[#BB133A] focus:ring-[#BB133A]"
          />
          <p className="text-xs text-gray-500">
            <span className="text-red-500 font-semibold">Warning:</span> This team name cannot be changed later.
          </p>
          {teamNameError && <p className="text-red-500 text-xs mt-1">{teamNameError}</p>}
        </div>
        <Button type="submit" className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white font-semibold" disabled={isLoading}>
          {isLoading ? "Saving..." : "Set Team Name"}
        </Button>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange("email")}
            autoComplete="email"
            disabled={isLoading}
            className="border-gray-300 focus:border-[#BB133A] focus:ring-[#BB133A]"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange("password")}
            autoComplete="new-password"
            disabled={isLoading}
            className="border-gray-300 focus:border-[#BB133A] focus:ring-[#BB133A]"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
        <Button type="submit" className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white font-semibold" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
        <Button type="button" variant="ghost" className="w-full mt-2 text-gray-600 hover:text-black hover:bg-gray-100" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full border-2 border-gray-300 text-black hover:bg-gray-50 bg-white"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
      >
        Continue with Google
      </Button>
    </>
  );
}
