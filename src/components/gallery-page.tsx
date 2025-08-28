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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-2">Our Gallery</h1>
          <p className="text-primary-200">
            {approvedSubmissions.length} approved submissions
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6">
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
