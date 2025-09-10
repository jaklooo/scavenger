"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Task } from "@/schemas";
import { ArrowLeft, Trophy, MapPin, CheckCircle, Upload, Camera, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateTaskProgress } from "@/hooks/use-tasks";
import { useCreateSubmission } from "@/hooks/use-submissions";
import dynamic from "next/dynamic";

// Dynamically load map to avoid SSR issues
const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

interface Task3WorkflowProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: "todo" | "in_review" | "done";
}

type WorkflowPhase = 'map' | 'task' | 'completed';

export function Task3Workflow({ task, onBack, onContinue, status }: Task3WorkflowProps) {
  const [phase, setPhase] = useState<WorkflowPhase>('map');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [totalScore] = useState(5); // Fixed 5 points for photo submission
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const updateProgressMutation = useUpdateTaskProgress();
  const createSubmissionMutation = useCreateSubmission();

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

  const handlePhotoSubmit = async () => {
    if (!selectedFile) {return;
    }

    try {
      await createSubmissionMutation.mutateAsync({ 
        taskId: task.id, 
        file: selectedFile, 
        caption: "Team selfie in front of the building"
      });
      await updateProgressMutation.mutateAsync({ taskId: task.id, status: "in_review" });
      handleRemoveFile();
      setJustSubmitted(true);} catch (error) {}
  };

  const handleContinueToNextTask = async () => {
    try {
      await updateProgressMutation.mutateAsync({
        taskId: task.id,
        status: 'done',
        points: totalScore // Send actual score earned (5 points for photo)
      });
      onContinue();
    } catch (error) {}
  };

  const renderMapPhase = () => (
    <Card className="glass-card border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5" />
          Follow the map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Map Component - Task 3 coordinates */}
        <div className="h-80 w-full rounded-lg overflow-hidden border border-blue-300/30">
          <InteractiveMap 
            target={{ lat: 50.080380, lng: 14.416807 }} // Task 3 coordinates
            height="320px"
          />
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={() => setPhase('task')}
            className="bg-[#BB133A] hover:bg-[#A01030] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
          >
            We are here
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTaskPhase = () => (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">
          Task 3:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90">
        {!justSubmitted ? (
          <>
            <div className="prose prose-invert max-w-none">
              <p>
                Heroes can&apos;t fight on empty stomachs! The First Student once discovered that 
                without a warm lunch, study spells fail. Where do students gather to feast cheaply 
                and question life over soup?
              </p>
              <p><strong>Task: Take a team selfie in front of the building to continue!</strong></p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="bg-[#BB133A]/20 text-[#BB133A] border-[#BB133A]/30">
                  Points: {totalScore}
                </Badge>
              </div>
              
              {/* Photo Upload Section */}
              <div>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
                {!selectedFile ? (
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline" 
                    className="w-full h-24 border-blue-300/30 text-white hover:bg-[#BB133A]/20"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-[#BB133A]" />
                      <p className="text-sm text-blue-200">Click to select team selfie</p>
                    </div>
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <img 
                        src={previewUrl || ""} 
                        alt="Team selfie preview" 
                        className="w-full h-48 object-cover rounded-xl border border-blue-300/30" 
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
                    <div className="text-sm text-white/70">
                      <p>{selectedFile.name}</p>
                      <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handlePhotoSubmit}
                disabled={!selectedFile || createSubmissionMutation.isLoading || updateProgressMutation.isLoading}
                className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white"
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
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Photo Submitted!</span>
            </div>
            <p>You earned <strong>{totalScore} points</strong> for this task!</p>
            <p className="text-sm text-white/70">Your photo has been sent for review.</p>
            <Button 
              onClick={() => setPhase('completed')}
              className="bg-[#BB133A] hover:bg-[#A01030] text-white"
            >
              Continue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCompletedPhase = () => (
    <Card className="glass-card border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-white">
          Well done!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90 text-center">
        <div className="prose prose-invert max-w-none">
          <p>
            Now you&apos;ve found the canteen, one of the sacred places where, when in doubt, your lunch 
            will always appear. But beware: to unlock this feature, the ISIC card, the plastic badge 
            of your identity, is required! Remember this place when hungry, it will serve you well.
          </p>
          <p>
            Your journey continues nearbyâ€¦ can you reach the faculty building, where advisors and 
            deans await?
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 py-4">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <span className="text-lg font-bold text-white">
            Task 3 Complete! Total Score: {totalScore} points
          </span>
        </div>

        <Button 
          onClick={handleContinueToNextTask}
          className="bg-[#BB133A] hover:bg-[#A01030] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
          disabled={updateProgressMutation.isLoading}
        >
          {updateProgressMutation.isLoading ? (
            <>
              <LoadingSpinner className="mr-2" />
              Saving Progress...
            </>
          ) : (
            "Continue to Task 4"
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-24 font-['Inter','Poppins',sans-serif] relative">
      {/* Dashboard Background */}
      <div className="dashboard-bg"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Journey
            </Button>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-blue-400/50 text-[#BB133A]">
                Task 3
              </Badge>
              <Badge 
                variant="secondary" 
                className={cn(
                  "capitalize",
                  status === 'done' ? "bg-green-600/20 text-green-300 border-green-400/30" :
                  status === 'in_review' ? "bg-[#BB133A]/20 text-[#BB133A] border-[#BB133A]/30" :
                  "bg-gray-600/20 text-gray-300 border-gray-400/30"
                )}
              >
                {status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {phase === 'map' && renderMapPhase()}
          {phase === 'task' && renderTaskPhase()}
          {phase === 'completed' && renderCompletedPhase()}
        </div>
      </div>
    </div>
  );
}


