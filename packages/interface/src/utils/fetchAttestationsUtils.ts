import { encodeBytes32String } from "ethers";

import type { Metadata, AttestationWithMetadata, Attestation, AttestationFilter } from "./types";

export function parseAttestation({ decodedDataJson, ...attestation }: AttestationWithMetadata): Attestation {
  return { ...attestation, ...parseDecodedMetadata(decodedDataJson) };
}

export function parseDecodedMetadata(json: string): Metadata {
  const data = JSON.parse(json) as { name: string; value: { value: string } }[];
  const metadata = data.reduce((acc, x) => ({ ...acc, [x.name]: x.value.value }), {}) as Metadata;

  return metadata;
}

const typeMaps = {
  bytes32: (v: string) => encodeBytes32String(v),
  string: (v: string) => v,
};

export function createDataFilter(name: string, type: "bytes32" | "string", value: string): AttestationFilter {
  const formatter = typeMaps[type];

  return {
    decodedDataJson: {
      contains: `"name":"${name}","type":"${type}","value":"${formatter(value)}`,
    },
  };
}
