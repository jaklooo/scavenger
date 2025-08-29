"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";
import { updateTeam } from "@/services/teams";
import { uploadFile } from "../../services/storage";
import { ArrowLeft, Camera, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ProfilePage() {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { userData } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setProfilePhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setProfilePhoto(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!userData?.teamId) {
      toast.error("No team found");
      return;
    }

    setIsLoading(true);
    try {
      let photoUrl = undefined;

      if (profilePhoto) {
        photoUrl = await uploadFile(profilePhoto, `teams/${userData.teamId}/profile`);
      }

      await updateTeam(userData.teamId, {
        description: description.trim() || undefined,
        ...(photoUrl && { profilePhoto: photoUrl }),
      });

      toast.success("Profile updated successfully!");
      router.push("/journey");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData?.teamId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please log in to access your profile</p>
          <Button onClick={() => router.push("/")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-white p-6">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={() => router.push("/journey")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 p-0 h-auto mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Tasks
          </Button>

          <h1 className="text-2xl font-bold">Team Profile</h1>
          <p className="text-primary-200 mt-1">Customize your &apos;team&apos;s&apos; profile</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Upload a photo that represents your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!profilePhoto ? (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-32 border-2 border-dashed"
              >
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to select photo</p>
                </div>
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Image
                    src={previewUrl || ""}
                    alt="Team profile photo"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <Button
                    onClick={handleRemoveFile}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {(profilePhoto.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Your Team</CardTitle>
            <CardDescription>Tell others about your team and your adventure</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write something about your team..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-2">
              {description.length}/500
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!profilePhoto && !description.trim())}
          className="w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> Updating Profile...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" /> Update Profile
            </>
          )}
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}
