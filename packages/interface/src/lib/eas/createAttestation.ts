import {
  SchemaEncoder,
  SchemaRegistry,
  type SchemaValue,
  type AttestationRequest,
  type TransactionSigner,
} from "@ethereum-attestation-service/eas-sdk";
import { type JsonRpcSigner } from "ethers";

import * as config from "~/config";

interface Params {
  values: Record<string, unknown>;
  schemaUID: string;
  recipient?: string;
  refUID?: string;
}

export async function createAttestation(params: Params, signer: JsonRpcSigner): Promise<AttestationRequest> {
  const recipient = params.recipient ?? (await signer.getAddress());

  const data = await encodeData(params, signer);

  return {
    schema: params.schemaUID,
    data: {
      recipient,
      expirationTime: 0n,
      revocable: true,
      data,
      refUID: params.refUID,
    },
  };
}

async function encodeData({ values, schemaUID }: Params, signer: JsonRpcSigner) {
  const schemaRegistry = new SchemaRegistry(config.eas.contracts.schemaRegistry);

  schemaRegistry.connect(signer as unknown as TransactionSigner);

  const schemaRecord = await schemaRegistry.getSchema({ uid: schemaUID });

  const schemaEncoder = new SchemaEncoder(schemaRecord.schema);

  const dataToEncode = schemaRecord.schema.split(",").map((param) => {
    const [type, name] = param.trim().split(" ");
    if (name && type) {
      const value = values[name] as SchemaValue;
      return { name, type, value };
    }
    throw new Error(`Attestation data: ${name} not found in ${JSON.stringify(values)}`);
  });

  return schemaEncoder.encodeData(dataToEncode);
}
