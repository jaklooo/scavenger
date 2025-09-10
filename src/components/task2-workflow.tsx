"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Task } from "@/schemas";
import { ArrowLeft, Trophy, MapPin, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateTaskProgress } from "@/hooks/use-tasks";
import dynamic from "next/dynamic";
import Image from "next/image";

// Dynamically load map to avoid SSR issues
const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

interface Task2WorkflowProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: "todo" | "in_review" | "done";
}

type WorkflowPhase = 'map' | 'task' | 'completed';

export function Task2Workflow({ task, onBack, onContinue, status }: Task2WorkflowProps) {
  const [phase, setPhase] = useState<WorkflowPhase>('map');
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [points, setPoints] = useState(10);
  const [solved, setSolved] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  
  const updateProgressMutation = useUpdateTaskProgress();

  // Check if answer is correct (should be "13")
  const checkAnswer = (answer: string): boolean => {
    const normalizedAnswer = answer.toLowerCase().trim();
    return normalizedAnswer === "13" || normalizedAnswer === "thirteen";
  };

  const handleAnswerSubmit = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (checkAnswer(answer)) {
      const finalPoints = Math.max(0, 10 - (newAttempts - 1));
      setPoints(finalPoints);
      setSolved(true);
      setTotalScore(finalPoints);} else {
      const remainingPoints = Math.max(0, 10 - newAttempts);
      setPoints(remainingPoints);
      
      if (remainingPoints === 0) {
        setSolved(true);} else {}
    }
  };

  const handleContinueToNextTask = async () => {
    try {
      await updateProgressMutation.mutateAsync({
        taskId: task.id,
        status: 'done',
        points: totalScore // Send actual score earned
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
        {/* Map Component - Task 2 coordinates */}
        <div className="h-80 w-full rounded-lg overflow-hidden border border-blue-300/30">
          <InteractiveMap 
            target={{ lat: 50.087166, lng: 14.424051 }} // Task 2 coordinates
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
          Task 2:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90">
        {!solved ? (
          <>
            <div className="prose prose-invert max-w-none">
              <p>
                Adventurers need badges, wizards have wands, knights have swords, and students haveâ€¦ 
                plastic cards. Without it, discounts vanish, and doors stay locked. Where is the gate 
                to your true student identity?
              </p>
            </div>

            {/* Image */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border border-blue-300/30">
                <Image
                  src="/celetna.jpg"
                  alt="CeletnĂˇ Street Gate"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Can you find out the numeral of this gate?
              </h3>
              
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="bg-[#BB133A]/20 text-[#BB133A] border-[#BB133A]/30">
                  Points: {points}
                </Badge>
                <Badge variant="outline" className="border-yellow-400/50 text-yellow-300">
                  Attempts: {attempts}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/90">
                  <span>CeletnĂˇ (</span>
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="?"
                    className="bg-white/10 border-[#BB133A]/30 text-white placeholder:text-white/60 w-20 text-center"
                    onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                  />
                  <span>)</span>
                </div>
                
                <Button 
                  onClick={handleAnswerSubmit}
                  className="bg-[#BB133A] hover:bg-[#A01030] text-white"
                >
                  Submit
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Task Solved!</span>
            </div>
            <p>You earned <strong>{points} points</strong> for this task!</p>
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
          Fantastic work, heroes!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90 text-center">
        <div className="prose prose-invert max-w-none">
          <p>
            You&apos;ve just reached CU Point, the magical hub where ISIC cards are forged, questions are 
            answered, and students find support in tough times (yes, even psychological one!).
          </p>
          <p>
            Pro tip: this place might just save your sanity one day. And hey, look behind you! 
            That&apos;s the university bookshop, full of shiny knowledge (and probably some impulse buys).
          </p>
          <p>
            Now, let&apos;s keep movingâ€¦ our First Student whispers of a hint: seek out VorĹˇilskĂˇ Street, 
            where a Charles building hides inside a former dormitory. Can you find it?
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 py-4">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <span className="text-lg font-bold text-white">
            Task 2 Complete! Total Score: {totalScore} points
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
            "Continue on Task 3"
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
                Task 2
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


