import { HatsClient } from "@hatsprotocol/sdk-v1-core";
import { createPublicClient, http, type PublicClient } from "viem";

import { config } from "~/config";

/**
 * Get an HatsClient instance to check whether the connected wallet owns the required hat
 * @returns An HatsClient instance
 */
export const getHatsClient = (): HatsClient => {
  const client = createPublicClient({
    chain: config.network,
    transport: http(),
  });

  const hatsClient = new HatsClient({
    chainId: client.chain.id,
    publicClient: client as unknown as PublicClient,
  });

  return hatsClient;
};
