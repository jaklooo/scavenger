"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TaskDetail } from "@/components/task-detail";
import { useTasks, useTeamProgress } from "@/hooks/use-tasks";
import { ArrowLeft, Trophy, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function JourneyPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: progress, isLoading: progressLoading } = useTeamProgress();

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

      {/* Tasks List */}
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
        ) : (
          tasks?.map((task, index) => {
            const status = getTaskStatus(task.id);
            const Icon = getTaskIcon(status);
            
            return (
              <Card 
                key={task.id}
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20",
                  status === "done" && "bg-green-50 border-green-200",
                  status === "in_review" && "bg-yellow-50 border-yellow-200"
                )}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {task.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getTaskBadgeVariant(status)}>
                            <Icon className="w-3 h-3 mr-1" />
                            {status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {task.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {task.description && (
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2">
                      {task.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
