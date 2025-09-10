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
import toast from "react-hot-toast";
import { useUpdateTaskProgress } from "@/hooks/use-tasks";
import dynamic from "next/dynamic";

// Dynamically load map to avoid SSR issues
const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

interface Task5WorkflowProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: "todo" | "in_review" | "done";
}

type WorkflowPhase = 'map' | 'riddle' | 'completed';

export function Task5Workflow({ task, onBack, onContinue, status }: Task5WorkflowProps) {
  const [phase, setPhase] = useState<WorkflowPhase>('map');
  const [riddleAnswer, setRiddleAnswer] = useState("");
  const [riddleAttempts, setRiddleAttempts] = useState(0);
  const [riddlePoints, setRiddlePoints] = useState(10);
  const [riddleSolved, setRiddleSolved] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  
  const updateProgressMutation = useUpdateTaskProgress();

  // Check if answer is correct (should be "IDIOM")
  const checkRiddleAnswer = (answer: string): boolean => {
    const normalizedAnswer = answer.toLowerCase().trim();
    return normalizedAnswer === "idiom";
  };

  const handleRiddleSubmit = () => {
    const newAttempts = riddleAttempts + 1;
    setRiddleAttempts(newAttempts);
    
    if (checkRiddleAnswer(riddleAnswer)) {
      const points = Math.max(0, 10 - (newAttempts - 1));
      setRiddlePoints(points);
      setRiddleSolved(true);
      setTotalScore(points);
    } else {
      const remainingPoints = Math.max(0, 10 - newAttempts);
      setRiddlePoints(remainingPoints);
      
      if (remainingPoints === 0) {
        setRiddleSolved(true);
      }
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
    } catch (error) {
      // Error handled silently
    }
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
        {/* Map Component - Task 5 coordinates */}
        <div className="h-80 w-full rounded-lg overflow-hidden border border-[#BB133A]/30">
          <InteractiveMap 
            target={{ lat: 50.087027, lng: 14.417338 }} // Task 5 coordinates
            height="320px"
          />
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={() => setPhase('riddle')}
            className="bg-[#BB133A] hover:bg-[#A01030] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
          >
            We are here
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderRiddlePhase = () => (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">
          Task 5:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90">
        {!riddleSolved ? (
          <>
            <div className="prose prose-invert max-w-none">
              <p><strong>Bravo adventurers!</strong></p>
              <p>
                You&apos;ve arrived at the Municipal Library, a dragon&apos;s hoard of books, guarding more 
                wisdom than one lifetime can hold. The First Student wandered here and nearly never returned 
                (some say they&apos;re still stuck between the shelves). Step carefully… this place has eaten 
                up all the weekends.
              </p>
              <p>
                There is one secret waiting for you inside - a strange, endless tower that is not built of stone.
              </p>
              <p>
                <strong>Find the name of this creation and unlock your further journey:</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="bg-[#BB133A]/20 text-[#BB133A] border-[#BB133A]/30">
                  Points: {riddlePoints}
                </Badge>
                <Badge variant="outline" className="border-yellow-400/50 text-yellow-300">
                  Attempts: {riddleAttempts}
                </Badge>
              </div>
              
              <div className="flex gap-3">
                <Input
                  value={riddleAnswer}
                  onChange={(e) => setRiddleAnswer(e.target.value)}
                  placeholder="Enter the name of the tower..."
                  className="bg-white/10 border-[#BB133A]/30 text-white placeholder:text-white/60"
                  onKeyPress={(e) => e.key === 'Enter' && handleRiddleSubmit()}
                />
                <Button 
                  onClick={handleRiddleSubmit}
                  className="bg-[#BB133A] hover:bg-[#A01030] text-white"
                >
                  Submit
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-[#BB133A]">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Riddle Solved!</span>
            </div>
            <p>You earned <strong>{riddlePoints} points</strong> for this riddle!</p>
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
          Well done, seekers!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90 text-center">
        <div className="prose prose-invert max-w-none">
          <p>
            You have uncovered the name of the spiral tower - <strong>Idiom</strong> - a monument of endless 
            pages and silent whispers. The first student once claimed that if you stare into its depths 
            long enough, it stares back, testing your courage.
          </p>
          <p>
            Now, let&apos;s continue on your journey where more secrets of Prague await!
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 py-4">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <span className="text-lg font-bold text-white">
            Task 5 Complete! Total Score: {totalScore} points
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
            "Continue to Task 6"
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
              <Badge variant="outline" className="border-[#BB133A]/50 text-[#BB133A]">
                Task 5
              </Badge>
              <Badge 
                variant="secondary" 
                className={cn(
                  "capitalize",
                  status === 'done' ? "bg-[#BB133A]/20 text-[#BB133A] border-[#BB133A]/30" :
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
          {phase === 'riddle' && renderRiddlePhase()}
          {phase === 'completed' && renderCompletedPhase()}
        </div>
      </div>
    </div>
  );
}
