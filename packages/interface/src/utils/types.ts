import type { IGetPollData } from "maci-cli/sdk";
import type { Address } from "viem";

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

export interface IPollData extends IGetPollData {
  registryAddress: string;
  metadataUrl: string;
  initTime: bigint | number | string | null;
}

export interface IRoundMetadata {
  roundId: string;
  description: string;
  startsAt: string;
  registrationEndsAt: string;
  votingStartsAt: string;
  votingEndsAt: string;
  tallyFile: string;
}

export interface IRoundData {
  isMerged: boolean;
  pollId: string;
  numSignups: string;
  pollAddress: string;
  mode: string;
  registryAddress: string;
  roundId: string;
  description: string;
  startsAt: Date;
  registrationEndsAt: Date;
  votingStartsAt: Date;
  votingEndsAt: Date;
  tallyFile: string;
}
