import dotenv from "dotenv";
import { ZeroAddress } from "ethers";
import { zeroAddress } from "viem";
import { optimismSepolia } from "viem/chains";

import { KeyLike } from "crypto";

import { ErrorCodes } from "../../common";
import { CryptoService } from "../../crypto/crypto.service";
import { FileService } from "../../file/file.service";
import { SessionKeysService } from "../sessionKeys.service";

import { mockSessionKeyApproval } from "./utils";

dotenv.config();

describe("SessionKeysService", () => {
  const cryptoService = new CryptoService();
  const fileService = new FileService();
  let sessionKeysService: SessionKeysService;
  let publicKey: KeyLike;

  beforeAll(async () => {
    publicKey = (await fileService.getPublicKey()).publicKey;
    sessionKeysService = new SessionKeysService(cryptoService, fileService);
  });

  describe("generateSessionKey", () => {
    test("should generate and store a session key", () => {
      const sessionKeyAddress = sessionKeysService.generateSessionKey();
      expect(sessionKeyAddress).toBeDefined();
      expect(sessionKeyAddress).not.toEqual(ZeroAddress);

      const sessionKey = fileService.getSessionKey(sessionKeyAddress.sessionKeyAddress);
      expect(sessionKey).toBeDefined();
    });
  });

  describe("deactivateSessionKey", () => {
    test("should delete a session key", () => {
      const sessionKeyAddress = sessionKeysService.generateSessionKey();
      expect(sessionKeyAddress).toBeDefined();
      expect(sessionKeyAddress).not.toEqual(ZeroAddress);

      const sessionKey = fileService.getSessionKey(sessionKeyAddress.sessionKeyAddress);
      expect(sessionKey).toBeDefined();

      sessionKeysService.deactivateSessionKey(sessionKeyAddress.sessionKeyAddress);
      const sessionKeyDeleted = fileService.getSessionKey(sessionKeyAddress.sessionKeyAddress);
      expect(sessionKeyDeleted).toBeUndefined();
    });
  });

  describe("generateClientFromSessionKey", () => {
    test("should fail to generate a client with an invalid approval", async () => {
      const sessionKeyAddress = sessionKeysService.generateSessionKey();
      const approval = await mockSessionKeyApproval(sessionKeyAddress.sessionKeyAddress);
      const encryptedApproval = cryptoService.encrypt(publicKey, approval);
      await expect(
        sessionKeysService.generateClientFromSessionKey(
          sessionKeyAddress.sessionKeyAddress,
          encryptedApproval,
          optimismSepolia,
        ),
      ).rejects.toThrow(ErrorCodes.INVALID_APPROVAL);
    });

    test("should throw when given a non existent session key address", async () => {
      const approval = await mockSessionKeyApproval(zeroAddress);
      const encryptedApproval = cryptoService.encrypt(publicKey, approval);
      await expect(
        sessionKeysService.generateClientFromSessionKey(zeroAddress, encryptedApproval, optimismSepolia),
      ).rejects.toThrow(ErrorCodes.SESSION_KEY_NOT_FOUND);
    });

    test("should generate a client from a session key", async () => {
      jest.mock("@zerodev/sdk", (): unknown => ({
        ...jest.requireActual("@zerodev/sdk"),
        createKernelAccountClient: jest.fn().mockReturnValue({ mockedKernelClient: true }),
      }));

      const mockGenerateClientFromSessionKey = jest.fn().mockResolvedValue({ mockedClient: true });
      jest
        .spyOn(SessionKeysService.prototype, "generateClientFromSessionKey")
        .mockImplementation(mockGenerateClientFromSessionKey);

      const sessionKeyAddress = sessionKeysService.generateSessionKey();
      const approval = await mockSessionKeyApproval(sessionKeyAddress.sessionKeyAddress);
      const encryptedApproval = cryptoService.encrypt(publicKey, approval);

      const client = await sessionKeysService.generateClientFromSessionKey(
        sessionKeyAddress.sessionKeyAddress,
        encryptedApproval,
        optimismSepolia,
      );
      expect(mockGenerateClientFromSessionKey).toHaveBeenCalledWith(
        sessionKeyAddress.sessionKeyAddress,
        encryptedApproval,
        optimismSepolia,
      );
      expect(client).toEqual({ mockedClient: true });
    });
  });
});
