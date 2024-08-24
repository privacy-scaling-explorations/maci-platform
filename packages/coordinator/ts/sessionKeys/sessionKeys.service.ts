import { Injectable, Logger } from "@nestjs/common";
import { deserializePermissionAccount } from "@zerodev/permissions";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { createKernelAccountClient, KernelAccountClient, KernelSmartAccount } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import { type Chain, createPublicClient, type Hex, http, type HttpTransport, type Transport } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { ErrorCodes } from "../common";
import { genPimlicoRPCUrl } from "../common/accountAbstraction";
import { CryptoService } from "../crypto/crypto.service";
import { FileService } from "../file/file.service";

import { IGenerateSessionKeyReturn } from "./types";

/**
 * SessionKeysService is responsible for generating and managing session keys.
 */
@Injectable()
export class SessionKeysService {
  /**
   * Logger
   */
  private readonly logger: Logger;

  /**
   * Create a new instance of SessionKeysService
   *
   * @param cryptoService - crypto service
   * @param fileService - file service
   */
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly fileService: FileService,
  ) {
    this.logger = new Logger(SessionKeysService.name);
  }

  /**
   * Generate a session key
   *
   * @returns session key address
   */
  generateSessionKey(): IGenerateSessionKeyReturn {
    const sessionPrivateKey = generatePrivateKey();

    const sessionKeySigner = toECDSASigner({
      signer: privateKeyToAccount(sessionPrivateKey),
    });

    const sessionKeyAddress = sessionKeySigner.account.address;

    // save the key
    this.fileService.storeSessionKey(sessionPrivateKey, sessionKeyAddress);

    return {
      sessionKeyAddress,
    };
  }

  /**
   * Generate a KernelClient from a session key and an approval
   *
   * @param sessionKeyAddress - the address of the session key
   * @param encryptedApproval - the encrypted approval string
   * @param chain - the chain to use
   * @returns
   */
  async generateClientFromSessionKey(
    sessionKeyAddress: Hex,
    encryptedApproval: string,
    chain: Chain,
  ): Promise<
    KernelAccountClient<
      ENTRYPOINT_ADDRESS_V07_TYPE,
      Transport,
      undefined,
      KernelSmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, undefined>
    >
  > {
    // the approval will have been encrypted so we need to decrypt it
    const { privateKey } = await this.fileService.getPrivateKey();
    const approval = this.cryptoService.decrypt(privateKey, encryptedApproval);

    // retrieve the session key from the file service
    const sessionKey = this.fileService.getSessionKey(sessionKeyAddress);

    if (!sessionKey) {
      this.logger.error(`Session key not found: ${sessionKeyAddress}`);
      throw new Error(ErrorCodes.SESSION_KEY_NOT_FOUND);
    }

    // get the bundler url and create a public client
    const bundlerUrl = genPimlicoRPCUrl(chain.name);
    const publicClient = createPublicClient({
      transport: http(bundlerUrl),
    });

    // Using a stored private key
    const sessionKeySigner = toECDSASigner({
      signer: privateKeyToAccount(sessionKey),
    });

    try {
      // deserialize the permission account using approval and session key
      const sessionKeyAccount = await deserializePermissionAccount(
        publicClient,
        ENTRYPOINT_ADDRESS_V07,
        KERNEL_V3_1,
        approval,
        sessionKeySigner,
      );

      return createKernelAccountClient({
        bundlerTransport: http(bundlerUrl),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        account: sessionKeyAccount,
      });
    } catch (error) {
      this.logger.error("Error deserializing permission account", error);
      throw new Error(ErrorCodes.INVALID_APPROVAL);
    }
  }

  /**
   * Deactivate a session key
   *
   * @param sessionKeyAddress - key address
   */
  deactivateSessionKey(sessionKeyAddress: Hex): void {
    this.fileService.deleteSessionKey(sessionKeyAddress);
  }
}
