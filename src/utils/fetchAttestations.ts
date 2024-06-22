import { encodeBytes32String, decodeBytes32String } from "ethers";
import { fromHex, type Address } from "viem";

import { config, eas } from "~/config";

import { createCachedFetch } from "./fetch";

const cachedFetch = createCachedFetch({ ttl: 1000 * 60 * 10 });

export interface AttestationWithMetadata {
  id: string;
  refUID: string;
  attester: Address;
  recipient: Address;
  revoked: boolean;
  time: number;
  decodedDataJson: string;
  schemaId: string;
}

export type Attestation = Omit<AttestationWithMetadata, "decodedDataJson"> & {
  name: string;
  metadataPtr: string;
};

interface MatchFilter {
  equals?: string;
  in?: string[];
  gte?: number;
}
interface MatchWhere {
  id?: MatchFilter;
  attester?: MatchFilter;
  recipient?: MatchFilter;
  refUID?: MatchFilter;
  schemaId?: MatchFilter;
  time?: MatchFilter;
  decodedDataJson?: { contains: string };
  AND?: MatchWhere[];
}
interface AttestationsFilter {
  take?: number;
  skip?: number;
  orderBy?: {
    time?: "asc" | "desc";
  }[];
  where?: MatchWhere;
}

const AttestationsQuery = `
  query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!], $take: Int, $skip: Int) {
    attestations(take: $take, skip: $skip, orderBy: $orderBy, where: $where) {
      id
      refUID
      decodedDataJson
      attester
      recipient
      revoked
      schemaId
      time
      time
    }
  }
`;

export async function fetchAttestations(schema: string[], filter?: AttestationsFilter): Promise<Attestation[]> {
  const startsAt = Math.floor(+config.startsAt / 1000);

  return cachedFetch<{ attestations: AttestationWithMetadata[] }>(eas.url, {
    method: "POST",
    body: JSON.stringify({
      query: AttestationsQuery,
      variables: {
        ...filter,
        where: {
          schemaId: { in: schema },
          revoked: { equals: false },
          time: { gte: startsAt },
          ...filter?.where,
        },
      },
    }),
  }).then((r) => r.data.attestations.map(parseAttestation));
}

export async function fetchApprovedVoter(address: string): Promise<boolean | number> {
  if (config.skipApprovedVoterCheck) {
    return true;
  }

  return fetchAttestations([eas.schemas.approval], {
    where: {
      recipient: { equals: address },
      ...createDataFilter("type", "bytes32", "voter"),
    },
  }).then((attestations) => attestations.length);
}

export async function fetchApprovedVoterAttestations(address: string): Promise<boolean | Attestation[]> {
  if (config.skipApprovedVoterCheck) {
    return true;
  }

  return fetchAttestations([eas.schemas.approval], {
    where: {
      recipient: { equals: address },
      ...createDataFilter("type", "bytes32", "voter"),
    },
  }).then((attestations) => attestations);
}

function parseAttestation({ decodedDataJson, ...attestation }: AttestationWithMetadata): Attestation {
  return { ...attestation, ...parseDecodedMetadata(decodedDataJson) };
}

interface Metadata {
  name: string;
  metadataPtr: string;
  round: string;
  type: string;
}

export function parseDecodedMetadata(json: string): Metadata {
  const data = JSON.parse(json) as { name: string; value: { value: string } }[];
  const metadata = data.reduce((acc, x) => ({ ...acc, [x.name]: x.value.value }), {}) as Metadata;

  return {
    ...metadata,
    // type: parseBytes(metadata.type),
    // round: parseBytes(metadata.round),
  };
}

export const parseBytes = (hex: string): string => decodeBytes32String(fromHex(hex as Address, "bytes"));

export const formatBytes = (string: string): string => encodeBytes32String(string);

const typeMaps = {
  bytes32: (v: string) => formatBytes(v),
  string: (v: string) => v,
};

export interface AttestationFilter {
  decodedDataJson: {
    contains: string;
  };
}

export function createSearchFilter(value: string): AttestationFilter {
  const formatter = typeMaps.string;

  return {
    decodedDataJson: {
      contains: formatter(value),
    },
  };
}

export function createDataFilter(name: string, type: "bytes32" | "string", value: string): AttestationFilter {
  const formatter = typeMaps[type];

  return {
    decodedDataJson: {
      contains: `"name":"${name}","type":"${type}","value":"${formatter(value)}`,
    },
  };
}
