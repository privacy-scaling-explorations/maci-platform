import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";
import { useSubmitApproval } from "~/hooks/useRegistry";

/**
 * Approve applications
 *
 * @param opts - Options for the mutation
 * @returns the result of the mutation
 */
export function useApproveApplication(opts: {
  onSuccess?: () => void;
}): UseMutationResult<boolean[], Error | TransactionError, string[]> {
  const approve = useSubmitApproval();

  return useMutation({
    mutationFn: async (applicationIds: string[]) => {
      const successes: boolean[] = [];

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < applicationIds.length; i += 1) {
        const applicationId = applicationIds[i];
        // eslint-disable-next-line no-await-in-loop
        const success = await approve.mutateAsync({ refUID: applicationId! });
        successes.push(success);
      }
      return successes;
    },
    onSuccess: () => {
      toast.success("Application approved successfully!");
      opts.onSuccess?.();
    },
    onError: (err: { reason?: string; data?: { message: string } }) =>
      toast.error("Application approve error", {
        description: err.reason ?? err.data?.message,
      }),
  });
}
