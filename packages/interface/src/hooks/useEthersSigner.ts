import { KernelAccountClient } from "@zerodev/sdk";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useMemo } from "react";
import { Chain, createWalletClient, http, Client, Transport } from "viem";
import { useConnectorClient } from "wagmi";

import { getRPCURL } from "~/config";

function clientToSigner(client: KernelAccountClient<Transport, Chain> | Client): JsonRpcSigner | undefined {
  const { account, chain } = client;

  if (!chain || !account) {
    return undefined;
  }

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(getRPCURL()),
  });

  const provider = new BrowserProvider(walletClient.transport, {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  });

  return new JsonRpcSigner(provider, account.address);
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({
  chainId,
  client,
}: { chainId?: number; client?: KernelAccountClient<Transport, Chain> } = {}): JsonRpcSigner | undefined {
  const { data: connectorClient } = useConnectorClient({ chainId });
  const resolvedClient = client ?? connectorClient;

  return useMemo(() => (resolvedClient ? clientToSigner(resolvedClient) : undefined), [resolvedClient]);
}
