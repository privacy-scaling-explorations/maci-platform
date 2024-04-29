import type { ISnarkJSVerificationKey, EContracts } from "maci-cli/sdk";
import type { BaseContract, Interface, InterfaceAbi } from "ethers";

/**
 * Interface that represents deploy args for initial voice credit proxy
 */
export interface IDeployInitialVoiceCreditProxyArgs {
  /**
   * Amount of voice credits
   */
  amount: number;
}

/**
 * Interface that represents deploy args for gatekeeper
 */
export interface IDeployGatekeeperArgs {
  /**
   * EAS registry address
   */
  easAddress: string;

  /**
   * Schema uuid
   */
  encodedSchema: string;

  /**
   * Attester address
   */
  attester: string;
}

/**
 * Interface that represents deploy args for VkRegistry
 */
export interface IDeployVkRegistryArgs {
  /**
   * Extracted process message zkey for QV
   */
  processMessagesZkeyQv: ISnarkJSVerificationKey;

  /**
   * Extracted process message zkey for Non-QV
   */
  processMessagesZkeyNonQv: ISnarkJSVerificationKey;

  /**
   * Extracted tally votes zkey for QV
   */
  tallyVotesZkeyQv: ISnarkJSVerificationKey;

  /**
   * Extracted tally votes zkey for Non-QV
   */
  tallyVotesZkeyNonQv: ISnarkJSVerificationKey;
}

export interface IRegisterArgs {
  /**
   * Id of the contract
   */
  id: EContracts;

  /**
   * Contract instance
   */
  contract?: BaseContract;

  /**
   * Contract address
   */
  address?: string;

  /**
   * args for ContractStorage
   */
  args?: unknown[];
}

export type IAbi = Record<Partial<EContracts>, Interface | InterfaceAbi >;
