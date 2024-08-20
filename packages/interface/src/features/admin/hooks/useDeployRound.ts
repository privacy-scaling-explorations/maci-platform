import { type UseMutationResult, useMutation } from "@tanstack/react-query";

import { useRound } from "~/contexts/Round";
import { useUploadMetadata } from "~/hooks/useMetadata";

import type { Round } from "~/features/rounds/types";
import type { TransactionError } from "~/features/voters/hooks/useApproveVoters";

export type TUseDeployRoundReturn = Omit<UseMutationResult<string, Error, Round>, "error"> & {
  error: Error | TransactionError | null;
  isDeploying: boolean;
};

export function useDeployRound(options: {
  onSuccess: (data: string) => void;
  onError: (err: Error) => void;
}): TUseDeployRoundReturn {
  const upload = useUploadMetadata();

  const { addRound } = useRound();

  const mutation = useMutation({
    mutationFn: async (values: Round) => {
      if (!values.roundLogo) {
        throw new Error("No images included.");
      }

      const roundLogoImageFile = await fetch(values.roundLogo).then((logoImage) => logoImage.blob());

      const roundLogoUrl = await upload.mutateAsync(new File([roundLogoImageFile], "roundLogo"));

      addRound({ ...values, roundLogo: roundLogoUrl.url });

      return roundLogoUrl.url;
    },
    ...options,
  });

  return {
    ...mutation,
    error: upload.error ?? mutation.error,
    isDeploying: upload.isPending,
  };
}
