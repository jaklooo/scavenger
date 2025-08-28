"use client";

import { useQuery, useMutation, useQueryClient } from "react-query";
import { 
  getSubmissionsByTeam, 
  createSubmission, 
  deleteSubmission 
} from "@/services/submissions";
import { useAuth } from "@/hooks/use-auth";
import { Submission } from "@/schemas";
import toast from "react-hot-toast";

export function useTeamSubmissions() {
  const { userData } = useAuth();
  
  return useQuery<Submission[]>(
    ["submissions", userData?.teamId],
    () => {
      if (!userData?.teamId) {
        throw new Error("No team ID");
      }
      return getSubmissionsByTeam(userData.teamId);
    },
    {
      enabled: !!userData?.teamId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function useTaskSubmissions(taskId: string) {
  const { userData } = useAuth();
  
  return useQuery<Submission[]>(
    ["submissions", userData?.teamId, taskId],
    async () => {
      if (!userData?.teamId) {
        throw new Error("No team ID");
      }
      const allSubmissions = await getSubmissionsByTeam(userData.teamId);
      return allSubmissions.filter(submission => submission.taskId === taskId);
    },
    {
      enabled: !!userData?.teamId && !!taskId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function useCreateSubmission() {
  const { userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation(
    async ({ taskId, file, caption }: { taskId: string; file: File; caption?: string }) => {
      if (!userData?.teamId) {
        throw new Error("No team ID");
      }
      return createSubmission(userData.teamId, taskId, file, caption);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["submissions", userData?.teamId]);
        toast.success("Submission uploaded successfully!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to upload submission");
      },
    }
  );
}

export function useDeleteSubmission() {
  const { userData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation(
    async ({ submissionId }: { submissionId: string }) => {
      if (!userData?.teamId) {
        throw new Error("No team ID");
      }
      await deleteSubmission(userData.teamId, submissionId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["submissions", userData?.teamId]);
        toast.success("Submission deleted successfully!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete submission");
      },
    }
  );
}
