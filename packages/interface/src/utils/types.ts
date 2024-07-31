import { type Address } from "viem";

export enum EAppState {
  LOADING = "LOADING",
  REVIEWING = "REVIEWING",
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
