import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { type TransactionSigner } from "@ethereum-attestation-service/eas-sdk/dist/transaction";
import { type JsonRpcSigner } from "ethers";

import * as config from "~/config";

export function createEAS(signer: JsonRpcSigner): EAS {
  const eas = new EAS(config.eas.contracts.eas);
  return eas.connect(signer as unknown as TransactionSigner);
}
