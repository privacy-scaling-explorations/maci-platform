import { DefaultError, useMutation, UseMutationResult } from "@tanstack/react-query";

import { config } from "~/config";
import { approveApplication, submitApplication } from "~/utils/registry";

import type { Hex, TransactionReceipt } from "viem";

/*
 * Arguments for the submitApplication function
 */
interface SubmitApplicationArgs {
  /**
   * The attestation ID if EAS Registry
   */
  refUID?: string;
  /**
   * The URL of the metadata
   */
  metadataUrl: string;
  /**
   * The address of the registry
   */
  registryAddress: Hex;
  /**
   * The recipient of the attestation
   */
  recipient: Hex;
}

/**
 * Submit an application for approval
 *
 * @returns whether the submission was successful
 */
export function useSubmitApplication(): UseMutationResult<TransactionReceipt, DefaultError, SubmitApplicationArgs> {
  return useMutation({
    mutationFn: async ({ refUID, metadataUrl, registryAddress, recipient }: SubmitApplicationArgs) =>
      submitApplication(config.network, metadataUrl, registryAddress, recipient, refUID),
  });
}

/**
 * Arguments for the submitApproval function
 */
interface SubmitApprovalArgs {
  /**
   * The attestation ID if EAS Registry
   */
  refUID: string;
}

/**
 * Approve an application for a given refUID
 *
 * @returns whether the approval was successful
 */
export function useSubmitApproval(): UseMutationResult<boolean, DefaultError, SubmitApprovalArgs> {
  return useMutation({
    mutationFn: async ({ refUID }: SubmitApprovalArgs) => approveApplication(config.network, refUID),
  });
}
