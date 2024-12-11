import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { serializePermissionAccount, toPermissionValidator } from "@zerodev/permissions";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { addressToEmptyAccount, createKernelAccount } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import dotenv from "dotenv";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { ErrorCodes, ESupportedNetworks } from "../ts/common";
import { getPublicClient } from "../ts/common/accountAbstraction";
import { CryptoService } from "../ts/crypto/crypto.service";
import { FileService } from "../ts/file/file.service";
import { ProofGeneratorService } from "../ts/proof/proof.service";
import { SessionKeysService } from "../ts/sessionKeys/sessionKeys.service";

dotenv.config();

const entryPoint = ENTRYPOINT_ADDRESS_V07;
const kernelVersion = KERNEL_V3_1;

/**
 * Generate an approval for a session key
 *
 * @returns - the approval
 */
export const generateApproval = async (sessionKeyAddress: Hex): Promise<string> => {
  const publicClient = getPublicClient(ESupportedNetworks.OPTIMISM_SEPOLIA);

  const sessionKeySigner = privateKeyToAccount(process.env.TEST_PRIVATE_KEY! as `0x${string}`);
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: sessionKeySigner,
    entryPoint,
    kernelVersion,
  });

  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);
  const emptySessionKeySigner = toECDSASigner({ signer: emptyAccount });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion,
    signer: emptySessionKeySigner,
    policies: [toSudoPolicy({})],
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

describe("E2E Account Abstraction Tests", () => {
  const fileService = new FileService();
  const sessionKeyService = new SessionKeysService(fileService);
  const cryptoService = new CryptoService();
  const proofService = new ProofGeneratorService(cryptoService, fileService, sessionKeyService);

  // using an already deployed maci contract
  const maciContract = "0xf281870519822f302B13c07252d0f6A71E8D023e";
  const pollId = 2;

  test("should return true when there are no errors", async () => {
    const sessionKey = sessionKeyService.generateSessionKey().sessionKeyAddress;
    const approval = await generateApproval(sessionKey);

    const merged = await proofService.merge({
      maciContractAddress: maciContract,
      pollId,
      sessionKeyAddress: sessionKey,
      approval,
      chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
    });

    expect(merged).toBe(true);
  });

  test("should throw when given an invalid pollId", async () => {
    const sessionKey = sessionKeyService.generateSessionKey().sessionKeyAddress;
    const approval = await generateApproval(sessionKey);

    await expect(
      proofService.merge({
        maciContractAddress: maciContract,
        pollId: 50000,
        sessionKeyAddress: sessionKey,
        approval,
        chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
      }),
    ).rejects.toThrow(ErrorCodes.POLL_NOT_FOUND.toString());
  });
});
