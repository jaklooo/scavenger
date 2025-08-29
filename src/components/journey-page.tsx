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
  const [showIntro, setShowIntro] = useState(false);
  const [introLoading, setIntroLoading] = useState(true);

  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: progress, isLoading: progressLoading } = useTeamProgress();
  const { userData } = useAuth();

  useEffect(() => {
    let ignore = false;
    const checkIntro = async () => {
      if (!userData?.teamId) {
        if (!ignore) setIntroLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/teams/${userData.teamId}`);
        const team = await res.json();
        if (!ignore) setShowIntro(!(team && team.introductionSeen));
      } catch {
        if (!ignore) setShowIntro(true);
      } finally {
        if (!ignore) setIntroLoading(false);
      }
    };
    checkIntro();
    return () => { ignore = true; };
  }, [userData?.teamId]);

  const isLoading = tasksLoading || progressLoading || introLoading;

  const handleIntroContinue = async () => {
    setIntroLoading(true);
    if (userData?.teamId) {
      await updateTeam(userData.teamId, { introductionSeen: true });
    }
    setShowIntro(false);
    setIntroLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/95">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-4 border-primary relative animate-fade-in">
          <div className="mb-4">
            <span className="inline-block bg-primary text-white rounded-full p-3 mb-2">
              <Trophy className="w-8 h-8" />
            </span>
            <h2 className="text-3xl font-extrabold mb-2 text-primary font-serif tracking-tight">Welcome, brave adventurers!</h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
            You’ve entered the legendary world of Charles University, where knowledge is power, food is survival, and trams are always late. It is a place where history, knowledge, and student life have intertwined for nearly 700 years. But rumours speak of a hidden legacy, the path walked by the very first international students of Prague, long forgotten.<br /><br />
            Long ago, the First International Student left behind a Student Survival Map, a guide to thriving in Prague. However, the map was divided into pieces, scattered across the city. Only by solving riddles, working together, and facing the busy tourist-filled streets can you put it back together.
          </p>
          <Button
            className="w-full py-3 text-lg font-bold bg-primary hover:bg-primary-800 text-white rounded-xl shadow-lg transition"
            onClick={handleIntroContinue}
            disabled={introLoading}
          >
            Continue
          </Button>
        </div>
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

  if (selectedTaskId) {
    const task = tasks?.find(t => t.id === selectedTaskId);
    if (!task) {
      setSelectedTaskId(null);
      return null;
    }

    return (
      <TaskDetail 
        task={task} 
        onBack={() => setSelectedTaskId(null)}
        status={getTaskStatus(selectedTaskId)}
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
    nextTaskIndex = tasks.findIndex(task => getTaskStatus(task.id) !== "done");
    if (nextTaskIndex !== -1) {
      nextTask = tasks[nextTaskIndex];
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-4">Our Journey</h1>
          {/* Progress Overview */}
          <div className="space-y-4">
            <Progress 
              value={completedTasks} 
              max={totalTasks} 
              className="bg-primary-800"
            />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{completedTasks}</div>
                <div className="text-sm text-primary-200">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalTasks}</div>
                <div className="text-sm text-primary-200">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{earnedPoints}</div>
                <div className="text-sm text-primary-200">Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List - zobraz len jednu aktívnu úlohu */}
      <div className="max-w-lg mx-auto p-6 space-y-4">
        {tasks?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No tasks available at the moment.
              </p>
            </CardContent>
          </Card>
        ) : nextTask ? (
          (() => {
            const status = getTaskStatus(nextTask!.id);
            const Icon = getTaskIcon(status);
            return (
              <Card 
                key={nextTask!.id}
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20",
                  status === "done" && "bg-green-50 border-green-200",
                  status === "in_review" && "bg-yellow-50 border-yellow-200"
                )}
                onClick={() => setSelectedTaskId(nextTask!.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {nextTaskIndex + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {nextTask!.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getTaskBadgeVariant(status)}>
                            <Icon className="w-3 h-3 mr-1" />
                            {status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {nextTask!.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {nextTask!.description && (
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2">
                      {nextTask!.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            );
          })()
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-green-400 mb-4" />
              <p className="text-green-700 font-semibold">
                Congratulations! All tasks are completed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
