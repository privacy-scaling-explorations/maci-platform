import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { type Policy, serializePermissionAccount, toPermissionValidator } from "@zerodev/permissions";
import { toTimestampPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { addressToEmptyAccount, createKernelAccount } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { Address, createPublicClient, type Hex, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

// use the latest kernel version
const kernelVersion = KERNEL_V3_1;
// we use the most recent entrypoint
const entryPoint = ENTRYPOINT_ADDRESS_V07;

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

jest.mock("@zerodev/sdk", (): unknown => ({
  ...jest.requireActual("@zerodev/sdk"),
  createKernelAccount: jest.fn(),
}));

jest.mock("@zerodev/permissions", (): unknown => ({
  ...jest.requireActual("@zerodev/permissions"),
  serializePermissionAccount: () => "approval",
}));

/**
 * Mock a session key approval
 * @dev This will fail in hardhat with:
 * "InvalidEntryPointError: The entry point address
 * (`entryPoint` = 0x0000000071727De22E5E9d8BAf0edAc6f37da032)
 * is not a valid entry point. getSenderAddress did not revert with
 * a SenderAddressResult error."
 *
 * @param sessionKeyAddress - The address of the session key
 * @returns The approval string
 */
export const mockSessionKeyApproval = async (sessionKeyAddress: Hex): Promise<string> => {
  const policies = [generateTimestampPolicy(Math.floor(Date.now() / 1000) + 1000)];

  const publicClient = createPublicClient({
    chain: localhost,
    transport: http(),
  });

  const sessionPrivateKey = generatePrivateKey();

  const signer = privateKeyToAccount(sessionPrivateKey);

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  // Create an "empty account" as the signer -- you only need the public
  // key (address) to do this.
  const emptyAccount = addressToEmptyAccount(sessionKeyAddress as unknown as Address);
  const emptySessionKeySigner = toECDSASigner({ signer: emptyAccount });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies,
  });

  const sessionKeyAccount = await createKernelAccount(publicClient, {
    entryPoint,
    kernelVersion,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin,
    },
  });

  return serializePermissionAccount(sessionKeyAccount);
};
