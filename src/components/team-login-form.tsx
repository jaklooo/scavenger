"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { LoginSchema, type Login } from "@/schemas";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

interface TeamLoginFormProps {
  onBack: () => void;
}

export function TeamLoginForm({ onBack }: TeamLoginFormProps) {
  const [formData, setFormData] = useState<Login>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Login>>({});
  
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleInputChange = (field: keyof Login) => (
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
      LoginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<Login> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof Login;
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
      await signIn(formData.email, formData.password);
      router.push("/dashboard");
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
        className="p-0 h-auto font-normal text-gray-600 hover:text-black hover:bg-gray-100"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to options
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-black">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange("email")}
            className={`border-gray-300 focus:border-[#BB133A] focus:ring-[#BB133A] ${errors.email ? "border-red-500" : ""}`}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-black">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange("password")}
            className={`border-gray-300 focus:border-[#BB133A] focus:ring-[#BB133A] ${errors.password ? "border-red-500" : ""}`}
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
          className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white font-semibold"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>

      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        className="w-full border-2 border-gray-300 text-black hover:bg-gray-50 bg-white"
        disabled={isLoading}
        size="lg"
      >
        Continue with Google
      </Button>
    </div>
  );
}
