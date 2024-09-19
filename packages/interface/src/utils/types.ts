import { Hex, type Address } from "viem";

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
 *
 * @param id - recipient id (optional on chain)
 * @param metadataUrl - recipient metadata url
 * @param recipient - recipient address
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
  recipient: Hex;
}

/**
 * The request data
 */
export interface IRequest {
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
  recipient: IRecipient;
}

/**
 * The application data 
 */
export interface IApplication {
  /**
   * The application id
   */
  id: string;

  /**
   * The application metadata pointer
   */
  metadataPtr: string;

  /**
   * The recipient address
   */
  recipient: string;
}
