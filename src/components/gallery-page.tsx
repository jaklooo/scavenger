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
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  
  const { data: submissions, isLoading } = useTeamSubmissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const approvedSubmissions = submissions?.filter(s => s.approved === true) || [];

  return (
    <div className="min-h-screen bg-background pb-24 font-['Inter','Poppins',sans-serif]">
      {/* Header */}
      <div className="w-full flex justify-center px-2 pt-4">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl shadow-lg bg-gradient-to-br from-green-400 to-green-200 p-5 flex items-center relative overflow-hidden">
            <div className="flex-1">
              <div className="uppercase text-xs tracking-widest text-white/80 font-semibold mb-1">FSV UK – Scavenger Hunt</div>
              <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-1">Our Gallery</div>
              <div className="text-white/90 text-sm font-medium">{approvedSubmissions.length} approved submissions</div>
            </div>
            {/* Camera Icon */}
            <div className="ml-2 flex-shrink-0">
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
                <circle cx="24" cy="24" r="22" fill="#fff" fillOpacity="0.18" />
                <rect x="14" y="18" width="20" height="14" rx="4" fill="#22c55e" stroke="#fff" strokeWidth="2.2" />
                <circle cx="24" cy="25" r="4" fill="#fff" />
              </svg>
            </div>
          </div>
        </div>
      </div>

  <div className="max-w-lg mx-auto px-2 py-4">
        {approvedSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No media yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete tasks and get submissions approved to see them here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {approvedSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="aspect-square relative cursor-pointer group"
                onClick={() => setSelectedMedia(submission)}
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
                        <Video className="w-8 h-8 text-white" />
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
                  <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                      <Video className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="bg-black/50 rounded-full p-1">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      <BottomNavigation />
    </div>
  );
}
