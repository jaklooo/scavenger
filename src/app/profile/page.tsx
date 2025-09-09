"use client";

import "../login-bg.css";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";
import { getTeam, updateTeam } from "@/services/teams";
import { uploadFile } from "../../services/storage";
import { ArrowLeft, Camera, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ProfilePage() {
  const { userData } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");
  const [teamData, setTeamData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  // Load team data on mount
  useEffect(() => {
    const fetchTeam = async () => {
      if (userData?.teamId) {
        const team = await getTeam(userData.teamId);
        setTeamData(team);
        setDescription(team?.description || "");
        setMembers(team?.members || []);
      }
    };
    fetchTeam();
  }, [userData?.teamId]);

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
      let photoUrl = teamData?.profilePhoto;
      if (profilePhoto) {
        photoUrl = await uploadFile(profilePhoto, `teams/${userData.teamId}/profile`);
      }
      await updateTeam(userData.teamId, {
        description: description.trim() || undefined,
        profilePhoto: photoUrl,
        members: members.filter(m => m.trim().length > 0),
      });
      toast.success("Profile updated successfully!");
      // Refresh team data
      const team = await getTeam(userData.teamId);
      setTeamData(team);
      setProfilePhoto(null);
      setPreviewUrl(null);
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
    <div className="min-h-screen bg-background pb-24 font-['Inter','Poppins',sans-serif] relative">
      {/* Dashboard Background */}
      <div className="dashboard-bg"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Profile Card (LinkedIn style) */}
        <div className="w-full flex justify-center px-2 pt-4">
          <div className="w-full max-w-lg">
            <div className="rounded-3xl shadow-xl glass-card p-6 flex flex-col items-center relative overflow-hidden border border-[var(--primary-color)]/30">
            {/* Profile Photo */}
            <div className="relative mb-3">
              <Image
                src={previewUrl || teamData?.profilePhoto || "/avatar-placeholder.png"}
                alt="Team profile photo"
                width={120}
                height={120}
                className="rounded-full border-4 border-[var(--accent-color)] shadow-lg object-cover w-28 h-28"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="icon"
                className="absolute bottom-2 right-2 bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)] rounded-full shadow-lg border border-white/20"
              >
                <Camera className="w-5 h-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {/* Team Name */}
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1 text-center">{teamData?.name}</div>
            {/* Description */}
            <div className="text-[var(--text-primary)] text-center mb-2 min-h-[32px]">
              {teamData?.description || <span className="italic text-[var(--text-secondary)]">No description yet.</span>}
            </div>
            {/* Members */}
            <div className="flex flex-col items-center w-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">Team Members</div>
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                {members.length === 0 && <span className="text-[var(--text-secondary)] italic">No members yet.</span>}
                {members.map((member, idx) => (
                  <span key={idx} className="bg-[var(--secondary-color)]/30 text-[var(--text-primary)] rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 border border-white/20">
                    {member}
                    <button
                      type="button"
                      className="ml-1 text-[var(--text-secondary)] hover:text-red-300"
                      onClick={() => setMembers(members.filter((_, i) => i !== idx))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 w-full max-w-xs mx-auto">
                <Input
                  type="text"
                  placeholder="Add member name"
                  value={newMember}
                  onChange={e => setNewMember(e.target.value)}
                  className="flex-1 bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  onKeyDown={e => {
                    if (e.key === "Enter" && newMember.trim()) {
                      setMembers([...members, newMember.trim()]);
                      setNewMember("");
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (newMember.trim()) {
                      setMembers([...members, newMember.trim()]);
                      setNewMember("");
                    }
                  }}
                  className="bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)] border border-white/20"
                >
                  Add
                </Button>
              </div>
            </div>
            {/* Edit Description */}
            <div className="w-full mt-4">
              <Textarea
                placeholder="Write something about your team..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                className="resize-none bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              />
              <p className="text-xs text-[var(--text-secondary)] text-right mt-1">
                {description.length}/500
              </p>
            </div>
            {/* Save Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!description.trim() && !profilePhoto && members.join() === (teamData?.members || []).join())}
              className="w-full mt-4 bg-[var(--primary-color)] hover:bg-[var(--accent-color)] text-[var(--text-primary)] font-bold border border-white/20"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Saving...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" /> Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}