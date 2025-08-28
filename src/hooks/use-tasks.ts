"use client";

import { useQuery, useMutation, useQueryClient } from "react-query";
import { getAllTasks } from "@/services/tasks";
import { getTeamProgress, updateTaskProgress } from "@/services/progress";
import { useAuth } from "@/hooks/use-auth";
import { Task, Progress } from "@/schemas";
import toast from "react-hot-toast";

export function useTasks() {
  return useQuery<Array<Task & { id: string }>>(
    "tasks",
    getAllTasks,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useTeamProgress() {
  const { userData } = useAuth();
  
  return useQuery<Array<Progress & { taskId: string }>>(
    ["progress", userData?.teamId],
    () => {
      if (!userData?.teamId) {
        throw new Error("No team ID");
      }
      return getTeamProgress(userData.teamId);
    },
    {
      enabled: !!userData?.teamId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function useUpdateTaskProgress() {
  const { userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation(
    async ({ taskId, status }: { taskId: string; status: Progress["status"] }) => {
      if (!userData?.teamId) {
        throw new Error("No team ID");
      }
      await updateTaskProgress(userData.teamId, taskId, status);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["progress", userData?.teamId]);
        toast.success("Task status updated!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update task status");
      },
    }
  );
}
