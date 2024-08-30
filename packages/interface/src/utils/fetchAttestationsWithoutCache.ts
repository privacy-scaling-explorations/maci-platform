import { config, eas } from "~/config";

import { parseAttestation, createDataFilter } from "./fetchAttestationsUtils";
import { type AttestationWithMetadata, type Attestation, AttestationsQuery } from "./types";

export async function fetchApprovedApplications(roundId: string, ids?: string[]): Promise<Attestation[]> {
  return fetch(eas.url, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
      query: AttestationsQuery,
      variables: {
        where: {
          schemaId: { in: [eas.schemas.approval] },
          revoked: { equals: false },
          attester: { equals: config.admin },
          refUID: ids ? { in: ids } : undefined,
          AND: [createDataFilter("type", "bytes32", "application"), createDataFilter("round", "bytes32", roundId)],
        },
      },
    }),
  })
    .then((res) => res.json() as unknown as { data: { attestations: AttestationWithMetadata[] }; error: Error })
    .then((r) => r.data.attestations.map(parseAttestation));
}
