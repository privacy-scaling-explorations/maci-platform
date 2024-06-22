import { type UseMutationResult, useMutation } from "@tanstack/react-query";

import { config, eas } from "~/config";
import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";
import { useAttest, useCreateAttestation } from "~/hooks/useEAS";
import { useUploadMetadata } from "~/hooks/useMetadata";

import type { Application, Profile } from "../types";
import type { Transaction } from "@ethereum-attestation-service/eas-sdk";

export type TUseCreateApplicationReturn = Omit<
  UseMutationResult<Transaction<string[]>, Error | TransactionError, { application: Application; profile: Profile }>,
  "error"
> & {
  error: Error | TransactionError | null;
  isAttesting: boolean;
  isUploading: boolean;
};

export function useCreateApplication(options: {
  onSuccess: () => void;
  onError: (err: TransactionError) => void;
}): TUseCreateApplicationReturn {
  const attestation = useCreateAttestation();
  const attest = useAttest();
  const upload = useUploadMetadata();

  const mutation = useMutation({
    mutationFn: async (values: { application: Application; profile: Profile }) =>
      Promise.all([
        upload.mutateAsync(values.application).then(({ url: metadataPtr }) =>
          attestation.mutateAsync({
            schemaUID: eas.schemas.metadata,
            values: {
              name: values.application.name,
              metadataType: 0, // "http"
              metadataPtr,
              type: "application",
              round: config.roundId,
            },
          }),
        ),
        upload.mutateAsync(values.profile).then(({ url: metadataPtr }) =>
          attestation.mutateAsync({
            schemaUID: eas.schemas.metadata,
            values: {
              name: values.profile.name,
              metadataType: 0, // "http"
              metadataPtr,
              type: "profile",
              round: config.roundId,
            },
          }),
        ),
      ]).then((attestations) => attest.mutateAsync(attestations.map((att) => ({ ...att, data: [att.data] })))),

    ...options,
  });

  return {
    ...mutation,
    error: attest.error ?? upload.error ?? mutation.error,
    isAttesting: attest.isPending,
    isUploading: upload.isPending,
  };
}
