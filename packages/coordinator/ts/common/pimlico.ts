import { Chain, createPublicClient, http, TransactionReceipt } from "viem";

/**
 * Generate the RPCUrl for Pimlico based on the chain we need to interact with
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genPimlicoRPCUrl = (network: string): string => {
  const pimlicoAPIKey = process.env.PIMLICO_API_KEY;

  if (!pimlicoAPIKey) {
    throw new Error("PIMLICO_API_KEY is not set");
  }

  return `https://api.pimlico.io/v2/${network}/rpc?apikey=${pimlicoAPIKey}`;
};

export const getPublicClient = (rpc: string, chain: Chain) => {
  const transport = http(rpc);

  return createPublicClient({
    chain: chain,
    transport,
  });
};

export const contractCreationEventTopic = "0x4db17dd5e4732fb6da34a148104a592783ca119a1e7bb8829eba6cbadef0b511"
/**
 * Get the address of the newly deployed contract from a transaction receipt
 * @param receipt - The transaction receipt
 * @returns The address of the newly deployed contract
 */
export const getDeployedContractAddress = (
  receipt: TransactionReceipt
): string | undefined => {

  const addr = receipt.logs.find(
    (log) => log.topics[0] === contractCreationEventTopic,
  );

  const deployedAddress = addr ? "0x" + addr.topics[1]?.slice(26) : undefined;

  return deployedAddress
}
