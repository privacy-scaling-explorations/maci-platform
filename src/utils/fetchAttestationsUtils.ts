import { encodeBytes32String, decodeBytes32String } from "ethers";
import { fromHex, type Address } from "viem";

import type { Metadata, AttestationWithMetadata, Attestation, AttestationFilter } from "./types";

export function parseAttestation({ decodedDataJson, ...attestation }: AttestationWithMetadata): Attestation {
  return { ...attestation, ...parseDecodedMetadata(decodedDataJson) };
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
