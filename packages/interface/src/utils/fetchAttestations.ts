import { eas } from "~/config";

import { createCachedFetch } from "./fetch";
import { parseAttestation, createDataFilter } from "./fetchAttestationsUtils";
import { type AttestationWithMetadata, type AttestationsFilter, type Attestation, AttestationsQuery } from "./types";

const cachedFetch = createCachedFetch({ ttl: 1000 * 60 * 10 });

/// TODO: add roundId as one of the filter
export async function fetchAttestations(schema: string[], filter?: AttestationsFilter): Promise<Attestation[]> {
  return cachedFetch<{ attestations: AttestationWithMetadata[] }>(eas.url, {
    method: "POST",
    body: JSON.stringify({
      query: AttestationsQuery,
      variables: {
        ...filter,
        where: {
          schemaId: { in: schema },
          revoked: { equals: false },
          ...filter?.where,
        },
      },
    }),
  }).then((r) => r.data.attestations.map(parseAttestation));
}

export async function fetchApprovedVoter(address: string): Promise<boolean | number> {
  return fetchAttestations([eas.schemas.approval], {
    where: {
      recipient: { equals: address },
      ...createDataFilter("type", "bytes32", "voter"),
    },
  }).then((attestations) => attestations.length);
}

export async function fetchApprovedVoterAttestations(address: string): Promise<boolean | Attestation[]> {
  return fetchAttestations([eas.schemas.approval], {
    where: {
      recipient: { equals: address },
      ...createDataFilter("type", "bytes32", "voter"),
    },
  }).then((attestations) => attestations);
}
