"use client";

import "../login-bg.css";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { JourneyPage } from "@/components/journey-page";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Journey() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !userData || !userData.teamId) {
    return null;
  }

  return <JourneyPage />;
}
