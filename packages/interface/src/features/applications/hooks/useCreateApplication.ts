import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import { Hex, TransactionReceipt } from "viem";

import { config, eas } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";
import { useAttest, useCreateAttestation } from "~/hooks/useEAS";
import { useUploadMetadata } from "~/hooks/useMetadata";
import { useSubmitApplication } from "~/hooks/useRegistry";

import type { Application } from "../types";

export type TUseCreateApplicationReturn = Omit<
  UseMutationResult<TransactionReceipt, Error | TransactionError, Application>,
  "error"
> & {
  error: Error | TransactionError | null;
  isAttesting: boolean;
  isUploading: boolean;
};

/**
 * Hook to create an application.
 * @param options - The options to pass to the hook.
 * @returns The mutation result.
 */
export function useCreateApplication(options: {
  onSuccess: (data: TransactionReceipt) => void;
  onError: (err: Error) => void;
}): TUseCreateApplicationReturn {
  const attestation = useCreateAttestation();
  const attest = useAttest();
  const submitApplication = useSubmitApplication();
  const upload = useUploadMetadata();
  const { pollData } = useMaci();

  const mutation = useMutation({
    mutationFn: async (values: Application) => {
      if (!values.bannerImageUrl || !values.profileImageUrl) {
        throw new Error("No images included.");
      }

      if (!pollData?.registry) {
        throw new Error("No registry found.");
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

      const uploadRes = await upload.mutateAsync(metadataValues);

      const attestationRes = await attestation.mutateAsync({
        schemaUID: eas.schemas.metadata,
        values: {
          name: values.name,
          metadataType: 0, // "http"
          metadataPtr: uploadRes.url,
          type: "application",
          round: config.roundId,
        },
      });

      // now we submit the approval request
      const res = await submitApplication.mutateAsync({
        metadataUrl: uploadRes.url,
        recipient: attestationRes.data.recipient as Hex,
        registryAddress: pollData.registry,
      });

      if (res.status !== "success") {
        throw new Error("Failed to submit application");
      }

      return res;
    },

    ...options,
  });

  return {
    ...mutation,
    error: attest.error ?? upload.error ?? mutation.error,
    isAttesting: submitApplication.isPending,
    isUploading: upload.isPending,
  };
}
