import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import { Hex, TransactionReceipt } from "viem";

import { useMaci } from "~/contexts/Maci";
import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";
import { useUploadMetadata } from "~/hooks/useMetadata";
import { useSubmitApplication } from "~/hooks/useRegistry";

import type { Application } from "../types";
import { useEthersSigner } from "~/hooks/useEthersSigner";

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
  const submitApplication = useSubmitApplication();
  const upload = useUploadMetadata();
  const { pollData } = useMaci();

  const signer = useEthersSigner();

  const mutation = useMutation({
    mutationFn: async (values: Application) => {
      if (!signer) {
        throw new Error("No signer found.");
      }

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

      const metadataValues = { ...values, profileImageUrl: profileImageUrl.url, bannerImageUrl: bannerImageUrl.url, submittedAt: Date.now().valueOf() };

      const uploadRes = await upload.mutateAsync(metadataValues);

      const recipient = (values.payoutAddress ?? (await signer.getAddress())) as Hex;

      // now we submit the approval request
      const res = await submitApplication.mutateAsync({
        metadataUrl: uploadRes.url,
        recipient,
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
    error: submitApplication.error ?? upload.error ?? mutation.error,
    isAttesting: submitApplication.isPending,
    isUploading: upload.isPending,
  };
}
