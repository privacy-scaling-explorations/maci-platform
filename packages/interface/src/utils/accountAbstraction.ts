import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { Policy, serializePermissionAccount, toPermissionValidator } from "@zerodev/permissions";
import { CallPolicyVersion, toCallPolicy, toTimestampPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { addressToEmptyAccount, createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ENTRYPOINT_ADDRESS_V07, walletClientToSmartAccountSigner } from "permissionless";
import { createPublicClient, custom } from "viem";
import { UseWalletClientReturnType } from "wagmi";

import { config } from "~/config";

// use the latest kernel version
const kernelVersion = KERNEL_V3_1;
// we use the most recent entrypoint
const entryPoint = ENTRYPOINT_ADDRESS_V07;

/**
 * Deploy or get a client to a Smart Account with an ECDSA Validator
 * @notice In this case the ECDSA validator will be the wallet connected to the dapp
 * @param client - The wallet client
 * @returns The smart account
 */
export const getSmartAccount = async (client: UseWalletClientReturnType) => {
  if (!window.ethereum) {
    throw new Error("Please connect your wallet first");
  }

  const signer = walletClientToSmartAccountSigner(client.data!);

  const publicClient = createPublicClient({
    chain: config.network,
    transport: custom(window.ethereum),
  });

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  const kernelAccount = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion,
  });

  const kernelClient = createKernelAccountClient({
    // @ts-expect-error
    account: kernelAccount,
    chain: config.network,
    bundlerTransport: custom(window.ethereum),
  });

  return kernelClient;
};

/**
 * Generate a timestamp policy
 * @param endTime - The end time of the policy
 * @param start - The start time of the policy
 * @returns The timestamp policy
 */
export const generateTimestampPolicy = (endTime: number, start?: number): Policy =>
  toTimestampPolicy({
    validAfter: start,
    validUntil: endTime,
  });

/**
 * Generate a call policy
 * @param targets - The targets to call
 * @param functionsName - The functions name to call
 * @returns The call policy
 */
export const generateCallPolicy = (targets: `0x${string}`[], functionsName: string[]): Policy => {
  if (targets.length !== functionsName.length) {
    throw new Error("Targets and functions name length must be the same");
  }

  const permissions = targets.map((target, index) => ({
    target,
    functionsName: functionsName[index],
  }));

  return toCallPolicy({
    policyVersion: CallPolicyVersion.V0_0_3,
    permissions,
  });
};

/**
 * Authorise a session key
 * @param client - The wallet client
 * @param sessionKeyAddress - The address of the session key
 * @param policies - The policies to authorise the session key with
 * @returns The approval string
 */
export const authoriseSessionKey = async (
  client: UseWalletClientReturnType,
  sessionKeyAddress: `0x${string}`,
  policies?: Policy[],
): Promise<string> => {
  if (!window.ethereum) {
    throw new Error("Please connect your wallet first");
  }

  const signer = walletClientToSmartAccountSigner(client.data!);

  const publicClient = createPublicClient({
    chain: config.network,
    transport: custom(window.ethereum),
  });

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  // Create an "empty account" as the signer -- you only need the public
  // key (address) to do this.
  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);
  const emptySessionKeySigner = toECDSASigner({ signer: emptyAccount });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies: policies || [],
  });

  const sessionKeyAccount = await createKernelAccount(publicClient, {
    entryPoint,
    kernelVersion,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin,
    },
  });

  // @ts-expect-error
  const approval = await serializePermissionAccount(sessionKeyAccount);

  return approval;
};

/**
 * Revoke a session key from a smart account
 * @param client - The wallet client
 * @param sessionKeyAddress - The address of the session key
 * @returns The transaction hash
 */
export const revokeSessionKey = async (
  client: UseWalletClientReturnType,
  sessionKeyAddress: `0x${string}`,
  policies?: Policy[],
): Promise<void> => {
  const publicClient = createPublicClient({
    chain: config.network,
    transport: custom(window.ethereum),
  });

  // Create an "empty account" as the signer -- you only need the public
  // key (address) to do this.
  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);
  const emptySessionKeySigner = toECDSASigner({ signer: emptyAccount });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies: policies || [],
  });

  const smartAccount = await getSmartAccount(client);

  // @ts-expect-error
  const txHash = smartAccount.uninstallPlugin({
    plugin: permissionPlugin,
  });

  console.log(txHash);
};
