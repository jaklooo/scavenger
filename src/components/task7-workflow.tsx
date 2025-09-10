"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { useUpdateTaskProgress } from "@/hooks/use-tasks";
import { Task, Progress } from "@/schemas";
import { ArrowLeft, Upload, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleMapsLoader } from "./GoogleMapsLoader";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

interface Task7WorkflowProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: Progress["status"];
}

type WorkflowPhase = "map" | "task" | "completed";

export function Task7Workflow({ task, onBack, onContinue, status }: Task7WorkflowProps) {
  const [phase, setPhase] = useState<WorkflowPhase>("map");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createSubmissionMutation = useCreateSubmission();
  const updateProgressMutation = useUpdateTaskProgress();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {return;
    }
    if (file.size > 10 * 1024 * 1024) {return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedFile) {return;
    }

    try {
      await createSubmissionMutation.mutateAsync({ 
        taskId: task.id, 
        file: selectedFile 
      });
      await updateProgressMutation.mutateAsync({ 
        taskId: task.id, 
        status: "done",
        points: 5 // Fixed 5 points for photo submission
      });
      handleRemoveFile();
      setSubmitted(true);} catch (e) {
      // handled by mutation
    }
  };

  const handleContinueToCompletion = () => {
    setPhase("completed");
    onContinue();
  };

  if (phase === "map") {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Dashboard Background */}
        <div className="dashboard-bg"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className={cn(
            "glass-card text-[var(--text-primary)] p-6 mb-0",
            status === "done" && "glass-card-done",
            status === "in_review" && "glass-card-review"
          )}>
            <div className="max-w-lg mx-auto">
              <Button onClick={onBack} variant="ghost" size="sm" className="text-[var(--text-primary)] hover:bg-white/10 p-0 h-auto mb-4 border border-white/20 rounded-lg px-3 py-1">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Journey
              </Button>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{task.title}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={status === "done" ? "done" : status === "in_review" ? "in_review" : "todo"} className="bg-white/20 text-[var(--text-primary)] border-white/30">
                    {status.replace("_", " ")}
                  </Badge>
                  <span className="text-[var(--text-secondary)]">{task.points} points</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-lg mx-auto p-6 space-y-6">
            {/* Google Maps Loader */}
            <GoogleMapsLoader />
            
            {/* Map Card */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Follow the map</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 w-full rounded-xl overflow-hidden mb-4">
                  <InteractiveMap
                    target={{ lat: 50.09171152842647, lng: 14.417524515157798 }}
                    height="256px"
                  />
                </div>
                <Button 
                  onClick={() => setPhase("task")}
                  className="w-full bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)]"
                >
                  We are here
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "task") {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Dashboard Background */}
        <div className="dashboard-bg"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className={cn(
            "glass-card text-[var(--text-primary)] p-6 mb-0",
            status === "done" && "glass-card-done",
            status === "in_review" && "glass-card-review"
          )}>
            <div className="max-w-lg mx-auto">
              <Button onClick={onBack} variant="ghost" size="sm" className="text-[var(--text-primary)] hover:bg-white/10 p-0 h-auto mb-4 border border-white/20 rounded-lg px-3 py-1">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Journey
              </Button>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Task 7</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={status === "done" ? "done" : status === "in_review" ? "in_review" : "todo"} className="bg-white/20 text-[var(--text-primary)] border-white/30">
                    {status.replace("_", " ")}
                  </Badge>
                  <span className="text-[var(--text-secondary)]">{task.points} points</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-lg mx-auto p-6 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Faculty of Law</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-[var(--text-secondary)]">
                  <p className="leading-relaxed">
                    Fantastic!
                  </p>
                  <p className="leading-relaxed">
                    Here is the Faculty of Law, a place of justice, codes, and very heavy books found in the library here. But worry not: the canteen here has rescued many hungry students from despair because even justice needs soup.
                  </p>
                  <p className="leading-relaxed font-medium">
                    <strong>Task:</strong> Take a photo in front of this building so you know where heavy books and delicious lunches are found!
                  </p>
                </div>
              </CardContent>
            </Card>

            {!submitted ? (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Upload Your Photo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    {!selectedFile ? (
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-24 border-white/30 text-[var(--text-primary)] hover:bg-white/10">
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text-secondary)]" />
                          <p className="text-sm text-[var(--text-secondary)]">Click to select photo</p>
                        </div>
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <img src={previewUrl || ""} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                          <Button onClick={handleRemoveFile} variant="destructive" size="sm" className="absolute top-2 right-2">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          <p>{selectedFile.name}</p>
                          <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!selectedFile || createSubmissionMutation.isLoading || updateProgressMutation.isLoading}
                    className="w-full bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)]"
                  >
                    {createSubmissionMutation.isLoading || updateProgressMutation.isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Photo"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card border-[#BB133A]/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-[#BB133A]/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Photo Submitted!</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Great job! You&apos;ve earned 5 points.</p>
                    <Button 
                      onClick={handleContinueToCompletion}
                      className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Completed phase
  return (
    <div className="min-h-screen bg-background relative">
      {/* Dashboard Background */}
      <div className="dashboard-bg"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className={cn(
          "glass-card text-[var(--text-primary)] p-6 mb-0",
          "glass-card-done"
        )}>
          <div className="max-w-lg mx-auto">
            <Button onClick={onBack} variant="ghost" size="sm" className="text-[var(--text-primary)] hover:bg-white/10 p-0 h-auto mb-4 border border-white/20 rounded-lg px-3 py-1">
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Journey
            </Button>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Task 7 - Complete!</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="done" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                  completed
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                  +5 points
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-6 space-y-6">
          <Card className="glass-card border-[#BB133A]/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)] text-xl">Dear adventurers,</h3>
                <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                  <p>
                    Remember this place: you may not become a lawyer, but you&apos;ll always appreciate its cheap meals and clever books.
                  </p>
                  <p>
                    Now, brave adventurers, the last step calls you. Follow down the Vltava River to honour the courage of students past.
                  </p>
                </div>
                <Button 
                  onClick={onContinue}
                  className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white"
                >
                  Continue to Task 8
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


