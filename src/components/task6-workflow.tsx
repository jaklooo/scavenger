"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUpdateTaskProgress } from "@/hooks/use-tasks";
import { Task, Progress } from "@/schemas";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleMapsLoader } from "./GoogleMapsLoader";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

interface Task6WorkflowProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: Progress["status"];
}

type WorkflowPhase = "map" | "task" | "completed";

export function Task6Workflow({ task, onBack, onContinue, status }: Task6WorkflowProps) {
  const [phase, setPhase] = useState<WorkflowPhase>("map");
  const [place, setPlace] = useState("");
  const [year, setYear] = useState("");
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const updateProgressMutation = useUpdateTaskProgress();

  // Helper: normalize text (remove diacritics, uppercase, trim, remove spaces)
  const normalizeText = (s: string) => {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, "")
      .trim();
  };

  const checkAnswers = async () => {
    if (!place.trim() || !year.trim()) {
      return;
    }

    const normalizedPlace = normalizeText(place);
    const normalizedYear = year.trim();

    let totalScore = 0;

    // Check place answer (NEW YORK or NEWYORK)
    if (normalizedPlace === "NEWYORK") {
      totalScore += 5;
    }

    // Check year answer (1900)
    if (normalizedYear === "1900") {
      totalScore += 5;
    }

    setScore(totalScore);
    setSubmitted(true);

    try {
      // Update progress to done with actual score
      await updateProgressMutation.mutateAsync({ 
        taskId: task.id, 
        status: "done",
        points: totalScore // Send actual score earned
      });
    } catch (e) {
      // handled by mutation
    }
  };

  const handleContinueToTask = () => {
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
                    target={{ lat: 50.088989, lng: 14.415784 }}
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
                <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Task 6</h1>
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
                <CardTitle className="text-[var(--text-primary)]">Faculty of Arts Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-[var(--text-secondary)]">
                  <p className="leading-relaxed">
                    Dear adventurers,
                  </p>
                  <p className="leading-relaxed">
                    Brains are nice, but so is imagination. Here you&apos;ll find books, study corners, cafĂ© (Mezi Ĺ™Ăˇdky - in between the lines) that serve incredible lunches and maybe a philosopher who will argue with you over Machiavelli&apos;s The Prince just for fun. The First Student stopped here to dream as well as study.
                  </p>
                  <p className="leading-relaxed font-medium">
                    <strong>Task:</strong> The Faculty of Arts holds more than books. Its walls guard the secrets of those who changed the world. Somewhere alongside the facade hides a likeness of a man who was crowned a first world champion for his mastery of silent battle - chess. The first student wrote of him as a king who needed no throne. Find him and write the year and place of his death.
                  </p>
                </div>
              </CardContent>
            </Card>

            {!submitted ? (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Submit Your Answers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Place:
                    </label>
                    <Input 
                      placeholder="Enter the place of death" 
                      value={place} 
                      onChange={(e) => setPlace(e.target.value)}
                      className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Year:
                    </label>
                    <Input 
                      placeholder="Enter the year of death" 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)}
                      className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  <Button 
                    onClick={checkAnswers}
                    disabled={updateProgressMutation.isLoading}
                    className="w-full bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)]"
                  >
                    {updateProgressMutation.isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Answers"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-[var(--text-primary)]">Results</h3>
                      <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                        <p>Place: {normalizeText(place) === "NEWYORK" ? "âś“ Correct" : "âś— Incorrect"} (5 points)</p>
                        <p>Year: {year.trim() === "1900" ? "âś“ Correct" : "âś— Incorrect"} (5 points)</p>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                        Score: {score}/10 points
                      </Badge>
                    </div>
                    <Button 
                      onClick={handleContinueToTask}
                      className="w-full bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)]"
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
              <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Task 6 - Complete!</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="done" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                  completed
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                  Score: {score}/10 points
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-6 space-y-6">
          <Card className="glass-card border-[#BB133A]/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)] text-xl">Great job, adventurers!</h3>
                <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                  <p>
                    Remember: knowledge is nice, but imagination and passion are what make it sparkle. You have uncovered one of the Faculty&apos;s guardians.
                  </p>
                  <p>
                    Now, your journey, like that of the First Student, must continue onward, to the halls of law, where justice weighs heavily and soup is light.
                  </p>
                </div>
                <Button 
                  onClick={onContinue}
                  className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white"
                >
                  Continue to Task 7
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


