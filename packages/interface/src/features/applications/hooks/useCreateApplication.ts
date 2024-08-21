import { type UseMutationResult, useMutation } from "@tanstack/react-query";

import { eas } from "~/config";
import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";
import { useAttest, useCreateAttestation } from "~/hooks/useEAS";
import { useUploadMetadata } from "~/hooks/useMetadata";

import type { Application } from "../types";
import type { Transaction } from "@ethereum-attestation-service/eas-sdk";

export type TUseCreateApplicationReturn = Omit<
  UseMutationResult<Transaction<string[]>, Error | TransactionError, Application>,
  "error"
> & {
  error: Error | TransactionError | null;
  isAttesting: boolean;
  isUploading: boolean;
};

export function useCreateApplication(options: {
  onSuccess: (data: Transaction<string[]>) => void;
  onError: (err: TransactionError) => void;
  roundId: string;
}): TUseCreateApplicationReturn {
  const attestation = useCreateAttestation();
  const attest = useAttest();
  const upload = useUploadMetadata();

  const mutation = useMutation({
    mutationFn: async (values: Application) => {
      if (!values.bannerImageUrl || !values.profileImageUrl) {
        throw new Error("No images included.");
      }

      const [profileImageFile, bannerImageFile] = await Promise.all([
        fetch(values.profileImageUrl),
        fetch(values.bannerImageUrl),
      ]).then(([profileImage, bannerImage]) => Promise.all([profileImage.blob(), bannerImage.blob()]));

      const [profileImageUrl, bannerImageUrl] = await Promise.all([
        upload.mutateAsync(new File([profileImageFile], "profileImage")),
        upload.mutateAsync(new File([bannerImageFile], "bannerImage")),
      ]);

      const metadataValues = { ...values, profileImageUrl: profileImageUrl.url, bannerImageUrl: bannerImageUrl.url };

      return Promise.all([
        upload.mutateAsync(metadataValues).then(({ url: metadataPtr }) =>
          attestation.mutateAsync({
            schemaUID: eas.schemas.metadata,
            values: {
              name: values.name,
              metadataType: 0, // "http"
              metadataPtr,
              type: "application",
              round: options.roundId,
            },
          }),
        ),
      ]).then((attestations) => attest.mutateAsync(attestations.map((att) => ({ ...att, data: [att.data] }))));
    },

    ...options,
  });

  return {
    ...mutation,
    error: attest.error ?? upload.error ?? mutation.error,
    isAttesting: attest.isPending,
    isUploading: upload.isPending,
  };
}
