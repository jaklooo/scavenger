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

interface Task8WorkflowProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: Progress["status"];
}

type WorkflowPhase = "map" | "task" | "completed";

export function Task8Workflow({ task, onBack, onContinue, status }: Task8WorkflowProps) {
  const [phase, setPhase] = useState<WorkflowPhase>("map");
  const [answers, setAnswers] = useState({
    question1: "", // police
    question2: "", // astronauts  
    question3: "", // long
    question4: "", // all
    question5: "", // cars
    question6: "", // houses
    finalAnswer: "" // PALACH
  });
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const updateProgressMutation = useUpdateTaskProgress();

  // Helper: normalize text (remove diacritics, uppercase, trim)
  const normalizeText = (s: string) => {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, "")
      .trim();
  };

  const correctAnswers = {
    question1: "POLICE",
    question2: "ASTRONAUTS", 
    question3: "LONG",
    question4: "ALL",
    question5: "CARS",
    question6: "HOUSES",
    finalAnswer: "PALACH"
  };

  const checkAnswers = async () => {
    if (!answers.question1.trim() || !answers.question2.trim() || !answers.question3.trim() || 
        !answers.question4.trim() || !answers.question5.trim() || !answers.question6.trim() || !answers.finalAnswer.trim()) {return;
    }

    let totalScore = 0;

    // Check each answer (5 points each)
    if (normalizeText(answers.question1) === "POLICE") totalScore += 5;
    if (normalizeText(answers.question2) === "ASTRONAUTS") totalScore += 5;
    if (normalizeText(answers.question3) === "LONG") totalScore += 5;
    if (normalizeText(answers.question4) === "ALL") totalScore += 5;
    if (normalizeText(answers.question5) === "CARS") totalScore += 5;
    if (normalizeText(answers.question6) === "HOUSES") totalScore += 5;
    if (normalizeText(answers.finalAnswer) === "PALACH") totalScore += 5;

    setScore(totalScore);
    setSubmitted(true);

    try {
      await updateProgressMutation.mutateAsync({ 
        taskId: task.id, 
        status: "done",
        points: totalScore // Send actual score earned
      });
      
      if (totalScore === 35) {} else if (totalScore > 20) {} else {}
    } catch (e) {
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
                    target={{ lat: 50.079452547414306, lng: 14.430391810571681 }}
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
                <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Task 8</h1>
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
                <CardTitle className="text-[var(--text-primary)]">Memorial Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-[var(--text-secondary)]">
                  <p className="leading-relaxed">
                    Dear adventurers,
                  </p>
                  <p className="leading-relaxed">
                    Not all student stories are about exams and canteens. Some are about courage. One student in particular stood up against oppression with the highest sacrifice. Stopping here is about remembering that being a student also means having the power to change the world.
                  </p>
                  <p className="leading-relaxed">
                    Look around you and search for a poem carved into a stone. Have you found it?
                  </p>
                  <p className="leading-relaxed font-medium">
                    The poem before you is more than some words carved into stone - it is a key to the next destination. Hidden within its lines are 6 fragments of a name that Prague will never forget.
                  </p>
                </div>
              </CardContent>
            </Card>

            {!submitted ? (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-[var(--text-primary)]">Seek the words the poem whispers:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      â€˘ One before the cars:
                    </label>
                    <Input 
                      placeholder="Enter your answer" 
                      value={answers.question1} 
                      onChange={(e) => setAnswers(prev => ({ ...prev, question1: e.target.value }))}
                      className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      â€˘ Ones that weep among the stars:
                    </label>
                    <Input 
                      placeholder="Enter your answer" 
                      value={answers.question2} 
                      onChange={(e) => setAnswers(prev => ({ ...prev, question2: e.target.value }))}
                      className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      â€˘ One that counts time:
                    </label>
                    <Input 
                      placeholder="Enter your answer" 
                      value={answers.question3} 
                      onChange={(e) => setAnswers(prev => ({ ...prev, question3: e.target.value }))}
                      className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      â€˘ One that makes things right:
                    </label>
                    <Input 
                      placeholder="Enter your answer" 
                      value={answers.question4} 
                      onChange={(e) => setAnswers(prev => ({ ...prev, question4: e.target.value }))}
                      className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      â€˘ One that rolls on wheels:
                    </label>
                    <Input 
                      placeholder="Enter your answer" 
                      value={answers.question5} 
                      onChange={(e) => setAnswers(prev => ({ ...prev, question5: e.target.value }))}
                      className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      â€˘ Ones that shelter from rain:
                    </label>
                    <Input 
                      placeholder="Enter your answer" 
                      value={answers.question6} 
                      onChange={(e) => setAnswers(prev => ({ ...prev, question6: e.target.value }))}
                      className="bg-white/10 border-white/30 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                  
                  <div className="border-t border-white/20 pt-4">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Take the first letter of each word, and you will unlock the name that even before had led the first student forward:
                    </label>
                    <Input 
                      placeholder="Enter the final answer" 
                      value={answers.finalAnswer} 
                      onChange={(e) => setAnswers(prev => ({ ...prev, finalAnswer: e.target.value }))}
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
                    <h3 className="font-semibold text-[var(--text-primary)]">Results</h3>
                    <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                      <p>â€˘ One before the cars: {normalizeText(answers.question1) === "POLICE" ? "âś“ POLICE" : "âś— POLICE"} (5 points)</p>
                      <p>â€˘ Ones that weep among the stars: {normalizeText(answers.question2) === "ASTRONAUTS" ? "âś“ ASTRONAUTS" : "âś— ASTRONAUTS"} (5 points)</p>
                      <p>â€˘ One that counts time: {normalizeText(answers.question3) === "LONG" ? "âś“ LONG" : "âś— LONG"} (5 points)</p>
                      <p>â€˘ One that makes things right: {normalizeText(answers.question4) === "ALL" ? "âś“ ALL" : "âś— ALL"} (5 points)</p>
                      <p>â€˘ One that rolls on wheels: {normalizeText(answers.question5) === "CARS" ? "âś“ CARS" : "âś— CARS"} (5 points)</p>
                      <p>â€˘ Ones that shelter from rain: {normalizeText(answers.question6) === "HOUSES" ? "âś“ HOUSES" : "âś— HOUSES"} (5 points)</p>
                      <p>â€˘ Final answer: {normalizeText(answers.finalAnswer) === "PALACH" ? "âś“ PALACH" : "âś— PALACH"} (5 points)</p>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                      Score: {score}/35 points
                    </Badge>
                    <Button 
                      onClick={handleContinueToCompletion}
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
              <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Task 8 - Complete!</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="done" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                  completed
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-[var(--text-primary)] border-white/30">
                  Score: {score}/35 points
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-6 space-y-6">
          <Card className="glass-card border-[#BB133A]/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="font-semibold text-[var(--text-primary)] text-xl">You&apos;ve done well, little adventurers!</h3>
                <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                  <p>
                    The name has been whispered, and the stone remembers. Pause, honour Jan Palach, and carry his bravery with you.
                  </p>
                  <p>
                    Your journey must continue onward, to the legendary bridge of Charlesâ€¦
                  </p>
                </div>
                <Button 
                  onClick={onContinue}
                  className="w-full bg-[#BB133A] hover:bg-[#A01030] text-white"
                >
                  Continue to Task 9
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


