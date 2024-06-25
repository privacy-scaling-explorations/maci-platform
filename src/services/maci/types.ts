import type { ISnarkJSVerificationKey, EContracts } from "maci-cli/sdk";
import type {
  BaseContract,
  BigNumberish,
  Interface,
  InterfaceAbi,
} from "ethers";

/**
 * Interface that represents deploy args for most of the deploy functions
 */
export interface IDeployArgs {
  forceDeploy?: boolean;
}

/**
 * Interface that represents deploy args for initial voice credit proxy
 */
export interface IDeployInitialVoiceCreditProxyArgs {
  /**
   * Amount of voice credits
   */
  amount: number;

  /**
   * Force deploy regardless of stored contract
   */
  forceDeploy?: boolean;
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

  /**
   * Force deploy regardless of stored contract
   */
  forceDeploy?: boolean;
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

  /**
   * Force deploy regardless of stored contract
   */
  forceDeploy?: boolean;
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
   * Group key for same contracts
   */
  key?: BigNumberish;

  /**
   * args for ContractStorage
   */
  args?: unknown[];
}

export interface IDeployPollArgs {
  /**
   * Poll duration
   */
  duration: number;

  /**
   * MACI public key of coordinator
   */
  pubKey: string;
}

export interface IGenProofArgs {
  /**
   * signature signed by coordinator
   */
  signature: string;

  /**
   * signed message
   */
  message: string;

  /**
   * coordinator maci private key
   */
  maciPrivKey: string;
}

export interface IMACIData {
  address: string;
  startBlock: number;
}

export type IAbi = Record<Partial<EContracts>, Interface | InterfaceAbi>;
