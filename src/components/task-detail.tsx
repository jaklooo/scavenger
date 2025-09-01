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
import { ArrowLeft, Upload, Camera, Video, X, Eye, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { GoogleMapsLoader } from "./GoogleMapsLoader";
const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

interface TaskDetailProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: Progress["status"];
  isFirstTask?: boolean;
}

const GoogleMap = dynamic(() => import("./google-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted flex items-center justify-center">Loading map...</div>,
});

export function TaskDetail({ task, onBack, onContinue, status, isFirstTask = false }: TaskDetailProps) {
  const [arrived, setArrived] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
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

  // Helper: normalize text (remove diacritics, uppercase, trim)
  const normalizeText = (s: string) => {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, " ")
      .trim();
  };


  // Identify if this is the first task (by order or id)
  // const isFirstTask = task.order === 1 || task.id === "1";

  // Parse validation type
  let validationType: "text:contains" | "text:equals" | "photo" | "manual" | "gps" | "none" = "none";
  let validationValue = "";
  if (task.validation) {
    if (task.validation.startsWith("text:contains:")) {
      validationType = "text:contains";
      validationValue = task.validation.replace("text:contains:", "");
    } else if (task.validation.startsWith("text:equals:")) {
      validationType = "text:equals";
      validationValue = task.validation.replace("text:equals:", "");
    } else if (task.validation === "photo") {
      validationType = "photo";
    } else if (task.validation === "manual") {
      validationType = "manual";
    } else if (task.validation === "gps") {
      validationType = "gps";
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Dashboard Background */}
      <div className="dashboard-bg"></div>
      
      {/* Introduction Section for First Task */}
      {isFirstTask && (
        <div className="relative z-10 px-4 pt-8 pb-6">
          <div className="max-w-lg mx-auto">
            <div className="glass-card p-6 mb-6">
              <div className="text-center mb-4">
                <div className="inline-block bg-[var(--accent-color)] text-white rounded-full p-3 mb-4">
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold mb-4 text-[var(--text-primary)] font-serif tracking-tight">
                  Welcome, brave adventurers!
                </h2>
              </div>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-6">
                You’ve entered the legendary world of Charles University, where knowledge is power, food is survival, and trams are always late. It is a place where history, knowledge, and student life have intertwined for nearly 700 years. But rumours speak of a hidden legacy, the path walked by the very first international students of Prague, long forgotten.<br /><br />
                Long ago, the First International Student left behind a Student Survival Map, a guide to thriving in Prague. However, the map was divided into pieces, scattered across the city. Only by solving riddles, working together, and facing the busy tourist-filled streets can you put it back together.
              </p>
              <div className="text-center">
                <Button 
                  onClick={() => {
                    // Scroll to task content
                    const taskContent = document.querySelector('.task-content');
                    taskContent?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)] px-6 py-2"
                >
                  Start Your Adventure
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 task-content">
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
        {/* Google Maps Loader for InteractiveMap */}
        <GoogleMapsLoader />
        {/* Map for all tasks except final message, s rôznymi miestami pre tasky 2 a 3 */}
        {task.title?.toLowerCase() !== "final message" && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Go to the place on the map</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                {task.order === 2 || task.id === '2'
                  ? 'Celetná 597/13, 110 00 Staré Město, Česko'
                  : task.order === 3 || task.id === '3'
                    ? 'UJOP Charles University, Voršilská 1, 110 00 Nové Město, Česko'
                    : task.order === 4 || task.id === '4'
                      ? 'Smetanovo nábř. 195/5, 110 00 Staré Město, Česko'
                      : task.order === 5 || task.id === '5'
                        ? 'Staré Město, 110 00 Praha 1, Česko'
                        : task.order === 6 || task.id === '6'
                          ? 'nám. J. Palacha 1, 110 00 Staré Město, Česko'
                          : task.order === 7 || task.id === '7'
                            ? '50.079452547414306, 14.430391810571681'
                            : task.order === 8 || task.id === '8'
                              ? 'Faculty of Law, 50.09171152842647, 14.417524515157798'
                              : task.order === 9 || task.id === '9'
                                ? 'Charles Bridge, 50.086208690029736, 14.414001196091295'
                                : 'Ovocný trh 560/5, 110 00 Staré Město, Praha'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 w-full rounded-xl overflow-hidden mb-4">
                <InteractiveMap
                  target={
                    task.order === 2 || task.id === '2'
                      ? { lat: 50.087166, lng: 14.424051 }
                      : task.order === 3 || task.id === '3'
                        ? { lat: 50.080380, lng: 14.416807 }
                        : task.order === 4 || task.id === '4'
                          ? { lat: 50.082381, lng: 14.413248 }
                          : task.order === 5 || task.id === '5'
                            ? { lat: 50.087027, lng: 14.417338 }
                          : task.order === 6 || task.id === '6'
                            ? { lat: 50.088989, lng: 14.415784 }
                            : task.order === 7 || task.id === '7'
                              ? { lat: 50.079452547414306, lng: 14.430391810571681 }
                              : task.order === 8 || task.id === '8'
                                ? { lat: 50.09171152842647, lng: 14.417524515157798 }
                                : task.order === 9 || task.id === '9'
                                  ? { lat: 50.086208690029736, lng: 14.414001196091295 }
                                  : { lat: 50.087451, lng: 14.425519 }
                  }
                  height="256px"
                />
              </div>
            </CardContent>
          </Card>
        )}        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-[var(--text-primary)]">Task Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--text-secondary)] leading-relaxed">{task.description}</p>
          </CardContent>
        </Card>

        {canSubmit && (
          validationType === "text:contains" || validationType === "text:equals" ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Submit Your Answer</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">Type your answer below and check if it matches the task requirements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Type your answer here" value={answer} onChange={(e) => setAnswer(e.target.value)} aria-label="Answer input" className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]" />
                <div className="flex items-center space-x-2">
                  <Button onClick={async () => {
                    const val = answer.trim();
                    if (!val) {
                      toast.error("Please enter an answer");
                      return;
                    }
                    setCheckingAnswer(true);
                    try {
                      const normAnswer = normalizeText(val);
                      const normExpected = normalizeText(validationValue);
                      let ok = false;
                      if (validationType === "text:contains") ok = normAnswer.includes(normExpected);
                      else if (validationType === "text:equals") ok = normAnswer === normExpected;
                      if (ok) {
                        await updateProgressMutation.mutateAsync({ taskId: task.id, status: "done" });
                        setAnswerCorrect(true);
                        toast.success("Correct — task completed!");
                      } else {
                        toast.error("Incorrect answer, try again");
                      }
                    } catch (e) {
                      // handled
                    } finally {
                      setCheckingAnswer(false);
                    }
                  }} disabled={checkingAnswer} className="bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)]">
                    {checkingAnswer ? <LoadingSpinner size="sm" className="mr-2" /> : "Check Answer"}
                  </Button>
                  {answerCorrect && (
                    <Button variant="ghost" onClick={() => onContinue()} className="text-[var(--text-primary)] hover:bg-white/10">
                      Continue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-[var(--text-primary)]">Submit Your Work</CardTitle>
                <CardDescription className="text-[var(--text-secondary)]">Upload an image or video to complete this task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
                  {!selectedFile ? (
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full h-24 border-white/30 text-[var(--text-primary)] hover:bg-white/10">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text-secondary)]" />
                        <p className="text-sm text-[var(--text-secondary)]">Click to select file</p>
                      </div>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        {selectedFile.type.startsWith("image/") ? (
                          <img src={previewUrl || ""} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-48 bg-white/10 rounded-xl flex items-center justify-center">
                            <div className="text-center">
                              <Video className="w-12 h-12 mx-auto mb-2 text-[var(--text-secondary)]" />
                              <p className="text-sm text-[var(--text-secondary)]">{selectedFile.name}</p>
                            </div>
                          </div>
                        )}
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
                <div className="space-y-2">
                  <label htmlFor="caption" className="text-sm font-medium text-[var(--text-primary)]">Caption (Optional)</label>
                  <Input id="caption" placeholder="Add a caption to describe your submission..." value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200} className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]" />
                  <p className="text-xs text-[var(--text-secondary)] text-right">{caption.length}/200</p>
                </div>
                <Button onClick={handleSubmit} disabled={!selectedFile || createSubmissionMutation.isLoading || updateProgressMutation.isLoading} className="w-full bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)]">
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
          )
        )}

        {justSubmitted && (
          <Card className="glass-card border-blue-300/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-400/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Submission Successful!</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Your submission has been sent for review. Ready for the next task?</p>
                <Button onClick={() => { setJustSubmitted(false); onContinue(); }} className="w-full bg-blue-500 hover:bg-blue-600 text-[var(--text-primary)]">
                  Continue to Next Task
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isCompleted && (
          <Card className="glass-card border-green-300/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-400/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Task Completed!</h3>
                <p className="text-sm text-[var(--text-secondary)]">Congratulations! You&apos;ve earned {task.points} points for completing this task.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {submissionsLoading ? (
          <Card className="glass-card">
            <CardContent className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </CardContent>
          </Card>
        ) : submissions && submissions.length > 0 ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-[var(--text-primary)]">Your Submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-white/20 rounded-xl p-4 bg-white/5">
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
                        <div className="w-full h-32 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                          <Eye className="w-8 h-8 text-[var(--text-secondary)]" />
                        </div>
                      )}

                      {submission.caption && <p className="text-sm text-[var(--text-secondary)] mb-2">{submission.caption}</p>}

                      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <span>{submission.createdAt.toLocaleDateString()}</span>
                        <Badge variant={submission.approved === true ? "done" : submission.approved === false ? "destructive" : "in_review"} className="bg-white/20 text-[var(--text-primary)] border-white/30">
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
    </div>
  );
}
