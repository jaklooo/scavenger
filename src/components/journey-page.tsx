"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TaskDetail } from "@/components/task-detail";
import { useTasks, useTeamProgress } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { updateTeam } from "@/services/teams";
import { ArrowLeft, Trophy, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";


export function JourneyPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: progress, isLoading: progressLoading } = useTeamProgress();
  const { userData } = useAuth();

  const isLoading = tasksLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate progress statistics
  const completedTasks = progress?.filter(p => p.status === "done").length || 0;
  const totalTasks = tasks?.length || 0;
  const totalPoints = tasks?.reduce((sum, task) => sum + task.points, 0) || 0;
  const earnedPoints = tasks?.reduce((sum, task) => {
    const taskProgress = progress?.find(p => p.taskId === task.id);
    return sum + (taskProgress?.status === "done" ? task.points : 0);
  }, 0) || 0;

  const getTaskStatus = (taskId: string) => {
    return progress?.find(p => p.taskId === taskId)?.status || "todo";
  };

  const getTaskBadgeVariant = (status: string) => {
    switch (status) {
      case "done": return "done";
      case "in_review": return "in_review";
      default: return "todo";
    }
  };

  const getTaskIcon = (status: string) => {
    switch (status) {
      case "done": return CheckCircle2;
      case "in_review": return Clock;
      default: return Trophy;
    }
  };

  const handleContinueToNext = () => {
    if (!tasks || !selectedTaskId) return;
    const currentIndex = tasks.findIndex(t => t.id === selectedTaskId);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < tasks.length) {
      setSelectedTaskId(tasks[nextIndex].id);
    } else {
      // All tasks completed, go back to journey overview
      setSelectedTaskId(null);
    }
  };

  if (selectedTaskId) {
    const task = tasks?.find(t => t.id === selectedTaskId);
    if (!task) {
      setSelectedTaskId(null);
      return null;
    }

    // Show intro only for the first task (index 0) and only if not shown before
    const taskIndex = tasks?.findIndex(t => t.id === selectedTaskId) || -1;
    // const shouldShowIntro = taskIndex === 0 && !introShown;

    // if (shouldShowIntro) {
    //   setShowIntro(true);
    //   setIntroShown(true);
    // }

    // if (showIntro) {
    //   return (
    //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/95 overflow-y-auto">
    //       <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border-4 border-primary relative animate-fade-in h-full max-h-screen flex flex-col justify-center p-0 sm:p-8">
    //         <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 overflow-y-auto">
    //           <div className="mb-4">
    //             <span className="inline-block bg-primary text-white rounded-full p-3 mb-2">
    //               <Trophy className="w-8 h-8" />
    //             </span>
    //             <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-primary font-serif tracking-tight">Welcome, brave adventurers!</h2>
    //           </div>
    //           <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 font-medium">
    //             You’ve entered the legendary world of Charles University, where knowledge is power, food is survival, and trams are always late. It is a place where history, knowledge, and student life have intertwined for nearly 700 years. But rumours speak of a hidden legacy, the path walked by the very first international students of Prague, long forgotten.<br /><br />
    //             Long ago, the First International Student left behind a Student Survival Map, a guide to thriving in Prague. However, the map was divided into pieces, scattered across the city. Only by solving riddles, working together, and facing the busy tourist-filled streets can you put it back together.
    //           </p>
    //         </div>
    //         <div className="p-4 sm:p-8 border-t border-primary/10 bg-white">
    //           <Button
    //             className="w-full py-3 text-lg font-bold bg-primary hover:bg-primary-800 text-white rounded-xl shadow-lg transition"
    //             onClick={() => setShowIntro(false)}
    //             disabled={introLoading}
    //           >
    //             Start Your Adventure
    //           </Button>
    //         </div>
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <TaskDetail 
        task={task} 
        onBack={() => setSelectedTaskId(null)}
        onContinue={handleContinueToNext}
        status={getTaskStatus(selectedTaskId)}
        isFirstTask={task?.order === 1 || task?.title?.toLowerCase().includes('task 1') || taskIndex === 0}
      />
    );
  }

  // Nájdeme prvú nesplnenú úlohu (status !== "done")
  type Task = {
    title: string;
    description: string;
    points: number;
    order: number;
    active: boolean;
    id: string;
  };
  let nextTask: Task | undefined;
  let nextTaskIndex = -1;
  if (tasks && tasks.length > 0) {
    // Najprv hľadáme prvú úlohu so statusom "todo"
    nextTaskIndex = tasks.findIndex(task => getTaskStatus(task.id) === "todo");
    if (nextTaskIndex !== -1) {
      nextTask = tasks[nextTaskIndex];
    } else {
      // Ak nie sú žiadne "todo" úlohy, hľadáme prvú "in_review" úlohu
      nextTaskIndex = tasks.findIndex(task => getTaskStatus(task.id) === "in_review");
      if (nextTaskIndex !== -1) {
        nextTask = tasks[nextTaskIndex];
      }
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 font-['Inter','Poppins',sans-serif] relative">
      {/* Dashboard Background */}
      <div className="dashboard-bg"></div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className="w-full flex justify-center px-2 pt-8">
        <div className="w-full max-w-lg text-center">
          <div className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] leading-tight mb-2" style={{ fontFamily: 'Poppins, sans-serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Our Journey
          </div>
          <div className="text-[var(--text-secondary)] text-lg font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            Track your progress and complete tasks!
          </div>
        </div>
      </div>

      {/* Progress Overview - krajší vizuál */}
      <div className="max-w-lg mx-auto px-2 py-4">
        <div className="space-y-6">
          <div className="relative w-full h-7 flex items-center">
            <div className="absolute left-0 top-0 w-full h-full rounded-full journey-glass-card opacity-80" />
            <div
              className="transition-all duration-700 ease-in-out h-full rounded-full journey-progress-bar shadow-lg"
              style={{ width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%` }}
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--text-primary)] font-bold text-lg drop-shadow">
              {totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="journey-stats-card rounded-xl p-4">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{completedTasks}</div>
              <div className="text-sm text-[var(--text-secondary)]">Completed</div>
            </div>
            <div className="journey-stats-card rounded-xl p-4">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{totalTasks}</div>
              <div className="text-sm text-[var(--text-secondary)]">Total Tasks</div>
            </div>
            <div className="journey-stats-card rounded-xl p-4">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{earnedPoints}</div>
              <div className="text-sm text-[var(--text-secondary)]">Points</div>
            </div>
          </div>
        </div>
      </div>


      {/* Tasks List - zobraz všetky tasky pre testovanie */}
      <div className="max-w-lg mx-auto px-2 py-4 space-y-4">
        {tasks?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No tasks available at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks?.map((task, idx) => {
            const status = getTaskStatus(task.id);
            const Icon = getTaskIcon(status);
            return (
              <Card
                key={task.id}
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-all duration-200 hover:shadow-xl group",
                  status === "done" && "journey-glass-card-done",
                  status === "in_review" && "journey-glass-card-review",
                  status !== "done" && status !== "in_review" && "journey-glass-card"
                )}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight text-[var(--text-primary)]">
                          {task.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getTaskBadgeVariant(status)} className="bg-white/20 text-[var(--text-primary)] border-white/30">
                            <Icon className="w-3 h-3 mr-1" />
                            {status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {task.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {task.description && (
                  <CardContent className="pt-0">
                    <CardDescription className="text-[var(--text-secondary)]">
                      {task.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      </div>

      <BottomNavigation />
    </div>
  );
}
