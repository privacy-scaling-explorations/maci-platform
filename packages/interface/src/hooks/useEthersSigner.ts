import { KernelAccountClient } from "@zerodev/sdk";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import { useMemo } from "react";
import { HttpTransport, Chain, createWalletClient, http, Client } from "viem";
import { useConnectorClient } from "wagmi";

import { getRPCURL } from "~/config";

function clientToSigner(
  client: KernelAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain> | Client,
): JsonRpcSigner | undefined {
  const { account, chain } = client;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
}: { chainId?: number; client?: KernelAccountClient<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain> } = {}):
  | JsonRpcSigner
  | undefined {
  const { data: connectorClient } = useConnectorClient({ chainId });
  const resolvedClient = client ?? connectorClient;

  return useMemo(() => (resolvedClient ? clientToSigner(resolvedClient) : undefined), [resolvedClient]);
}
