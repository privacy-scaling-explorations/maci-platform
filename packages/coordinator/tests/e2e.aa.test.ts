import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { serializePermissionAccount, toPermissionValidator } from "@zerodev/permissions";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { addressToEmptyAccount, createKernelAccount } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import dotenv from "dotenv";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { Hex, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { ErrorCodes, ESupportedNetworks } from "../ts/common";
import { getPublicClient } from "../ts/common/accountAbstraction";
import { CryptoService } from "../ts/crypto/crypto.service";
import { FileService } from "../ts/file/file.service";
import { ProofGeneratorService } from "../ts/proof/proof.service";
import { testMaciDeploymentConfig, testPollDeploymentConfig } from "../ts/deployer/__tests__/utils";
import { DeployerService } from "../ts/deployer/deployer.service";
import { SessionKeysService } from "../ts/sessionKeys/sessionKeys.service";

dotenv.config();

const entryPoint = ENTRYPOINT_ADDRESS_V07;
const kernelVersion = KERNEL_V3_1;

/**
 * Generate an approval for a session key
 *
 * @param sessionKeyAddress - the session key address
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
  const deployerService = new DeployerService(sessionKeyService, fileService);

  // using an already deployed maci contract
  const maciContract = "0xf281870519822f302B13c07252d0f6A71E8D023e";
  const pollId = 2;

  const { sessionKeyAddress } = sessionKeyService.generateSessionKey();

  let approval: string;

  beforeAll(async () => {
    approval = await generateApproval(sessionKeyAddress);
  });

  describe("deploy", () => {
    describe("deployMaci", () => {
      it("should deploy all maci related contracts", async () => {
        const maciAddress = await deployerService.deployMaci({
          approval,
          sessionKeyAddress,
          chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
          config: testMaciDeploymentConfig,
        });

        expect(maciAddress).not.toBe(zeroAddress);
      });
    });

    describe("deployPoll", () => {
      it("should deploy a poll", async () => {
        const poll = await deployerService.deployPoll({
          approval,
          sessionKeyAddress,
          chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
          config: testPollDeploymentConfig,
        });

        expect(poll).toBeDefined();
      });
    });
  });

  describe("merge", () => {
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

  describe("sessionKeys", () => {
    it("should create a client from a session key and an approval", async () => {
      const client = await sessionKeyService.generateClientFromSessionKey(
        sessionKeyAddress,
        approval,
        ESupportedNetworks.OPTIMISM_SEPOLIA,
      );

      expect(client).toBeDefined();
      expect(client.transport.key).toBe("http");
      expect(client.key).toBe("Account");
      expect(client.account.address).not.toBe(zeroAddress);
      expect(client.account.kernelVersion).toBe(kernelVersion);
      expect(client.account.entryPoint).toBe(entryPoint);
      // this is an account with limited permissions so no sudo validator
      expect(client.account.kernelPluginManager.address).toBe(zeroAddress);
      expect(client.account.kernelPluginManager.sudoValidator).toBe(undefined);

      // send a transaction
      const tx = await client.sendTransaction({
        to: zeroAddress,
        value: 0n,
        data: "0x",
      });

      expect(tx.length).toBeGreaterThan(0);
    });

    it("should not allow to create a client after the session key has been deactivated", async () => {
      sessionKeyService.deactivateSessionKey(sessionKeyAddress);

      await expect(
        sessionKeyService.generateClientFromSessionKey(
          sessionKeyAddress,
          approval,
          ESupportedNetworks.OPTIMISM_SEPOLIA,
        ),
      ).rejects.toThrow(ErrorCodes.SESSION_KEY_NOT_FOUND.toString());
    });
  });
});
