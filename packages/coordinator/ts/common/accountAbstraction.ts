import dotenv from "dotenv";
import { type Chain, createPublicClient, http, type HttpTransport, type PublicClient } from "viem";

import { ErrorCodes } from "./errors";
import { ESupportedNetworks, viemChain } from "./networks";

dotenv.config();

/**
 * Generate the RPCUrl for Pimlico based on the chain we need to interact with
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genPimlicoRPCUrl = (network: string): string => {
  const pimlicoAPIKey = process.env.PIMLICO_API_KEY;

  if (!pimlicoAPIKey) {
    throw new Error(ErrorCodes.PIMLICO_API_KEY_NOT_SET);
  }

  return `https://api.pimlico.io/v2/${network}/rpc?apikey=${pimlicoAPIKey}`;
};

/**
 * Generate the RPCUrl for Alchemy based on the chain we need to interact with
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genAlchemyRPCUrl = (network: ESupportedNetworks): string => {
  const rpcAPIKey = process.env.RPC_API_KEY;

  if (!rpcAPIKey) {
    throw new Error(ErrorCodes.RPC_API_KEY_NOT_SET);
  }

  switch (network) {
    case ESupportedNetworks.OPTIMISM_SEPOLIA:
      return `https://opt-sepolia.g.alchemy.com/v2/${rpcAPIKey}`;
    case ESupportedNetworks.ETHEREUM_SEPOLIA:
      return `https://eth-sepolia.g.alchemy.com/v2/${rpcAPIKey}`;
    default:
      throw new Error(ErrorCodes.UNSUPPORTED_NETWORK);
  }
};

/**
 * Get a public client
 * @param rpcUrl - the RPC URL
 * @returns the public client
 */
export const getPublicClient = (chainName: ESupportedNetworks): PublicClient<HttpTransport, Chain> =>
  createPublicClient({
    transport: http(genAlchemyRPCUrl(chainName)),
    chain: viemChain(chainName),
  });
