"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MediaModal } from "@/components/media-modal";
import { useTeamSubmissions } from "@/hooks/use-submissions";
import { Camera, Video, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const { data: submissions, isLoading } = useTeamSubmissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show all submissions from team, regardless of approval status
  const allSubmissions = submissions || [];

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
            Our Gallery
          </div>
          <div className="text-[var(--text-secondary)] text-lg font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            {allSubmissions.length} team submissions
          </div>
        </div>
      </div>

  <div className="max-w-lg mx-auto px-2 py-4">
        {allSubmissions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">No media yet</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Complete tasks and upload photos to see them here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {allSubmissions.map((submission, idx) => (
              <div
                key={submission.id}
                className="aspect-square relative cursor-pointer group"
                onClick={() => setSelectedIndex(idx)}
              >
                {submission.downloadURL ? (
                  submission.type === "image" ? (
                    <img
                      src={submission.downloadURL}
                      alt={submission.caption || "Team submission"}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-black rounded-xl flex items-center justify-center relative">
                      <video
                        src={submission.downloadURL}
                        className="w-full h-full object-cover rounded-xl"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                        <Video className="w-8 h-8 text-[var(--text-primary)]" />
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-muted rounded-xl flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-xl flex items-end">
                  <div className="p-3 text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {submission.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Media Type Icon */}
                <div className="absolute top-2 right-2">
                  {submission.type === "video" ? (
                    <div className="bg-black/50 rounded-full p-1">
                      <Video className="w-4 h-4 text-[var(--text-primary)]" />
                    </div>
                  ) : (
                    <div className="bg-black/50 rounded-full p-1">
                      <Camera className="w-4 h-4 text-[var(--text-primary)]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Modal */}
      {selectedIndex !== null && allSubmissions[selectedIndex] && (
        <MediaModal
          media={{
            ...allSubmissions[selectedIndex],
            id: allSubmissions[selectedIndex].id ?? "",
            downloadUrl: allSubmissions[selectedIndex].downloadURL
          }}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => setSelectedIndex(i => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() => setSelectedIndex(i => (i !== null && i < allSubmissions.length - 1 ? i + 1 : i))}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < allSubmissions.length - 1}
        />
      )}

      </div>

      <BottomNavigation />
    </div>
  );
}
