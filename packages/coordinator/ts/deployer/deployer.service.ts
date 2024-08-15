import { Injectable, Logger } from "@nestjs/common";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  ConstantInitialVoiceCreditProxy__factory as ConstantInitialVoiceCreditProxyFactory,
  ContractStorage,
  EContracts,
  FreeForAllGatekeeper__factory as FreeForAllGatekeeperFactory,
} from "maci-contracts";

import { CryptoService } from "../crypto/crypto.service";
import { FileService } from "../file/file.service";

import { IDeployMaciArgs, IDeployPollArgs } from "./types";
import { getKernelClient } from "../common/account";
import { getPublicClient, getDeployedContractAddress } from "../common/pimlico";
import { optimismSepolia } from "viem/chains";
import { BaseContract } from "ethers";

/**
 * DeployerService is responsible for deploying contracts.
 */
@Injectable()
export class DeployerService {
  /**
   * Logger
   */
  private readonly logger = new Logger(DeployerService.name);

  /**
   * Contract storage instance
   */
  private readonly storage: ContractStorage;

  /**
   * Create a new instance of DeployerService
   * @param fileService
   */
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly fileService: FileService,
  ) {
    this.fileService = fileService;
    this.logger = new Logger(DeployerService.name);
    this.storage = ContractStorage.getInstance();
  }

  /**
   * Generate a session key
   *
   * @returns session key address
   */
  generateSessionKey(): `0x${string}` {
    const sessionPrivateKey = generatePrivateKey();

    const sessionKeySigner = toECDSASigner({
      signer: privateKeyToAccount(sessionPrivateKey),
    });

    const sessionKeyAddress = sessionKeySigner.account.address;

    // save the key
    this.fileService.storeSessionKey(sessionPrivateKey, sessionKeyAddress);

    return sessionKeyAddress;
  }

  /**
   * Deactivate a session key
   *
   * @param sessionKeyAddress - key address
   */
  deactivateSessionKey(sessionKeyAddress: `0x${string}`): void {
    this.fileService.deleteSessionKey(sessionKeyAddress);
  }

  /**
   * Deploy MACI contracts
   *
   * @param args - deploy maci arguments
   * @param options - ws hooks
   * @returns - deployed maci contract
   * @throws error if deploy is not successful
   */
  async deployMaci({ approval, sessionKeyAddress, chainId, config }: IDeployMaciArgs) {
    // @TODO sort out network
    // const publicClient = getPublicClient(process.env.COORDINATOR_RPC_URL!, optimismSepolia)
    // // get the session key from storage
    // const sessionKey = this.fileService.getSessionKey(sessionKeyAddress);
    // const kernelClient = await getKernelClient(sessionKey, approval, chainId);
    // create first user op for voice credit proxy
    const gatekeeperConfig = config.FreeForAllGatekeeper
    const voiceCreditProxyConfig = config.ConstantInitialVoiceCreditProxy

    // check what we already have deployed
    const deployedContracts = this.storage.getInstances(optimismSepolia.name)
    
    console.log("deployed contracts", deployedContracts)
    // if we find contracts with the same configuration then we don't need to re-deploy
    if (voiceCreditProxyConfig?.deploy) {
      const voiceCreditsProxy = deployedContracts.find(contract => contract[0] === EContracts.ConstantInitialVoiceCreditProxy)

    }


    if (voiceCreditProxyConfig?.deploy) {
      // we need to check if we have already one deployed that matches this configuration 
      // @TODO 
     

      // const voiceCreditsProxyDeployTx = await kernelClient.deployContract({
      //   abi: ConstantInitialVoiceCreditProxyFactory.abi,
      //   args: [voiceCreditProxyConfig.amount],
      //   bytecode: ConstantInitialVoiceCreditProxyFactory.bytecode,
      //   account: kernelClient.account.address,
      // })
      // const receipt = await publicClient.waitForTransactionReceipt({
      //   hash: voiceCreditsProxyDeployTx
      // })
      // const addr = getDeployedContractAddress(receipt)
      // const contract = new BaseContract(addr!, ConstantInitialVoiceCreditProxyFactory.abi)
      // await this.storage.register({
      //   id: EContracts.ConstantInitialVoiceCreditProxy,
      //   contract,
      //   args: [voiceCreditProxyConfig.amount.toString()],
      //   network: optimismSepolia.name,
      // });
    } 
    if (gatekeeperConfig?.deploy) {
      // @TODO check if we have already one deployed that matches this configuration 

      // const gatekeeperDeployTx = await kernelClient.deployContract({
      //   abi: FreeForAllGatekeeperFactory.abi,
      //   args: [],
      //   bytecode: FreeForAllGatekeeperFactory.bytecode,
      //   account: kernelClient.account.address,
      // })
      // const receipt = await publicClient.waitForTransactionReceipt({
      //   hash: gatekeeperDeployTx
      // })
      // const addr = getDeployedContractAddress(receipt)
      // const contract = new BaseContract(addr!, ConstantInitialVoiceCreditProxyFactory.abi)
      // await this.storage.register({
      //   id: EContracts.ConstantInitialVoiceCreditProxy,
      //   contract,
      //   args: [],
      //   network: optimismSepolia.name,
      // });
    } else {
    }
  }

  async deployPoll({ approval, sessionKeyAddress, chainId, config }: IDeployPollArgs) {
    // get the session key from storage
    const sessionKey = this.fileService.getSessionKey(sessionKeyAddress);

    const kernelClient = await getKernelClient(sessionKey, approval, chainId);
  }
}
