import { type Transaction } from "@ethereum-attestation-service/eas-sdk";
import { type UseMutationResult, useMutation } from "@tanstack/react-query";

import { eas } from "~/config";
import { useAttest } from "~/hooks/useEAS";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { createAttestation } from "~/lib/eas/createAttestation";

// TODO: Move this to a shared folders
export interface TransactionError {
  reason?: string;
  data?: { message: string };
}

export function useApproveVoters(options: {
  onSuccess: () => void;
  onError: (err: TransactionError) => void;
}): UseMutationResult<Transaction<string[]>, unknown, string[]> {
  const attest = useAttest();
  const signer = useEthersSigner();

  return useMutation({
    mutationFn: async (voters: string[]) => {
      if (!signer) {
        throw new Error("Connect wallet first");
      }

      /// TODO: should be changed to event name instead of roundId
      const attestations = await Promise.all(
        voters.map((recipient) =>
          createAttestation(
            {
              values: { type: "voter" },
              schemaUID: eas.schemas.approval,
              recipient,
            },
            signer,
          ),
        ),
      );
      return attest.mutateAsync(attestations.map((att) => ({ ...att, data: [att.data] })));
    },
    ...options,
  });
}
