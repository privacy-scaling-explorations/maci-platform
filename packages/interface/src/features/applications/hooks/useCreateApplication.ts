import { type UseMutationResult, useMutation } from "@tanstack/react-query";
import { RegistryManager__factory as RegistryManagerFactory } from "maci-platform-contracts/typechain-types";
import { createPublicClient, custom, Hex } from "viem";
import { useAccount } from "wagmi";

import { useRound } from "~/contexts/Round";
import { type TransactionError } from "~/features/voters/hooks/useApproveVoters";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { useUploadMetadata } from "~/hooks/useMetadata";
import { useSubmitApplication } from "~/hooks/useRegistry";
import { getRegistryManagerContract } from "~/utils/registry";

import type { Application } from "../types";

export type TUseCreateApplicationReturn = Omit<
  UseMutationResult<bigint, Error | TransactionError, Application>,
  "error"
> & {
  error: Error | TransactionError | null;
  isPending: boolean;
  isSuccess: boolean;
};

/**
 * Hook to create an application
 *
 * @param options - Options for the hook
 * @returns the result of the mutation
 */
export function useCreateApplication(options: {
  onSuccess: (id: bigint) => void;
  onError: (err: Error) => void;
  roundId: string;
}): TUseCreateApplicationReturn {
  const upload = useUploadMetadata();

  const { chain } = useAccount();
  const { getRoundByRoundId } = useRound();

  const roundData = getRoundByRoundId(options.roundId);

  const submitApplication = useSubmitApplication();
  const signer = useEthersSigner();

  const mutation = useMutation({
    mutationFn: async (values: Application) => {
      if (!signer || !chain) {
        throw new Error("Please connect your wallet first");
      }

      if (!values.bannerImageUrl || !values.profileImageUrl) {
        throw new Error("No images included.");
      }

      if (!roundData?.registryAddress) {
        throw new Error("No registry found for this round.");
      }

      const [profileImageFile, bannerImageFile] = await Promise.all([
        fetch(values.profileImageUrl),
        fetch(values.bannerImageUrl),
      ]).then(([profileImage, bannerImage]) => Promise.all([profileImage.blob(), bannerImage.blob()]));

      const [profileImageUrl, bannerImageUrl] = await Promise.all([
        upload.mutateAsync(new File([profileImageFile], "profileImage")),
        upload.mutateAsync(new File([bannerImageFile], "bannerImage")),
      ]);

      const metadataValues = {
        ...values,
        profileImageUrl: profileImageUrl.url,
        bannerImageUrl: bannerImageUrl.url,
        submittedAt: Date.now().valueOf(),
      };

      const uploadRes = await upload.mutateAsync(metadataValues);

      const recipient = values.payoutAddress as Hex;

      // now we submit the approval request
      const res = await submitApplication.mutateAsync({
        metadataUrl: uploadRes.url,
        recipient,
        registryAddress: roundData.registryAddress as Hex,
      });

      if (res.status !== "success") {
        throw new Error("Failed to submit application");
      }

      // get the last application id
      const publicClient = createPublicClient({
        transport: custom(window.ethereum!),
        chain,
      });

      const registryManagerAddress = await getRegistryManagerContract(chain);

      const requestCount = await publicClient.readContract({
        address: registryManagerAddress,
        abi: RegistryManagerFactory.abi,
        functionName: "requestCount",
      });

      return requestCount - 1n;
    },

    ...options,
  });

  return {
    ...mutation,
    error: submitApplication.error ?? upload.error ?? mutation.error,
    isPending: submitApplication.isPending || upload.isPending,
    isSuccess: submitApplication.isSuccess && upload.isSuccess,
  };
}
