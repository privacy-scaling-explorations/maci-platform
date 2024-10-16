import type { BigNumberish } from "ethers";
import type { IGetPollData } from "maci-cli/sdk";
import type { Hex, Address } from "viem";

export enum EAppState {
  LOADING = "LOADING",
  APPLICATION = "APPLICATION",
  VOTING = "VOTING",
  TALLYING = "TALLYING",
  RESULTS = "RESULTS",
}

export enum EInfoCardState {
  PASSED = "PASSED",
  ONGOING = "ONGOING",
  UPCOMING = "UPCOMING",
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
 * The request data
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
   * The poll registry address
   */
  registry: {
    id: string;
  };
}

export interface IPollData extends IGetPollData {
  registry: Hex;
  initTime: BigNumberish;
}
