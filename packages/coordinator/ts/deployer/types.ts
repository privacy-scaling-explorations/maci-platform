import { EGatekeepers, EInitialVoiceCreditProxies } from "maci-contracts";

import type { Abi, Hex } from "viem";

import { ESupportedNetworks } from "../common";

/**
 * IDeployMACIArgs represents the arguments for deploying MACI
 */
export interface IDeployMaciArgs {
  /**
   * The address of the session key
   */
  sessionKeyAddress: Hex;
  /**
   * The approval for the session key
   */
  approval: string;
  /**
   * The chain name
   */
  chain: ESupportedNetworks;
  /**
   * The configuration for deploying MACI
   */
  config: IDeployMaciConfig;
}

/**
 * IDeployPollArgs represents the arguments for deploying a poll
 */
export interface IDeployPollArgs {
  /**
   * The address of the session key
   */
  sessionKeyAddress: Hex;
  /**
   * The approval for the session key
   */
  approval: string;
  /**
   * The chain name
   */
  chain: ESupportedNetworks;
  /**
   * The configuration for deploying a poll
   */
  config: IDeployPollConfig;
}

/**
 * IConstantInitialVoiceCreditProxyArgs represents the arguments for deploying a constant initial voice credit proxy
 */
export interface IConstantInitialVoiceCreditProxyArgs {
  /**
   * The amount of initial voice credits to deploy
   */
  amount: string;
}

/**
 * IEASGatekeeperArgs represents the arguments for deploying an EAS gatekeeper
 */
export interface IEASGatekeeperArgs {
  /**
   * The address of the EAS contract
   */
  easAddress: string;
  /**
   * The attestation schema to be used
   */
  schema: string;
  /**
   * The trusted attester
   */
  attester: string;
}

/**
 * IZupassGatekeeperArgs represents the arguments for deploying a Zupass gatekeeper
 */
export interface IZupassGatekeeperArgs {
  /**
   * The first signer
   */
  signer1: string;
  /**
   * The second signer
   */
  signer2: string;
  /**
   * The event ID
   */
  eventId: string;
  /**
   * The Zupass verifier address
   */
  zupassVerifier: string;
}

/**
 * IHatsGatekeeperArgs represents the arguments for deploying a Hats gatekeeper
 */
export interface IHatsGatekeeperArgs {
  /**
   * The hats protocol address
   */
  hatsProtocolAddress: string;
  /**
   * The criterion hats
   */
  critrionHats: string[];
}

/**
 * ISemaphoreGatekeeperArgs represents the arguments for deploying a semaphore gatekeeper
 */
export interface ISemaphoreGatekeeperArgs {
  /**
   * The semaphore contract address
   */
  semaphoreContract: string;
  /**
   * The group ID
   */
  groupId: string;
}

/**
 * IGitcoinPassportGatekeeperArgs represents the arguments for deploying a gitcoin passport gatekeeper
 */
export interface IGitcoinPassportGatekeeperArgs {
  /**
   * The decoder address
   */
  decoderAddress: string;
  /**
   * The passing score
   */
  passingScore: string;
}

/**
 * IVkRegistryArgs represents the arguments for deploying a VkRegistry
 */
export interface IVkRegistryArgs {
  /**
   * The state tree depth
   */
  stateTreeDepth: bigint;
  /**
   * The int state tree depth determines the tally batch size
   */
  intStateTreeDepth: bigint;
  /**
   * The message tree depth
   */
  messageTreeDepth: bigint;
  /**
   * The vote option tree depth
   */
  voteOptionTreeDepth: bigint;
  /**
   * The message batch depth
   */
  messageBatchDepth: bigint;
}

/**
 * IGatekeeperArgs represents the arguments for deploying a gatekeeper
 */
export type IGatekeeperArgs =
  | IEASGatekeeperArgs
  | IZupassGatekeeperArgs
  | IHatsGatekeeperArgs
  | ISemaphoreGatekeeperArgs
  | IGitcoinPassportGatekeeperArgs;

export type IInitialVoiceCreditProxyArgs = IConstantInitialVoiceCreditProxyArgs;
/**
 * DeployMaciConfig is the configuration for deploying MACI
 */
export interface IDeployMaciConfig {
  /**
   * The gatekeeper configuration
   */
  gatekeeper: {
    type: EGatekeepers;
    args?: IGatekeeperArgs;
  };
  /**
   * The initial voice credits proxy configuration
   */
  initialVoiceCreditsProxy: {
    type: EInitialVoiceCreditProxies;
    args: IInitialVoiceCreditProxyArgs;
  };
  /**
   * The MACI configuration
   */
  MACI: {
    stateTreeDepth: number;
    gatekeeper: EGatekeepers;
  };
  /**
   * The VkRegistry configuration
   */
  VkRegistry: {
    args: IVkRegistryArgs;
  };
}

/**
 * DeployPollConfig is the configuration for deploying a poll
 */
export interface IDeployPollConfig {
  /**
   * The poll duration
   */
  pollDuration: number;
  /**
   * The coordinator pubkey
   */
  coordinatorPubkey: string;
  /**
   * Whether to use quadratic voting
   */
  useQuadraticVoting: boolean;
  /**
   * Determines the tally batch size
   */
  intStateTreeDepth: number;
  /**
   * Determines the message batch size
   */
  messageTreeSubDepth: number;
  /**
   * Message tree depth
   */
  messageTreeDepth: number;
  /**
   * Vote option tree depth
   */
  voteOptionTreeDepth: number;
  /**
   * Gatekeeper address
   */
  gatekeeper: string;
  /**
   * Voice credit proxy address
   */
  voiceCreditProxy: string;
  /**
   * The relayer addresses
   */
  relayers?: string[];
}

/**
 * IContractData represents the data for a contract
 */
export interface IContractData {
  /**
   * The ABI of the contract
   */
  abi: Abi;
  /**
   * The bytecode of the contract
   */
  bytecode: Hex;
  /**
   * Whether the contract is already deployed
   */
  alreadyDeployed: boolean;
}
