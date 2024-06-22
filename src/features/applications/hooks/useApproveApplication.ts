import { type Transaction } from "@ethereum-attestation-service/eas-sdk";
import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { config, eas } from "~/config";
import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";
import { useAttest } from "~/hooks/useEAS";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { createAttestation } from "~/lib/eas/createAttestation";

export function useApproveApplication(opts?: {
  onSuccess?: () => void;
}): UseMutationResult<Transaction<string[]>, Error | TransactionError, string[]> {
  const attest = useAttest();
  const signer = useEthersSigner();

  return useMutation({
    mutationFn: async (applicationIds: string[]) => {
      if (!signer) {
        throw new Error("Connect wallet first");
      }

      const attestations = await Promise.all(
        applicationIds.map((refUID) =>
          createAttestation(
            {
              values: { type: "application", round: config.roundId },
              schemaUID: eas.schemas.approval,
              refUID,
            },
            signer,
          ),
        ),
      );
      return attest.mutateAsync(attestations.map((att) => ({ ...att, data: [att.data] })));
    },
    onSuccess: () => {
      toast.success("Application approved successfully!");
      opts?.onSuccess?.();
    },
    onError: (err: { reason?: string; data?: { message: string } }) =>
      toast.error("Application approve error", {
        description: err.reason ?? err.data?.message,
      }),
  });
}
