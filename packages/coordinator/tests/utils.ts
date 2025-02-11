import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { serializePermissionAccount, toPermissionValidator } from "@zerodev/permissions";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { KernelSmartAccount, addressToEmptyAccount, createKernelAccount } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import dotenv from "dotenv";
import { getBytes, hashMessage, type Signer } from "ethers";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { EntryPoint } from "permissionless/types";
import { Chain, Hex, HttpTransport } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import fs from "fs";

import { ESupportedNetworks } from "../ts/common";
import { getPublicClient } from "../ts/common/accountAbstraction";
import { CryptoService } from "../ts/crypto/crypto.service";

dotenv.config();

export const ENTRY_POINT = ENTRYPOINT_ADDRESS_V07;
export const KERNEL_VERSION = KERNEL_V3_1;

/**
 * Get smart contract kernel account
 * @param sessionKeyAddress - the session key address
 * @returns - the kernel account
 */
export const getKernelAccount = async (
  sessionKeyAddress: Hex,
): Promise<KernelSmartAccount<EntryPoint, HttpTransport, Chain>> => {
  const publicClient = getPublicClient(ESupportedNetworks.OPTIMISM_SEPOLIA);

  const sessionKeySigner = privateKeyToAccount(process.env.TEST_PRIVATE_KEY! as Hex);
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: sessionKeySigner,
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_VERSION,
  });

  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);
  const emptySessionKeySigner = toECDSASigner({ signer: emptyAccount });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_VERSION,
    signer: emptySessionKeySigner,
    policies: [toSudoPolicy({})],
  });

  const sessionKeyAccount = await createKernelAccount(publicClient, {
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_VERSION,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin,
    },
  });
  return sessionKeyAccount;
};

/**
 * Generate an approval for a session key
 * @param sessionKeyAddress - the session key address
 * @returns - the approval
 */
export const generateApproval = async (sessionKeyAddress: Hex): Promise<string> => {
  const sessionKeyAccount = await getKernelAccount(sessionKeyAddress);
  return serializePermissionAccount(sessionKeyAccount);
};

/**
 * Sign a message with a wallet and encrypt it using the coordinator's public key
 * @param signer
 * @returns Authorization header
 */
export const getAuthorizationHeader = async (signer: Signer): Promise<string> => {
  const cryptoService = new CryptoService();
  const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH!);
  const signature = await signer.signMessage("message");
  const digest = Buffer.from(getBytes(hashMessage("message"))).toString("hex");
  return `Bearer ${cryptoService.encrypt(publicKey, `${signature}:${digest}`)}`;
};

/**
 * Custom replacer function to handle Bigint values in JSON.stringify
 */
/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
export const replacer = (_key: string, value: any): any => (typeof value === "bigint" ? value.toString() : value);
