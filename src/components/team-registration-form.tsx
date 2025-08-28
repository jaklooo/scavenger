"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { TeamRegistrationSchema, type TeamRegistration } from "@/schemas";
import { createTeam } from "@/services/teams";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

interface TeamRegistrationFormProps {
  onBack: () => void;
}

export function TeamRegistrationForm({ onBack }: TeamRegistrationFormProps) {
  const [formData, setFormData] = useState<TeamRegistration>({
    teamName: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<TeamRegistration>>({});
  
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleInputChange = (field: keyof TeamRegistration) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      TeamRegistrationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<TeamRegistration> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof TeamRegistration;
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
      // Create user account FIRST
      await signUp(formData.email, formData.password, formData.displayName);
      
      // Then create team (now user is authenticated)
      const teamId = await createTeam(formData.teamName);
      
      toast.success("Team created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      // Error is handled in the hook
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="teamName" className="text-sm font-medium text-foreground">
            Team Name
          </label>
          <Input
            id="teamName"
            type="text"
            placeholder="Enter your team name"
            value={formData.teamName}
            onChange={handleInputChange("teamName")}
            className={errors.teamName ? "border-red-500" : ""}
            aria-describedby={errors.teamName ? "teamName-error" : undefined}
          />
          {errors.teamName && (
            <p id="teamName-error" className="text-sm text-red-500">
              {errors.teamName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm font-medium text-foreground">
            Your Name
          </label>
          <Input
            id="displayName"
            type="text"
            placeholder="Enter your display name"
            value={formData.displayName}
            onChange={handleInputChange("displayName")}
            className={errors.displayName ? "border-red-500" : ""}
            aria-describedby={errors.displayName ? "displayName-error" : undefined}
          />
          {errors.displayName && (
            <p id="displayName-error" className="text-sm text-red-500">
              {errors.displayName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className={errors.email ? "border-red-500" : ""}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className={errors.password ? "border-red-500" : ""}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? "Creating Team..." : "Create Team"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        onClick={handleGoogleSignUp}
        variant="outline"
        className="w-full"
        disabled={isLoading}
        size="lg"
      >
        Continue with Google
      </Button>
    </div>
  );
}
