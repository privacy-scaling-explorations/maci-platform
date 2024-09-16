import { DefaultError, useMutation, UseMutationResult } from "@tanstack/react-query";
import { Hex, TransactionReceipt } from "viem";
import { useAccount } from "wagmi";

import { approveApplication, submitApplication } from "~/utils/registry";

/**
 * Approve an application for a given refUID
 * @returns whether the approval was successful
 */
export function useSubmitApproval(): UseMutationResult<boolean, DefaultError, { refUID: string }> {
  const { chain } = useAccount();

  return useMutation({
    mutationFn: async ({ refUID }: { refUID: string }) => {
      if (!chain) {
        throw new Error("Connect wallet first");
      }

      return approveApplication(chain, refUID);
    },
  });
}

/**
 * Submit an application for approval
 * @returns whether the submission was successful
 */
export function useSubmitApplication(): UseMutationResult<
  TransactionReceipt,
  DefaultError,
  { refUID?: string | undefined; metadataUrl: string; registryAddress: Hex; recipient: `0x${string}` }
> {
  const { chain } = useAccount();

  return useMutation({
    mutationFn: async ({
      refUID,
      metadataUrl,
      registryAddress,
      recipient,
    }: {
      refUID?: string;
      metadataUrl: string;
      registryAddress: Hex;
      recipient: Hex;
    }) => submitApplication(chain!, metadataUrl, registryAddress, recipient, refUID),
  });
}
