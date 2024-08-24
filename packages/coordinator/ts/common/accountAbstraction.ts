import { BundlerClient, createBundlerClient, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import type { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import { createPublicClient, http, type HttpTransport, type TransactionReceipt, type PublicClient, Chain } from "viem";

import dotenv from "dotenv";

import { ErrorCodes } from "./errors";
import { ESupportedNetworks, viemChain } from "./networks";

dotenv.config();

/**
 * Generate the RPCUrl for Pimlico based on the chain we need to interact with
 *
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genPimlicoRPCUrl = (network: string): string => {
  const pimlicoAPIKey = process.env.PIMLICO_API_KEY;

  if (!pimlicoAPIKey) {
    throw new Error(ErrorCodes.PIMLICO_API_KEY_NOT_SET.toString());
  }

  return `https://api.pimlico.io/v2/${network}/rpc?apikey=${pimlicoAPIKey}`;
};

/**
 * Generate the RPCUrl for Alchemy based on the chain we need to interact with
 *
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genAlchemyRPCUrl = (network: ESupportedNetworks): string => {
  const rpcAPIKey = process.env.RPC_API_KEY;

  if (!rpcAPIKey) {
    throw new Error(ErrorCodes.RPC_API_KEY_NOT_SET.toString());
  }

  switch (network) {
    case ESupportedNetworks.OPTIMISM_SEPOLIA:
      return `https://opt-sepolia.g.alchemy.com/v2/${rpcAPIKey}`;
    case ESupportedNetworks.ETHEREUM_SEPOLIA:
      return `https://eth-sepolia.g.alchemy.com/v2/${rpcAPIKey}`;
    default:
      throw new Error(ErrorCodes.UNSUPPORTED_NETWORK.toString());
  }
};

/**
 * Get a public client
 *
 * @param chainName - the name of the chain to use
 * @returns the public client
 */
export const getPublicClient = (chainName: ESupportedNetworks): PublicClient<HttpTransport, Chain> =>
  createPublicClient({
    transport: http(genAlchemyRPCUrl(chainName)),
    chain: viemChain(chainName),
  });

/**
 * Get the ZeroDev bundler RPC URL based on the network
 *
 * @param network - the network we are on
 * @returns the ZeroDev bundler RPC URL
 */
export const getZeroDevBundlerRPCUrl = (network: ESupportedNetworks): string => {
  switch (network) {
    case ESupportedNetworks.OPTIMISM_SEPOLIA:
      return process.env.ZERODEV_BUNDLER_RPC_OP_SEPOLIA || "";
    case ESupportedNetworks.OPTIMISM:
      return process.env.ZERODEV_BUNDLER_RPC_OP || "";
    default:
      throw new Error(ErrorCodes.UNSUPPORTED_NETWORK.toString());
  }
};

/**
 * Get a bundler client
 *
 * @param chainName - the chain name
 * @returns the bundler client
 */
export const getBundlerClient = (chainName: ESupportedNetworks): BundlerClient<ENTRYPOINT_ADDRESS_V07_TYPE> =>
  createBundlerClient({
    transport: http(genPimlicoRPCUrl(chainName)),
    chain: viemChain(chainName),
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

/**
 * The topic for the contract creation event
 */
export const contractCreationEventTopic = "0x4db17dd5e4732fb6da34a148104a592783ca119a1e7bb8829eba6cbadef0b511";

/**
 * The offset for the address in the contract creation event
 */
export const addressOffset = 26;

/**
 * Get the address of the newly deployed contract from a transaction receipt
 * @param receipt - The transaction receipt
 * @returns The address of the newly deployed contract
 */
export const getDeployedContractAddress = (receipt: TransactionReceipt): string | undefined => {
  const addr = receipt.logs.find((log) => log.topics[0] === contractCreationEventTopic);

  const deployedAddress = addr ? `0x${addr.topics[1]?.slice(addressOffset)}` : undefined;

  return deployedAddress;
};
