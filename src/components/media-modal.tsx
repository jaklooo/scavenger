"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Calendar, User } from "lucide-react";
import { Submission } from "@/schemas";

interface MediaModalProps {
  media: Submission & { id: string; downloadUrl?: string };
  onClose: () => void;
}

export function MediaModal({ media, onClose }: MediaModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl w-full max-h-full">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="bg-background rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Media Content */}
          <div className="flex-1 flex items-center justify-center bg-black">
            {media.downloadUrl ? (
              media.type === "image" ? (
                <img
                  src={media.downloadUrl}
                  alt={media.caption || "Team submission"}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              ) : (
                <video
                  controls
                  className="max-w-full max-h-[60vh]"
                  autoPlay={false}
                >
                  <source src={media.downloadUrl} />
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div className="text-white text-center">
                <p>Media not available</p>
              </div>
            )}
          </div>

          {/* Media Info */}
          <div className="p-6 space-y-4">
            {media.caption && (
              <div>
                <h3 className="font-semibold mb-2">Caption</h3>
                <p className="text-muted-foreground">{media.caption}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{media.createdAt.toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="capitalize">{media.type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
