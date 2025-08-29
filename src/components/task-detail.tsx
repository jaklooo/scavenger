"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTaskSubmissions, useCreateSubmission } from "@/hooks/use-submissions";
import { useUpdateTaskProgress } from "@/hooks/use-tasks";
import { Task, Progress } from "@/schemas";
import { ArrowLeft, Upload, Camera, Video, X, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface TaskDetailProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: Progress["status"];
}

const GoogleMap = dynamic(() => import("./google-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted flex items-center justify-center">Loading map...</div>,
});

export function TaskDetail({ task, onBack, onContinue, status }: TaskDetailProps) {
  const [arrived, setArrived] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: submissions, isLoading: submissionsLoading } = useTaskSubmissions(task.id);
  const createSubmissionMutation = useCreateSubmission();
  const updateProgressMutation = useUpdateTaskProgress();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Please select an image or video file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
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
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      await createSubmissionMutation.mutateAsync({ taskId: task.id, file: selectedFile, caption: caption.trim() || undefined });
      await updateProgressMutation.mutateAsync({ taskId: task.id, status: "in_review" });
      handleRemoveFile();
      setCaption("");
      setJustSubmitted(true);
    } catch (e) {
      // handled by mutation
    }
  };

  const canSubmit = status === "todo" || (status === "in_review" && !justSubmitted);
  const isCompleted = status === "done";
  const isFirstTask = task.order === 1 || task.id === "1";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-white p-6">
        <div className="max-w-lg mx-auto">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-white hover:bg-white/10 p-0 h-auto mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Journey
          </Button>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <div className="flex items-center space-x-2">
              <Badge variant={status === "done" ? "done" : status === "in_review" ? "in_review" : "todo"} className="bg-white/20 text-white">
                {status.replace("_", " ")}
              </Badge>
              <span className="text-primary-200">{task.points} points</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {isFirstTask && !arrived && (
          <Card>
            <CardHeader>
              <CardTitle>Go to the place on the map</CardTitle>
              <CardDescription>Visit Celetná 597, 110 00 Staré Město and confirm your arrival.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 w-full rounded-xl overflow-hidden mb-4">
                <GoogleMap lat={50.088479} lng={14.421332} />
              </div>
              <Button className="w-full" onClick={() => setArrived(true)}>
                We are on place
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Task Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{task.description}</p>
          </CardContent>
        </Card>

        {canSubmit && (!isFirstTask || arrived) && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Work</CardTitle>
              <CardDescription>Upload an image or video to complete this task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />

                {!selectedFile ? (
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-24 border-2 border-dashed">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to select file</p>
                    </div>
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      {selectedFile.type.startsWith("image/") ? (
                        <img src={previewUrl || ""} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <Video className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                          </div>
                        </div>
                      )}

                      <Button onClick={handleRemoveFile} variant="destructive" size="sm" className="absolute top-2 right-2">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>{selectedFile.name}</p>
                      <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="caption" className="text-sm font-medium">Caption (Optional)</label>
                <Input id="caption" placeholder="Add a caption to describe your submission..." value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} />
                <p className="text-xs text-muted-foreground text-right">{caption.length}/200</p>
              </div>

              <Button onClick={handleSubmit} disabled={!selectedFile || createSubmissionMutation.isLoading || updateProgressMutation.isLoading} className="w-full">
                {createSubmissionMutation.isLoading || updateProgressMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit for Review"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {justSubmitted && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-800 mb-2">Submission Successful!</h3>
                <p className="text-sm text-blue-600 mb-4">Your submission has been sent for review. Ready for the next task?</p>
                <Button onClick={() => { setJustSubmitted(false); onContinue(); }} className="w-full">
                  Continue to Next Task
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isCompleted && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800 mb-2">Task Completed!</h3>
                <p className="text-sm text-green-600">Congratulations! You&apos;ve earned {task.points} points for completing this task.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {submissionsLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </CardContent>
          </Card>
        ) : submissions && submissions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      {submission.downloadURL ? (
                        submission.type === "image" ? (
                          <img src={submission.downloadURL} alt="Submission" className="w-full h-32 object-cover rounded-lg mb-2" />
                        ) : (
                          <video controls className="w-full h-32 rounded-lg mb-2">
                            <source src={submission.downloadURL} />
                          </video>
                        )
                      ) : (
                        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center mb-2">
                          <Eye className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}

                      {submission.caption && <p className="text-sm text-muted-foreground mb-2">{submission.caption}</p>}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{submission.createdAt.toLocaleDateString()}</span>
                        <Badge variant={submission.approved === true ? "done" : submission.approved === false ? "destructive" : "in_review"}>
                          {submission.approved === true ? "Approved" : submission.approved === false ? "Rejected" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
