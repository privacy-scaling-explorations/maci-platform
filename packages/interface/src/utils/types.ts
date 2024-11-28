import type { IGetPollData } from "maci-cli/sdk";
import type { Address, Hex } from "viem";

export enum ERoundState {
  LOADING = "LOADING",
  APPLICATION = "APPLICATION",
  VOTING = "VOTING",
  TALLYING = "TALLYING",
  RESULTS = "RESULTS",
  DEFAULT = "DEFAULT",
}

export enum EInfoCardState {
  PASSED = "PASSED",
  ONGOING = "ONGOING",
  UPCOMING = "UPCOMING",
}

export enum EBreakpointSizes {
  S = 320,
  M = 480,
  L = 768,
  XL = 1280,
}

export interface AttestationWithMetadata {
  id: string;
  refUID: string;
  attester: Address;
  recipient: Address;
  revoked: boolean;
  time: number;
  decodedDataJson: string;
  schemaId: string;
  txid: string;
}

export type Attestation = Omit<AttestationWithMetadata, "decodedDataJson"> & {
  name: string;
  metadataPtr: string;
};

export interface jsonPCD {
  pcd: string;
}

export interface MatchFilter {
  equals?: string;
  in?: string[];
  gte?: number;
}
export interface MatchWhere {
  id?: MatchFilter;
  attester?: MatchFilter;
  recipient?: MatchFilter;
  refUID?: MatchFilter;
  schemaId?: MatchFilter;
  time?: MatchFilter;
  txid?: MatchFilter;
  decodedDataJson?: { contains: string };
  AND?: MatchWhere[];
}
export interface AttestationsFilter {
  take?: number;
  skip?: number;
  orderBy?: {
    time?: "asc" | "desc";
  }[];
  where?: MatchWhere;
}

export interface AttestationFilter {
  decodedDataJson: {
    contains: string;
  };
}

export interface Metadata {
  name: string;
  metadataPtr: string;
  round: string;
  type: string;
}

export interface TallyResult {
  id: string;
  result: string;
}

export const AttestationsQuery = `
  query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!], $take: Int, $skip: Int) {
    attestations(take: $take, skip: $skip, orderBy: $orderBy, where: $where) {
      id
      refUID
      decodedDataJson
      attester
      recipient
      revoked
      schemaId
      txid
      time
    }
  }
`;

/**
 * The poll data
 */
export interface Poll {
  /**
   * The poll id
   */
  pollId: string;
  /**
   * The poll creation date
   */
  createdAt: string;
  /**
   * The poll duration
   */
  duration: string;
  /**
   * MACI's state root
   */
  stateRoot: string;
  /**
   * The poll message root
   */
  messageRoot: string;
  /**
   * The poll number of signups
   */
  numSignups: string;
  /**
   * The poll id
   */
  id: string;
  /**
   * The poll mode
   */
  mode: string;
  /**
   * The poll init time
   */
  initTime: string;
  /**
   * The poll registry data
   */
  registry: {
    /**
     * The poll registry address
     */
    id: string;
    /**
     * The poll metadata url
     */
    metadataUrl: string;
  };
  /**
   * The poll tally data
   */
  tally: {
    /**
     * The poll tally address
     */
    id: string;
  };
}

/**
 * The tally data
 */
export interface Tally {
  /**
   * The tally address
   */
  id: string;
  /**
   * an array with the results
   */
  results: TallyResult[];
}

/**
 * The request type
 */
export enum ERequestType {
  /**
   * Add a new recipient
   */
  Add = 0,
  /**
   * Change a recipient
   */
  Change = 1,
  /**
   * Remove a recipient
   */
  Remove = 2,
}

/**
 * The request status
 */
export enum ERequestStatus {
  /**
   * The request is pending
   */
  Pending = 0,
  /**
   * The request is approved
   */
  Approved = 1,
  /**
   * The request is rejected
   */
  Rejected = 2,
}

/**
 * The recipient data
 */
export interface IRecipient {
  /**
   * The recipient id (optional on chain so can use 0)
   */
  id: string;
  /**
   * The recipient metadata url
   */
  metadataUrl: string;
  /**
   * The recipient address
   */
  payout: Hex;
  /**
   * The recipient index
   */
  index: string;
  /**
   * Whether it was approved or not
   */
  initialized?: boolean;
}

/**
 * The recipient data for the contract
 */
export interface IRecipientContract {
  /**
   * The recipient id (optional on chain so can use 0)
   */
  id: Hex;
  /**
   * The recipient metadata url
   */
  metadataUrl: string;
  /**
   * The recipient address
   */
  recipient: Hex;
  /**
   * Whether it was approved or not
   */
  initialized?: boolean;
}

/**
 * An interface describing a request sent to a RegistryManager contract
 */
export interface IRequest {
  /**
   * The index of the application (optional onchain for Add so can use 0)
   */
  index: string;
  /**
   * The registry address
   */
  registry: Hex;
  /**
   * The request type
   */
  requestType: ERequestType;
  /**
   * The request status
   */
  status: ERequestStatus;
  /**
   * The recipient data
   */
  recipient: IRecipient | IRecipientContract;
}

/**
 *
 */
export interface IRequestContract {
  /**
   * The index of the application (optional onchain for Add so can use 0)
   */
  index: bigint;
  /**
   * The registry address
   */
  registry: Hex;
  /**
   * The request type
   */
  requestType: ERequestType;
  /**
   * The request status
   */
  status: ERequestStatus;
  /**
   * The recipient data
   */
  recipient: IRecipientContract;
}

/**
 * An extended interface describing the poll data
 */
export interface IPollData extends IGetPollData {
  /**
   * The registry address
   */
  registryAddress: string;
  /**
   * The metadata url
   */
  metadataUrl: string;
  /**
   * The poll init time
   */
  initTime: bigint | number | string | null;
  /**
   * The tally address
   */
  tallyAddress: string;
}

/**
 * An interface describing the metadata of a round
 */
export interface IRoundMetadata {
  /**
   * The round id
   */
  roundId: string;
  /**
   * The round description
   */
  description: string;
  /**
   * The time the round starts
   */
  startsAt: string;
  /**
   * The time the registration ends
   */
  registrationEndsAt: string;
  /**
   * The time the voting starts
   */
  votingStartsAt: string;
  /**
   * The time the voting ends
   */
  votingEndsAt: string;
}

/**
 * An interface describing a round (Poll)
 */
export interface IRoundData {
  /**
   * Whether the round is merged or not
   */
  isMerged: boolean;
  /**
   * The poll id
   */
  pollId: string;
  /**
   * The poll number of signups
   */
  numSignups: string;
  /**
   * The poll address
   */
  pollAddress: string;
  /**
   * The poll mode
   */
  mode: string;
  /**
   * The registry address
   */
  registryAddress: string;
  /**
   * The round id
   */
  roundId: string;
  /**
   * The round description
   */
  description: string;
  /**
   * The round starts at
   */
  startsAt: Date;
  /**
   * The round registration ends at
   */
  registrationEndsAt: Date;
  /**
   * The round voting starts at
   */
  votingStartsAt: Date;
  /**
   * The round voting ends at
   */
  votingEndsAt: Date;
  /**
   * The round tally address
   */
  tallyAddress: string;
}

export interface IRecipientWithVotes extends IRecipient {
  votes: number;
}
