import { DefaultError, useMutation, UseMutationResult } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { approveRequest, submitAddRequest, submitEditRequest } from "~/utils/registry";

import type { Hex, TransactionReceipt } from "viem";

/*
 * Arguments for the submitRequest function
 */
interface SubmitRequestArgs {
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
  /**
   * The recipient index of the project, should be 0, 1, 2, ...
   */
  recipientIndex?: string;
}

/**
 * Submit a project proposal for approval
 *
 * @returns whether the submission was successful
 */
export function useSubmitAddRequest(): UseMutationResult<TransactionReceipt, DefaultError, SubmitRequestArgs> {
  const { chain } = useAccount();

  return useMutation({
    mutationFn: async ({ metadataUrl, registryAddress, recipient }: SubmitRequestArgs) =>
      submitAddRequest(chain!, metadataUrl, registryAddress, recipient),
  });
}

/**
 * Submit a edit project proposal for approval
 *
 * @returns whether the submission was successful
 */
export function useSubmitEditRequest(): UseMutationResult<TransactionReceipt, DefaultError, SubmitRequestArgs> {
  const { chain } = useAccount();

  return useMutation({
    mutationFn: async ({ metadataUrl, registryAddress, recipient, recipientIndex }: SubmitRequestArgs) =>
      submitEditRequest(chain!, metadataUrl, registryAddress, recipient, recipientIndex ?? ""),
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

  return useMutation({
    mutationFn: async ({ requestIndex }: SubmitApprovalArgs) => approveRequest(chain!, requestIndex),
  });
}
