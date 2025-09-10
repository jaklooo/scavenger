"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUpdateTaskProgress } from "@/hooks/use-tasks";
import { Task, Progress } from "@/schemas";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { GoogleMapsLoader } from "./GoogleMapsLoader";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

interface Task9WorkflowProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: Progress["status"];
}

type WorkflowPhase = "map" | "task" | "bridge_complete" | "final";

export function Task9Workflow({ task, onBack, onContinue, status }: Task9WorkflowProps) {
  const [phase, setPhase] = useState<WorkflowPhase>("map");
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(10);
  const [submitted, setSubmitted] = useState(false);

  const updateProgressMutation = useUpdateTaskProgress();

  const checkAnswer = async () => {
    if (!answer.trim()) {
      return;
    }

    const normalizedAnswer = answer.trim();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (normalizedAnswer === "1378") {
      // Correct answer
      const finalScore = Math.max(1, 10 - attempts); // Minimum 1 point
      setScore(finalScore);
      setSubmitted(true);

      try {
        await updateProgressMutation.mutateAsync({ 
          taskId: task.id, 
          status: "done",
          points: finalScore // Send actual score earned
        });
      } catch (e) {
        // handled by mutation
      }
    } else {
      // Wrong answer
      const remainingScore = Math.max(1, 10 - newAttempts);
      setScore(remainingScore);
    }
  };

  const handleContinueToBridge = () => {
    setPhase("bridge_complete");
  };

  const handleContinueToFinal = () => {
    setPhase("final");
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
                    target={{ lat: 50.086208690029736, lng: 14.414001196091295 }}
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
                <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Task 9</h1>
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
                <CardTitle className="text-[var(--text-primary)]">Charles Bridge Secret</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-[var(--text-secondary)]">
                  <p className="leading-relaxed">
                    Dear adventurers,
                  </p>
                  <p className="leading-relaxed">
                    The First Student wrote of an ancient bridge that would stand for centuries, carrying dreams from one bank of Prague to the other.
                  </p>
                  <p className="leading-relaxed">
                    But few only notice the marker carved into its foundation, a secret that stones themselves guard.
                  </p>
                  <p className="leading-relaxed font-medium">
                    Seek the plaque that whispers of its birth, written not in numbers of today but in the numbers of emperors. When you find it, translate its date into the numbers of your own time to unlock the secret of the bridge.
                  </p>
                </div>
              </CardContent>
            </Card>

            {!submitted ? (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Submit Your Answer</CardTitle>
                  <CardDescription className="text-[var(--text-secondary)]">
                    Enter the year when Charles Bridge construction began
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    placeholder="Enter the year" 
                    value={answer} 
                    onChange={(e) => setAnswer(e.target.value)}
                    className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[var(--text-secondary)]">
                      <p>Attempts: {attempts}</p>
                      <p>Points remaining: {Math.max(1, 10 - attempts)}</p>
                    </div>
                    <Button 
                      onClick={checkAnswer}
                      disabled={updateProgressMutation.isLoading}
                      className="bg-[var(--accent-color)] hover:bg-[var(--primary-color)] text-[var(--text-primary)]"
                    >
                      {updateProgressMutation.isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Checking...
                        </>
                      ) : (
                        "Submit Answer"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card border-[#BB133A]/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="font-semibold text-[var(--text-primary)]">Correct Answer!</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--text-secondary)]">
                        You&apos;ve unlocked the secret of Charles Bridge!
                      </p>
                      <Badge variant="secondary" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                        Score: {score}/10 points
                      </Badge>
                    </div>
                    <Button 
                      onClick={handleContinueToBridge}
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

  if (phase === "bridge_complete") {
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
                <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Task 9 - Complete!</h1>
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
                <div className="space-y-4">
                  <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                    <p>
                      And so, your quest leads you here. The First Student once stood on this bridge, gazing at the city and realising: this place is home. 
                    </p>
                    <p>
                      With Prague on both sides of the Vltava, your map is now complete. Your adventure ends here… but your story? It is only the beginning…
                    </p>
                    <p className="font-medium text-[var(--text-primary)]">
                      Do not forget to take the picture so you can always remember!
                    </p>
                  </div>
                  <Button 
                    onClick={handleContinueToFinal}
                    className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Final phase
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
              <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Congratulations!</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="done" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                  journey complete
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-6 space-y-6">
          <Card className="glass-card border-[#BB133A]/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)] text-xl text-center">
                  Congratulations, heroes!
                </h3>
                <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                  <p>
                    You&apos;ve pieced together the lost Student Survival Map. May it guide you through exams, coffee shortages, and tram delays.
                  </p>
                  <div className="space-y-2 font-medium text-[var(--text-primary)]">
                    <p className="text-center mb-3">Remember:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• The Rectorate is your castle.</li>
                      <li>• The ISIC is your sword.</li>
                      <li>• The canteen is your tavern.</li>
                      <li>• Libraries are your dungeons of wisdom.</li>
                      <li>• And Charles Bridge? That&apos;s your gateway to the whole city.</li>
                    </ul>
                  </div>
                  <p className="text-center font-semibold text-[var(--text-primary)] text-lg">
                    Now go forth, adventurers, Prague is yours.
                  </p>
                  <p className="text-center font-bold text-[var(--text-primary)] text-xl">
                    Welcome to Charles University!
                  </p>
                </div>
                <Button 
                  onClick={onContinue}
                  className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white font-semibold py-3"
                >
                  Finish Journey
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
