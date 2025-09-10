"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Task, Progress } from "@/schemas";
import { ArrowLeft, Trophy, MapPin, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateTaskProgress } from "@/hooks/use-tasks";
import dynamic from "next/dynamic";

// Dynamically load map to avoid SSR issues
const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

interface Task1WorkflowProps {
  task: Task & { id: string };
  onBack: () => void;
  onContinue: () => void;
  status: "todo" | "in_review" | "done";
}

type WorkflowPhase = 'intro' | 'map' | 'riddle' | 'quiz' | 'completed';

interface QuizQuestion {
  id: number;
  question: string;
  answer: string;
  acceptedAnswers: string[];
  points: number;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "The man who gave us The Trial and The Metamorphosis",
    answer: "Franz Kafka",
    acceptedAnswers: ["franz kafka", "kafka", "f. kafka", "franz k."],
    points: 5
  },
  {
    id: 2,
    question: "The president who led a nation and shares a famous middle name",
    answer: "Tomas Garrique Masaryk", 
    acceptedAnswers: ["tomas garrique masaryk", "masaryk", "t. g. masaryk", "tomas masaryk"],
    points: 5
  },
  {
    id: 3,
    question: "Philosopher and mathematician who explored infinity",
    answer: "Bernard Bolzano",
    acceptedAnswers: ["bernard bolzano", "bolzano", "b. bolzano"],
    points: 5
  },
  {
    id: 4,
    question: "The Nobel laureate who unlocked the secrets of enzymes",
    answer: "Carl Ferdinand Cori",
    acceptedAnswers: ["carl ferdinand cori", "cori", "c. f. cori", "carl cori"],
    points: 5
  }
];

export function Task1Workflow({ task, onBack, onContinue, status }: Task1WorkflowProps) {
  const [phase, setPhase] = useState<WorkflowPhase>('intro');
  const [riddleAnswer, setRiddleAnswer] = useState("");
  const [riddleAttempts, setRiddleAttempts] = useState(0);
  const [riddlePoints, setRiddlePoints] = useState(5);
  const [riddleSolved, setRiddleSolved] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [quizResults, setQuizResults] = useState<{ [key: number]: boolean }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  
  const updateProgressMutation = useUpdateTaskProgress();

  // Check if answer is correct (case-insensitive)
  const checkRiddleAnswer = (answer: string): boolean => {
    const normalizedAnswer = answer.toLowerCase().trim();
    return normalizedAnswer === "carolina" || normalizedAnswer === "universitas carolina";
  };

  const checkQuizAnswer = (questionId: number, answer: string): boolean => {
    const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (!question) return false;
    
    const normalizedAnswer = answer.toLowerCase().trim();
    return question.acceptedAnswers.some(accepted => 
      normalizedAnswer === accepted || normalizedAnswer.includes(accepted.split(' ').pop() || '')
    );
  };

  const handleRiddleSubmit = () => {
    const newAttempts = riddleAttempts + 1;
    setRiddleAttempts(newAttempts);
    
    if (checkRiddleAnswer(riddleAnswer)) {
      const points = Math.max(0, 5 - (newAttempts - 1));
      setRiddlePoints(points);
      setRiddleSolved(true);
      setTotalScore(prev => prev + points);
    } else {
      const remainingPoints = Math.max(0, 5 - newAttempts);
      setRiddlePoints(remainingPoints);
      
      if (remainingPoints === 0) {
        setRiddleSolved(true);
      }
    }
  };

  const handleQuizSubmit = () => {
    const results: { [key: number]: boolean } = {};
    let quizScore = 0;
    
    QUIZ_QUESTIONS.forEach(question => {
      const userAnswer = quizAnswers[question.id] || "";
      const isCorrect = checkQuizAnswer(question.id, userAnswer);
      results[question.id] = isCorrect;
      
      if (isCorrect) {
        quizScore += question.points;
      }
    });
    
    setQuizResults(results);
    setQuizSubmitted(true);
    setTotalScore(prev => prev + quizScore);
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
      // Error handling without toast
    }
  };

  const renderIntroPhase = () => (
    <Card className="glass-card border-0">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-2xl font-bold text-white">
          Welcome, brave adventurers!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90">
        <div className="prose prose-invert max-w-none">
          <p>
            You&apos;ve entered the legendary world of Charles University, where knowledge is power, 
            food is survival, and trams are always late. It is a place where history, knowledge, and 
            student life have intertwined for nearly 700 years. But rumours speak of a hidden 
            legacy, the path walked by the very First International Student of Prague, long forgotten.
          </p>
          <p>
            Long ago, the First International Student left behind a Student Survival Map, a guide to 
            thriving in Prague. However, the map was divided into pieces, scattered across the city. 
            Only by solving riddles, working together, and facing the busy tourist-filled streets can 
            you put it back.
          </p>
        </div>
        
        <div className="flex justify-center pt-6">
          <Button 
            onClick={() => setPhase('map')}
            className="bg-[#BB133A] hover:bg-[#A01030] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg"
          >
            Start the adventure
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderMapPhase = () => (
    <Card className="glass-card border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5" />
          Can you find the place on the map?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Map Component */}
        <div className="h-80 w-full rounded-lg overflow-hidden border border-blue-300/30">
          <InteractiveMap 
            target={{ lat: 50.086227, lng: 14.423745 }} // Task 1 coordinates
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
          The first task awaits you:
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90">
        {!riddleSolved ? (
          <>
            <div className="prose prose-invert max-w-none">
              <p><strong>Dear adventurers,</strong></p>
              <p>
                Every kingdom has its castle, every student their HQ. Here, the leaders of Charles plot, 
                plan, and stamp papers. Here is where the matriculation ceremony took place when the 
                First International Student took the oath, and where it will take place for you too, a place 
                directly rooted in history. Without this place, nothing moves. Where does the university 
                wear its crown?
              </p>
              <p><strong>What is the name that you see on the building?</strong></p>
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
                  placeholder="Enter the building name..."
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
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Riddle Solved!</span>
            </div>
            <p>You earned <strong>{riddlePoints} points</strong> for this riddle!</p>
            <Button 
              onClick={() => setPhase('quiz')}
              className="bg-[#BB133A] hover:bg-[#A01030] text-white"
            >
              Continue to Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderQuizPhase = () => (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">
          Great job adventurers!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90">
        {!quizSubmitted ? (
          <>
            <div className="prose prose-invert max-w-none">
              <p>
                The first trial riddle has been solved, and the first important location has been 
                discovered. Now, another riddle awaits you.
              </p>
              <p>
                Do not look far! The Gate of the University whispers of those who once walked here 
                before you. Among those names are giants of Czech history: writers, thinkers, rebels 
                and scientists.
              </p>
              <p><strong>Seek their names:</strong></p>
            </div>

            <div className="space-y-4">
              {QUIZ_QUESTIONS.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <label className="text-sm font-medium text-white/90">
                    {index + 1}. {question.question}
                  </label>
                  <Input
                    value={quizAnswers[question.id] || ""}
                    onChange={(e) => setQuizAnswers(prev => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))}
                    placeholder="Enter the name..."
                    className="bg-white/10 border-[#BB133A]/30 text-white placeholder:text-white/60"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleQuizSubmit}
                className="bg-[#BB133A] hover:bg-[#A01030] text-white px-8 py-3"
              >
                Submit Quiz
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Quiz Results</h3>
              </div>
              
              {QUIZ_QUESTIONS.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-[#BB133A]/30">
                  <div className="flex-1">
                    <p className="text-sm text-white/90">{index + 1}. {question.question}</p>
                    <p className="text-xs text-white/70">Your answer: {quizAnswers[question.id] || "No answer"}</p>
                    <p className="text-xs text-green-300">Correct answer: {question.answer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {quizResults[question.id] ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <Badge 
                      variant={quizResults[question.id] ? "default" : "secondary"}
                      className={quizResults[question.id] ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"}
                    >
                      {quizResults[question.id] ? `+${question.points}` : "0"}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-4 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <span className="text-xl font-bold text-white">
                    Total Score: {totalScore} points
                  </span>
                </div>
                
                <Button 
                  onClick={() => setPhase('completed')}
                  className="bg-[#BB133A] hover:bg-[#A01030] text-white px-8 py-3"
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderCompletedPhase = () => (
    <Card className="glass-card border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-white">
          Well done, explorers!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-white/90 text-center">
        <div className="prose prose-invert max-w-none">
          <p>
            You stand before some of the guardians of the University&apos;s legacy. Thinkers, dreamers 
            and leaders whose names mark centuries of history. This is where tradition meets your 
            own journey.
          </p>
          <p>
            But a name alone is not enough to walk these halls; you will need proof of who you are. 
            Onward to the place where identities are carved into theâ€¦ system.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-2 py-4">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <span className="text-lg font-bold text-white">
            Task 1 Complete! Total Score: {totalScore} points
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
            "Continue to Task 2"
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
                Task 1
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
          {phase === 'intro' && renderIntroPhase()}
          {phase === 'map' && renderMapPhase()}
          {phase === 'riddle' && renderRiddlePhase()}
          {phase === 'quiz' && renderQuizPhase()}
          {phase === 'completed' && renderCompletedPhase()}
        </div>
      </div>
    </div>
  );
}


