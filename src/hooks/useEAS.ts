import { AttestationRequest, Transaction, type MultiAttestationRequest } from "@ethereum-attestation-service/eas-sdk";
import { type DefaultError, type UseMutationResult, useMutation } from "@tanstack/react-query";

import { useEthersSigner } from "~/hooks/useEthersSigner";
import { createAttestation } from "~/lib/eas/createAttestation";
import { createEAS } from "~/lib/eas/createEAS";

export function useCreateAttestation(): UseMutationResult<
  AttestationRequest,
  DefaultError,
  { values: Record<string, unknown>; schemaUID: string }
> {
  const signer = useEthersSigner();

  return useMutation({
    mutationFn: async (data: { values: Record<string, unknown>; schemaUID: string }) => {
      if (!signer) {
        throw new Error("Connect wallet first");
      }

      return createAttestation(data, signer);
    },
  });
}

export function useAttest(): UseMutationResult<Transaction<string[]>, DefaultError, MultiAttestationRequest[]> {
  const signer = useEthersSigner();

  return useMutation({
    mutationFn: (attestations: MultiAttestationRequest[]) => {
      if (!signer) {
        throw new Error("Connect wallet first");
      }
      const eas = createEAS(signer);

      return eas.multiAttest(attestations);
    },
  });
}
