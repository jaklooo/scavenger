"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Calendar, User } from "lucide-react";
import { Submission } from "@/schemas";

interface MediaModalProps {
  media: Submission & { id: string; downloadUrl?: string };
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function MediaModal({ media, onClose, onPrev, onNext, hasPrev, hasNext }: MediaModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "unset";
    };
  }, [onClose, onPrev, onNext]);

  // Swipe support
  useEffect(() => {
    let startX: number | null = null;
    let endX: number | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      if (startX !== null && endX !== null) {
        const diff = endX - startX;
        if (diff > 50 && onPrev) onPrev();
        if (diff < -50 && onNext) onNext();
      }
      startX = null;
      endX = null;
    };
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onPrev, onNext]);

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

        {/* Prev/Next Buttons */}
        {hasPrev && (
          <Button
            onClick={onPrev}
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
            aria-label="Previous"
          >
            &#8592;
          </Button>
        )}
        {hasNext && (
          <Button
            onClick={onNext}
            variant="ghost"
            size="icon"
            className="absolute right-14 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
            aria-label="Next"
          >
            &#8594;
          </Button>
        )}

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

          {/* Media Info + Download/Open */}
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

            {/* Download/Open Buttons */}
            {media.downloadUrl && (
              <div className="flex gap-3 pt-2">
                <a
                  href={media.downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                >
                  Stiahnuť
                </a>
                <a
                  href={media.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold shadow"
                >
                  Otvoriť v novom okne
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
