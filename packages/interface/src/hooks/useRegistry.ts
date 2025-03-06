import { DefaultError, useMutation, UseMutationResult } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { approveRequest, submitAddRequest } from "~/utils/registry";

import type { Hex, TransactionReceipt } from "viem";

/*
 * Arguments for the submitRequest function
 */
interface SubmitRequestArgs {
  /**
   * The index of request
   */
  requestIndex?: string;
  /**
   * The URL of the metadata
   */
  metadataUrl: string;
  /**
   * The address of the registry
   */
  registryAddress: Hex;
  /**
   * The recipient of the project
   */
  recipient: Hex;
}

/**
 * Submit a project proposal for approval
 *
 * @returns whether the submission was successful
 */
export function useSubmitAddRequest(): UseMutationResult<TransactionReceipt, DefaultError, SubmitRequestArgs> {
  const { chain } = useAccount();

  return useMutation({
    mutationFn: async ({ requestIndex: refUID, metadataUrl, registryAddress, recipient }: SubmitRequestArgs) =>
      submitAddRequest(chain!, metadataUrl, registryAddress, recipient, refUID),
  });
}

/**
 * Arguments for the submitApproval function
 */
interface SubmitApprovalArgs {
  /**
   * The index of request
   */
  requestIndex: string;
}

/**
 * Approve a request for a given index
 *
 * @returns whether the approval was successful
 */
export function useSubmitApproval(): UseMutationResult<boolean, DefaultError, SubmitApprovalArgs> {
  const { chain } = useAccount();

  if (!chain) {
    throw new Error("Connect wallet first");
  }

  return useMutation({
    mutationFn: async ({ requestIndex }: SubmitApprovalArgs) => approveRequest(chain, requestIndex),
  });
}
