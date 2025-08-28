import { useMutation, useQueryClient } from "react-query";
import { updateSubmission } from "@/services/submissions";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";

export function useAdminUpdateSubmission() {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  return useMutation(
    async ({ teamId, submissionId, updates }: { teamId: string; submissionId: string; updates: any }) => {
      if (!userData || userData.role !== "admin") {
        throw new Error("Only admins can update submissions");
      }
      await updateSubmission(teamId, submissionId, updates);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("all-submissions");
        toast.success("Submission updated");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update submission");
      },
    }
  );
}
