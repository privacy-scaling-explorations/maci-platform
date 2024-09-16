import {
  MACI__factory as MACIFactory,
  RegistryManager__factory as RegistryManagerFactory,
  Poll__factory as PollFactory,
} from "maci-platform-contracts/typechain-types";
import { Chain, createPublicClient, createWalletClient, custom, Hex, TransactionReceipt } from "viem";

import { config } from "~/config";

import { ERequestStatus, ERequestType, IRequest } from "./types";
import { ZERO_BYTES32 } from "@ethereum-attestation-service/eas-sdk";

/**
 * Get the registry address
 *
 * @param chain - The chain to use
 * @param pollId - The poll id
 * @returns The registry address
 */
export const getRegistryAddress = async (chain: Chain, pollId: bigint): Promise<Hex> => {
  const publicClient = createPublicClient({
    transport: custom(window.ethereum),
    chain,
  });

  const pollAddress = (
    (await publicClient.readContract({
      abi: MACIFactory.abi,
      address: config.maciAddress as Hex,
      functionName: "getPoll",
      args: [pollId],
    })) as { poll: Hex; messageProcessor: Hex; tally: Hex }
  ).poll;

  return (await publicClient.readContract({
    abi: PollFactory.abi,
    address: pollAddress,
    functionName: "registry",
  })) as Hex;
};

/**
 * Get the registry manager contract address
 */
export const getRegistryManagerContract = async (chain: Chain): Promise<Hex> => {
  const publicClient = createPublicClient({
    transport: custom(window.ethereum),
    chain,
  });
  const registryManagerAddress = (await publicClient.readContract({
    abi: MACIFactory.abi,
    address: config.maciAddress as Hex,
    functionName: "registryManager",
  })) as Hex;

  return registryManagerAddress;
};

/**
 * Approve an application to join the registry
 * @param chain - The chain to use
 * @param index - The index of the application to approve
 * @returns True if the application was approved, false otherwise
 */
export const approveApplication = async (chain: Chain, index: string): Promise<boolean> => {
  const publicClient = createPublicClient({
    transport: custom(window.ethereum),
    chain,
  });

  const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" });

  const client = createWalletClient({
    account,
    chain,
    transport: custom(window.ethereum),
  });

  const registryManagerAddress = await getRegistryManagerContract(chain);
  
  try {
    const tx = await client.writeContract({
      abi: RegistryManagerFactory.abi,
      address: registryManagerAddress,
      functionName: "approve",
      args: [index],
      chain,
      account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    return receipt.status === "success";
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Reject an application to join the registry
 *
 * @param chain - The chain to use
 * @param index - The index of the application to reject
 * @returns True if the application was rejected, false otherwise
 */
export const rejectApplication = async (chain: Chain, index: bigint): Promise<boolean> => {
  const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" });

  const publicClient = createPublicClient({
    transport: custom(window.ethereum),
    chain,
  });
  const client = createWalletClient({
    account,
    chain,
    transport: custom(window.ethereum),
  });

  const registryManagerAddress = await getRegistryManagerContract(chain);

  try {
    const tx = await client.writeContract({
      abi: RegistryManagerFactory.abi,
      address: registryManagerAddress,
      functionName: "rejectApplication",
      args: [index],
      chain,
      account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    return receipt.status === "success";
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Submit an application to join the registry
 *
 * @param chain - The chain to use
 * @param index - The index of the application to submit
 * @param metadataUrl - The metadata url
 * @param registryAddress - The registry address
 * @param recipientAddress - The recipient address
 * @param attestationId - The attestation id
 * @returns The transaction receipt
 */
export const submitApplication = async (
  chain: Chain,
  metadataUrl: string,
  registryAddress: Hex,
  recipientAddress: Hex,
  attestationId?: string,
): Promise<TransactionReceipt> => {
  const [account] = await window.ethereum!.request({ method: "eth_requestAccounts" });

  const publicClient = createPublicClient({
    transport: custom(window.ethereum),
    chain,
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: custom(window.ethereum),
  });

  const registryManagerAddress = await getRegistryManagerContract(chain);

  const request: IRequest = {
    registry: registryAddress,
    requestType: ERequestType.Add,
    recipient: {
      recipient: recipientAddress,
      metadataUrl,
      id: attestationId ?? ZERO_BYTES32,
    },
    index: 0n,  
    status: ERequestStatus.Pending,
  };

  try {
    const tx = await walletClient.writeContract({
      abi: RegistryManagerFactory.abi,
      address: registryManagerAddress,
      functionName: "process",
      args: [request],
      chain,
      account,
    });

    console.log("tx", tx)

    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    return receipt
  } catch (error) {
    console.error(error);
    throw new Error("Failed to submit application");
  }
};
