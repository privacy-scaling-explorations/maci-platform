import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";
import { useSubmitApproval } from "~/hooks/useRegistry";

/**
 * Approve request, including request with type Add/Change/Remove
 *
 * @param opts - Options for the mutation
 * @returns the result of the mutation
 */
export function useApproveRequest(opts: {
  onSuccess?: () => void;
}): UseMutationResult<boolean[], Error | TransactionError, string[]> {
  const approve = useSubmitApproval();

  return useMutation({
    mutationFn: async (requestIndices: string[]) => {
      const successes: boolean[] = [];

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < requestIndices.length; i += 1) {
        const requestIndex = requestIndices[i];
        // eslint-disable-next-line no-await-in-loop
        const success = await approve.mutateAsync({ requestIndex: requestIndex! });
        successes.push(success);
      }
      return successes;
    },
    onSuccess: () => {
      toast.success("Request approved successfully!");
      opts.onSuccess?.();
    },
    onError: (err: { reason?: string; data?: { message: string } }) =>
      toast.error("Request approve error", {
        description: err.reason ?? err.data?.message,
      }),
  });
}
