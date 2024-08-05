import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useMemo } from "react";
import { useConnectorClient } from "wagmi";

import type { Account, Chain, Client, Transport } from "viem";

function clientToSigner(client: Client<Transport, Chain, Account>): JsonRpcSigner | undefined {
  const { account, chain, transport } = client;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!chain) {
    return undefined;
  }

  const provider = new BrowserProvider(transport, {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  });

  return new JsonRpcSigner(provider, account.address);
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}): JsonRpcSigner | undefined {
  const { data: client } = useConnectorClient({ chainId });

  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}
