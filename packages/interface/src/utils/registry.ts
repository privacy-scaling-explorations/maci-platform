import { hexlify, randomBytes } from "ethers";
import {
  MACI__factory as MACIFactory,
  RegistryManager__factory as RegistryManagerFactory,
  BaseRegistry__factory as BaseRegistryFactory,
  Poll__factory as PollFactory,
} from "maci-platform-contracts/typechain-types";
import { Chain, createPublicClient, createWalletClient, custom, Hex, http, TransactionReceipt } from "viem";

import { config } from "~/config";

import { ERequestStatus, ERequestType, IRequestContract } from "./types";

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}

/**
 * Get the registry address
 *
 * @param chain - The chain to use
 * @param pollId - The poll id
 * @returns The registry address
 */
export const getRegistryAddress = async (chain: Chain, pollId: bigint): Promise<Hex> => {
  const publicClient = createPublicClient({
    transport: custom(window.ethereum!),
    chain,
  });

  const { poll: pollAddress } = (await publicClient.readContract({
    abi: MACIFactory.abi,
    address: config.maciAddress as Hex,
    functionName: "getPoll",
    args: [pollId],
  })) as { poll: Hex; messageProcessor: Hex; tally: Hex };

  return publicClient.readContract({
    abi: PollFactory.abi,
    address: pollAddress,
    functionName: "registry",
  });
};

/**
 * Get the registry manager contract address
 */
export const getRegistryManagerContract = async (chain: Chain): Promise<Hex> => {
  const publicClient = createPublicClient({
    transport: custom(window.ethereum!),
    chain,
  });

  return publicClient.readContract({
    abi: MACIFactory.abi,
    address: config.maciAddress as Hex,
    functionName: "registryManager",
  });
};

/**
 * Approve a request to join the registry
 * @param chain - The chain to use
 * @param index - The index of the request to approve
 * @returns True if the request was approved, false otherwise
 */
export const approveRequest = async (chain: Chain, index: string): Promise<boolean> => {
  const publicClient = createPublicClient({
    transport: custom(window.ethereum!),
    chain,
  });

  const [account] = (await window.ethereum!.request({ method: "eth_requestAccounts" })) as Hex[];

  const client = createWalletClient({
    account,
    chain,
    transport: custom(window.ethereum!),
  });

  const registryManagerAddress = await getRegistryManagerContract(chain);

  try {
    const tx = await client.writeContract({
      abi: RegistryManagerFactory.abi,
      address: registryManagerAddress,
      functionName: "approve",
      args: [BigInt(index)],
      chain,
      account: account!,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    return receipt.status === "success";
  } catch (error) {
    return false;
  }
};

/**
 * Reject a request to join the registry
 *
 * @param chain - The chain to use
 * @param index - The index of the request to reject
 * @returns True if the request was rejected, false otherwise
 */
export const rejectRequest = async (chain: Chain, index: bigint): Promise<boolean> => {
  const [account] = (await window.ethereum!.request({ method: "eth_requestAccounts" })) as Hex[];

  const publicClient = createPublicClient({
    transport: custom(window.ethereum!),
    chain,
  });
  const client = createWalletClient({
    account,
    chain,
    transport: custom(window.ethereum!),
  });

  const registryManagerAddress = await getRegistryManagerContract(chain);

  try {
    const tx = await client.writeContract({
      abi: RegistryManagerFactory.abi,
      address: registryManagerAddress,
      functionName: "reject",
      args: [index],
      chain,
      account: account!,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    return receipt.status === "success";
  } catch (error) {
    return false;
  }
};

/**
 * Submit an request to join the registry
 *
 * @param chain - The chain to use
 * @param index - The index of the request to submit
 * @param metadataPtr - The metadata url
 * @param registryAddress - The registry address
 * @param recipientAddress - The recipient address
 * @returns The transaction receipt
 */
export const submitAddRequest = async (
  chain: Chain,
  metadataUrl: string,
  registryAddress: Hex,
  recipientAddress: Hex,
): Promise<TransactionReceipt> => {
  const [account] = (await window.ethereum!.request({ method: "eth_requestAccounts" })) as Hex[];

  const publicClient = createPublicClient({
    transport: custom(window.ethereum!),
    chain,
  });

  const walletClient = createWalletClient({
    account: account!,
    chain,
    transport: custom(window.ethereum!),
  });

  const registryManagerAddress = await getRegistryManagerContract(chain);

  const request: IRequestContract = {
    registry: registryAddress,
    requestType: ERequestType.Add,
    recipient: {
      recipient: recipientAddress,
      metadataUrl,
      id: hexlify(randomBytes(32)) as Hex,
    },
    index: 0n,
    status: ERequestStatus.Pending,
  };

  try {
    const tx = await walletClient.writeContract({
      abi: RegistryManagerFactory.abi,
      address: registryManagerAddress,
      functionName: "process",
      // @ts-expect-error Saying it's expecting type never
      args: [request],
      chain,
      account: account!,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

    return receipt;
  } catch (error) {
    throw new Error("Failed to submit your request");
  }
};

/**
 * Submit an request to edit the approved recipient
 *
 * @param chain - The chain to use
 * @param metadataPtr - The metadata url
 * @param registryAddress - The registry address
 * @param recipientAddress - The recipient address
 * @param recipientIndex - The index of the recipient to submit
 * @returns The transaction receipt
 */
export const submitEditRequest = async (
  chain: Chain,
  metadataUrl: string,
  registryAddress: Hex,
  recipientAddress: Hex,
  recipientIndex: string,
): Promise<TransactionReceipt> => {
  const [account] = (await window.ethereum!.request({ method: "eth_requestAccounts" })) as Hex[];

  const publicClient = createPublicClient({
    transport: custom(window.ethereum!),
    chain,
  });

  const walletClient = createWalletClient({
    account: account!,
    chain,
    transport: custom(window.ethereum!),
  });

  const registryManagerAddress = await getRegistryManagerContract(chain);

  const request: IRequestContract = {
    registry: registryAddress,
    requestType: ERequestType.Change,
    recipient: {
      recipient: recipientAddress,
      metadataUrl,
      id: hexlify(randomBytes(32)) as Hex,
    },
    index: BigInt(recipientIndex),
    status: ERequestStatus.Pending,
  };

  try {
    const tx = await walletClient.writeContract({
      abi: RegistryManagerFactory.abi,
      address: registryManagerAddress,
      functionName: "process",
      // @ts-expect-error Saying it's expecting type never
      args: [request],
      chain,
      account: account!,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

    return receipt;
  } catch (error) {
    throw new Error("Failed to submit your request");
  }
};

/**
 * Get the number of projects in the registry
 *
 * @param chain - The chain to use
 * @param registryAddress - The registry address
 * @returns The number of projects in the registry
 */
export const getProjectCount = async (chain: Chain, registryAddress: Hex): Promise<bigint> => {
  const publicClient = createPublicClient({
    transport: http(),
    chain,
  });

  const count = await publicClient.readContract({
    abi: BaseRegistryFactory.abi,
    address: registryAddress,
    functionName: "recipientCount",
  });

  return count;
};
