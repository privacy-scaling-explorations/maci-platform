import { Injectable, Logger } from "@nestjs/common";
import { KernelAccountClient, KernelSmartAccount } from "@zerodev/sdk";
import { BaseContract, InterfaceAbi } from "ethers";
import { extractVk } from "maci-circuits";
import {
  ConstantInitialVoiceCreditProxy__factory as ConstantInitialVoiceCreditProxyFactory,
  ContractStorage,
  EGatekeepers,
  FreeForAllGatekeeper__factory as FreeForAllGatekeeperFactory,
  EASGatekeeper__factory as EASGatekeeperFactory,
  ZupassGatekeeper__factory as ZupassGatekeeperFactory,
  HatsGatekeeperSingle__factory as HatsGatekeeperSingleFactory,
  SemaphoreGatekeeper__factory as SemaphoreGatekeeperFactory,
  GitcoinPassportGatekeeper__factory as GitcoinPassportGatekeeperFactory,
  Verifier__factory as VerifierFactory,
  PoseidonT3__factory as PoseidonT3Factory,
  PoseidonT4__factory as PoseidonT4Factory,
  PoseidonT5__factory as PoseidonT5Factory,
  PoseidonT6__factory as PoseidonT6Factory,
  VkRegistry__factory as VkRegistryFactory,
  TallyFactory__factory as TallyFactoryFactory,
  PollFactory__factory as PollFactoryFactory,
  MessageProcessorFactory__factory as MessageProcessorFactoryFactory,
  MessageProcessor__factory as MessageProcessorFactory,
  Tally__factory as TallyFactory,
  Poll__factory as PollFactory,
  MACI__factory as MACIFactory,
  EContracts,
  EInitialVoiceCreditProxies,
  genEmptyBallotRoots,
  EMode,
  IVerifyingKeyStruct,
} from "maci-contracts";
import { IVkObjectParams, PubKey, VerifyingKey } from "maci-domainobjs";
import { BundlerClient } from "permissionless";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import { Abi, Chain, encodeFunctionData, HttpTransport, PublicClient, Transport, type Hex } from "viem";

import path from "path";

import { ErrorCodes, ESupportedNetworks, MESSAGE_TREE_ARITY } from "../common";
import { getBundlerClient, getDeployedContractAddress, getPublicClient } from "../common/accountAbstraction";
import { FileService } from "../file/file.service";
import { SessionKeysService } from "../sessionKeys/sessionKeys.service";
import { KernelClient } from "../sessionKeys/types";

import { MAX_GAS_LIMIT } from "./constants";
import {
  IContractData,
  IDeployMaciArgs,
  IDeployPollArgs,
  IEASGatekeeperArgs,
  IGatekeeperArgs,
  IGitcoinPassportGatekeeperArgs,
  IHatsGatekeeperArgs,
  IInitialVoiceCreditProxyArgs,
  ISemaphoreGatekeeperArgs,
  IZupassGatekeeperArgs,
} from "./types";
import { estimateExtraGasLimit } from "./utils";

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
   *
   * @param fileService - file service
   */
  constructor(
    private readonly sessionKeysService: SessionKeysService,
    private readonly fileService: FileService,
  ) {
    this.logger = new Logger(DeployerService.name);
    this.storage = ContractStorage.getInstance(path.join(process.cwd(), "deployed-contracts.json"));
  }

  /**
   * Get the gatekeeper abi and bytecode based on the gatekeeper type
   * and also check if there is already an instance deployed
   *
   * @param gatekeeperType - the gatekeeper type
   * @param network - the network
   * @param args - the gatekeeper args
   * @returns - the gatekeeper abi and bytecode
   */
  getGatekeeperData(gatekeeperType: EGatekeepers, network: ESupportedNetworks, args?: IGatekeeperArgs): IContractData {
    let address: string | undefined;
    let storedArgs: string[] | undefined;
    let isAlreadyDeployed: boolean;

    // based on the gatekeeper type, we need to deploy the correct gatekeeper
    switch (gatekeeperType) {
      case EGatekeepers.FreeForAll:
        address = this.storage.getAddress(gatekeeperType as unknown as EContracts, network);
        return {
          abi: FreeForAllGatekeeperFactory.abi,
          bytecode: FreeForAllGatekeeperFactory.bytecode,
          alreadyDeployed: !!address,
        };
      case EGatekeepers.EAS:
        storedArgs = this.storage.getContractArgs(gatekeeperType as unknown as EContracts, network);
        isAlreadyDeployed =
          !!storedArgs &&
          storedArgs.length === 3 &&
          storedArgs[0] === (args as IEASGatekeeperArgs).easAddress &&
          storedArgs[1] === (args as IEASGatekeeperArgs).schema &&
          storedArgs[2] === (args as IEASGatekeeperArgs).attester;
        return {
          abi: EASGatekeeperFactory.abi,
          bytecode: EASGatekeeperFactory.bytecode,
          alreadyDeployed: isAlreadyDeployed,
        };
      case EGatekeepers.Zupass:
        storedArgs = this.storage.getContractArgs(gatekeeperType as unknown as EContracts, network);
        isAlreadyDeployed =
          !!storedArgs &&
          storedArgs.length === 4 &&
          storedArgs[0] === (args as IZupassGatekeeperArgs).signer1 &&
          storedArgs[1] === (args as IZupassGatekeeperArgs).signer2 &&
          storedArgs[2] === (args as IZupassGatekeeperArgs).eventId &&
          storedArgs[3] === (args as IZupassGatekeeperArgs).zupassVerifier;
        return {
          abi: ZupassGatekeeperFactory.abi,
          bytecode: ZupassGatekeeperFactory.bytecode,
          alreadyDeployed: isAlreadyDeployed,
        };
      case EGatekeepers.HatsSingle:
        storedArgs = this.storage.getContractArgs(gatekeeperType as unknown as EContracts, network);
        isAlreadyDeployed =
          !!storedArgs &&
          storedArgs.length === 2 &&
          storedArgs[0] === (args as IHatsGatekeeperArgs).hatsProtocolAddress &&
          JSON.stringify(storedArgs[1]) === JSON.stringify((args as IHatsGatekeeperArgs).critrionHats);
        return {
          abi: HatsGatekeeperSingleFactory.abi,
          bytecode: HatsGatekeeperSingleFactory.bytecode,
          alreadyDeployed: isAlreadyDeployed,
        };
      case EGatekeepers.Semaphore:
        storedArgs = this.storage.getContractArgs(gatekeeperType as unknown as EContracts, network);
        isAlreadyDeployed =
          !!storedArgs &&
          storedArgs.length === 2 &&
          storedArgs[0] === (args as ISemaphoreGatekeeperArgs).semaphoreContract &&
          storedArgs[1] === (args as ISemaphoreGatekeeperArgs).groupId;
        return {
          abi: SemaphoreGatekeeperFactory.abi,
          bytecode: SemaphoreGatekeeperFactory.bytecode,
          alreadyDeployed: isAlreadyDeployed,
        };
      case EGatekeepers.GitcoinPassport:
        storedArgs = this.storage.getContractArgs(gatekeeperType as unknown as EContracts, network);
        isAlreadyDeployed =
          !!storedArgs &&
          storedArgs.length === 2 &&
          storedArgs[0] === (args as IGitcoinPassportGatekeeperArgs).decoderAddress &&
          storedArgs[1] === (args as IGitcoinPassportGatekeeperArgs).passingScore;
        return {
          abi: GitcoinPassportGatekeeperFactory.abi,
          bytecode: GitcoinPassportGatekeeperFactory.bytecode,
          alreadyDeployed: isAlreadyDeployed,
        };
      default:
        throw new Error(ErrorCodes.UNSUPPORTED_GATEKEEPER.toString());
    }
  }

  /**
   * Get the voice credit proxy abi and bytecode based on the voice credit proxy type
   * and also check if there is already an instance deployed
   *
   * @param voiceCreditProxyType - the voice credit proxy type
   * @param network - the network
   * @param args - the voice credit proxy args
   * @returns - the voice credit proxy abi and bytecode
   */
  getVoiceCreditProxyData(
    voiceCreditProxyType: EInitialVoiceCreditProxies,
    network: ESupportedNetworks,
    args: IInitialVoiceCreditProxyArgs,
  ): IContractData {
    let storedArgs: string[] | undefined;
    let isAlreadyDeployed: boolean;

    switch (voiceCreditProxyType) {
      case EInitialVoiceCreditProxies.Constant:
        storedArgs = this.storage.getContractArgs(voiceCreditProxyType as unknown as EContracts, network);
        isAlreadyDeployed = !!storedArgs && storedArgs[0] === args.amount;

        return {
          abi: ConstantInitialVoiceCreditProxyFactory.abi,
          bytecode: ConstantInitialVoiceCreditProxyFactory.bytecode,
          alreadyDeployed: isAlreadyDeployed,
        };
      default:
        throw new Error(ErrorCodes.UNSUPPORTED_VOICE_CREDIT_PROXY.toString());
    }
  }

  /**
   * Deploy a contract and get the address
   * @param kernelClient - the kernel client
   * @param abi - the abi
   * @param bytecode - the bytecode
   * @param args - the args
   * @param publicClient - the public client
   * @returns - the address
   */
  async deployAndGetAddress(
    kernelClient: KernelAccountClient<
      ENTRYPOINT_ADDRESS_V07_TYPE,
      Transport,
      Chain,
      KernelSmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE, HttpTransport, Chain>
    >,
    abi: Abi,
    bytecode: Hex,
    args: unknown[],
    bundlerClient: BundlerClient<ENTRYPOINT_ADDRESS_V07_TYPE>,
    publicClient: PublicClient<Transport, Chain>,
  ): Promise<string | undefined> {
    const deployCallData = await kernelClient.account.encodeDeployCallData({
      abi,
      args,
      bytecode,
    });

    const gasPrice = await kernelClient.getUserOperationGasPrice();

    const opEstimate = await kernelClient.prepareUserOperationRequest({
      userOperation: {
        callData: deployCallData,
        sender: kernelClient.account.address,
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
      },
    });

    const callGasLimitMultiplier = estimateExtraGasLimit(opEstimate.callGasLimit);

    const tx = await kernelClient.sendUserOperation({
      userOperation: {
        callData: deployCallData,
        sender: kernelClient.account.address,
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
        callGasLimit:
          opEstimate.callGasLimit + callGasLimitMultiplier < MAX_GAS_LIMIT
            ? opEstimate.callGasLimit + callGasLimitMultiplier
            : MAX_GAS_LIMIT,
      },
    });

    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: tx,
    });

    const txReceipt = await publicClient.getTransactionReceipt({
      hash: receipt.receipt.transactionHash,
    });

    return getDeployedContractAddress(txReceipt);
  }

  /**
   * Deploy a contract and store the address
   *
   * @param contract - the contract to deploy
   * @param args - the args
   * @param abi - the abi
   * @param bytecode - the bytecode
   * @param kernelClient - the kernel client
   * @param publicClient - the public client
   * @param chain - the chain
   * @returns - the address of the deployed contract
   */
  async deployAndStore(
    contract: EContracts,
    args: unknown[],
    abi: Abi,
    bytecode: Hex,
    kernelClient: KernelClient,
    bundlerClient: BundlerClient<ENTRYPOINT_ADDRESS_V07_TYPE>,
    publicClient: PublicClient<Transport, Chain>,
    chain: ESupportedNetworks,
  ): Promise<string> {
    let address = this.storage.getAddress(contract, chain);

    if (!address) {
      address = await this.deployAndGetAddress(kernelClient, abi, bytecode, args, bundlerClient, publicClient);

      if (!address) {
        this.logger.error(`Failed to deploy contract: ${contract}`);
        throw new Error(`${ErrorCodes.FAILED_TO_DEPLOY_CONTRACT} ${contract}`);
      }

      await this.storage.register({
        id: contract,
        contract: new BaseContract(address, abi as unknown as InterfaceAbi),
        args: args.map((arg) => String(arg)),
        network: chain,
      });
    }

    return address;
  }

  /**
   * Deploy MACI contracts
   *
   * @param args - deploy maci arguments
   * @param options - ws hooks
   * @returns - deployed maci contract
   * @returns the address of the deployed maci contract
   */
  async deployMaci({ approval, sessionKeyAddress, chain, config }: IDeployMaciArgs): Promise<string> {
    const publicClient = getPublicClient(chain);
    const bundlerClient = getBundlerClient(chain);

    const kernelClient = await this.sessionKeysService.generateClientFromSessionKey(sessionKeyAddress, approval, chain);

    let initialVoiceCreditProxyAddress = this.storage.getAddress(
      config.initialVoiceCreditsProxy.type as unknown as EContracts,
      chain,
    );

    const initialVoiceCreditProxyData = this.getVoiceCreditProxyData(
      config.initialVoiceCreditsProxy.type,
      chain,
      config.initialVoiceCreditsProxy.args,
    );

    // if the initial voice credit proxy is not already deployed, we need to deploy it
    if (!initialVoiceCreditProxyData.alreadyDeployed) {
      initialVoiceCreditProxyAddress = await this.deployAndGetAddress(
        kernelClient,
        initialVoiceCreditProxyData.abi,
        initialVoiceCreditProxyData.bytecode,
        Object.values(config.initialVoiceCreditsProxy.args),
        bundlerClient,
        publicClient,
      );

      if (!initialVoiceCreditProxyAddress) {
        this.logger.error(`Failed to deploy voice credit proxy: ${config.initialVoiceCreditsProxy.type}`);
        throw new Error(`${ErrorCodes.FAILED_TO_DEPLOY_CONTRACT} ${config.initialVoiceCreditsProxy.type}`);
      }

      await this.storage.register({
        id: config.initialVoiceCreditsProxy.type as unknown as EContracts,
        contract: new BaseContract(
          initialVoiceCreditProxyAddress,
          initialVoiceCreditProxyData.abi as unknown as InterfaceAbi,
        ),
        args: Object.values(config.initialVoiceCreditsProxy.args),
        network: chain,
      });
    }

    let gatekeeperAddress = this.storage.getAddress(config.gatekeeper.type as unknown as EContracts, chain);
    const gatekeeperData = this.getGatekeeperData(config.gatekeeper.type, chain, config.gatekeeper.args);

    // if the gatekeeper is not already deployed, we need to deploy it
    if (!gatekeeperData.alreadyDeployed) {
      gatekeeperAddress = await this.deployAndGetAddress(
        kernelClient,
        gatekeeperData.abi,
        gatekeeperData.bytecode,
        config.gatekeeper.args ? Object.values(config.gatekeeper.args) : [],
        bundlerClient,
        publicClient,
      );

      // if the gatekeeper address is not found, we need to throw an error
      if (!gatekeeperAddress) {
        this.logger.error(`Failed to deploy gatekeeper: ${config.gatekeeper.type}`);
        throw new Error(`${ErrorCodes.FAILED_TO_DEPLOY_CONTRACT} ${config.gatekeeper.type}`);
      }

      // store the gatekeeper address in the storage
      await this.storage.register({
        id: config.gatekeeper.type as unknown as EContracts,
        contract: new BaseContract(gatekeeperAddress, gatekeeperData.abi as InterfaceAbi),
        args: config.gatekeeper.args ? Object.values(config.gatekeeper.args) : [],
        network: chain,
      });
    }

    // deploy all maci contracts

    // 1. verifier
    await this.deployAndStore(
      EContracts.Verifier,
      [],
      VerifierFactory.abi,
      VerifierFactory.bytecode,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    // 2. poseidon
    const poseidonT3Address = await this.deployAndStore(
      EContracts.PoseidonT3,
      [],
      PoseidonT3Factory.abi,
      PoseidonT3Factory.bytecode,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    const poseidonT4Address = await this.deployAndStore(
      EContracts.PoseidonT4,
      [],
      PoseidonT4Factory.abi,
      PoseidonT4Factory.bytecode,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    const poseidonT5Address = await this.deployAndStore(
      EContracts.PoseidonT5,
      [],
      PoseidonT5Factory.abi,
      PoseidonT5Factory.bytecode,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    const poseidonT6Address = await this.deployAndStore(
      EContracts.PoseidonT6,
      [],
      PoseidonT6Factory.abi,
      PoseidonT6Factory.bytecode,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    // 3. factories
    const pollFactoryAddress = await this.deployAndStore(
      EContracts.PollFactory,
      [],
      PollFactoryFactory.abi as unknown as Abi,
      PollFactoryFactory.linkBytecode({
        "contracts/crypto/PoseidonT3.sol:PoseidonT3": poseidonT3Address,
        "contracts/crypto/PoseidonT4.sol:PoseidonT4": poseidonT4Address,
        "contracts/crypto/PoseidonT5.sol:PoseidonT5": poseidonT5Address,
        "contracts/crypto/PoseidonT6.sol:PoseidonT6": poseidonT6Address,
      }) as Hex,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    const tallyFactoryAddress = await this.deployAndStore(
      EContracts.TallyFactory,
      [],
      TallyFactoryFactory.abi as unknown as Abi,
      TallyFactoryFactory.linkBytecode({
        "contracts/crypto/PoseidonT3.sol:PoseidonT3": poseidonT3Address,
        "contracts/crypto/PoseidonT4.sol:PoseidonT4": poseidonT4Address,
        "contracts/crypto/PoseidonT5.sol:PoseidonT5": poseidonT5Address,
        "contracts/crypto/PoseidonT6.sol:PoseidonT6": poseidonT6Address,
      }) as Hex,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    const messageProcessorFactoryAddress = await this.deployAndStore(
      EContracts.MessageProcessorFactory,
      [],
      MessageProcessorFactoryFactory.abi,
      MessageProcessorFactoryFactory.linkBytecode({
        "contracts/crypto/PoseidonT3.sol:PoseidonT3": poseidonT3Address,
        "contracts/crypto/PoseidonT4.sol:PoseidonT4": poseidonT4Address,
        "contracts/crypto/PoseidonT5.sol:PoseidonT5": poseidonT5Address,
        "contracts/crypto/PoseidonT6.sol:PoseidonT6": poseidonT6Address,
      }) as Hex,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    // 4. VkRegistry
    const vkRegistryAddress = await this.deployAndStore(
      EContracts.VkRegistry,
      [],
      VkRegistryFactory.abi,
      VkRegistryFactory.bytecode,
      kernelClient,
      bundlerClient,
      publicClient,
      chain,
    );

    try {
      const processMessagesZkeyPathQv = this.fileService.getZkeyFilePaths(
        process.env.COORDINATOR_MESSAGE_PROCESS_ZKEY_NAME!,
        true,
      );
      const tallyVotesZkeyPathQv = this.fileService.getZkeyFilePaths(process.env.COORDINATOR_TALLY_ZKEY_NAME!, true);
      const processMessagesZkeyPathNonQv = this.fileService.getZkeyFilePaths(
        process.env.COORDINATOR_MESSAGE_PROCESS_ZKEY_NAME!,
        false,
      );
      const tallyVotesZkeyPathNonQv = this.fileService.getZkeyFilePaths(
        process.env.COORDINATOR_TALLY_ZKEY_NAME!,
        false,
      );
      const pollJoiningZkeyPath = this.fileService.getZkeyFilePaths(
        process.env.COORDINATOR_POLL_JOINING_ZKEY_NAME!,
        true,
      );
      const pollJoinedZkeyPath = this.fileService.getZkeyFilePaths(
        process.env.COORDINATOR_POLL_JOINED_ZKEY_NAME!,
        true,
      );

      const [qvProcessVk, qvTallyVk, nonQvProcessVk, nonQvTallyVk, pollJoiningVk, pollJoinedVk] = await Promise.all([
        extractVk(processMessagesZkeyPathQv.zkey),
        extractVk(tallyVotesZkeyPathQv.zkey),
        extractVk(processMessagesZkeyPathNonQv.zkey),
        extractVk(tallyVotesZkeyPathNonQv.zkey),
        extractVk(pollJoiningZkeyPath.zkey),
        extractVk(pollJoinedZkeyPath.zkey),
      ]).then((vks) =>
        vks.map(
          (vk: IVkObjectParams | "" | undefined) =>
            vk && (VerifyingKey.fromObj(vk).asContractParam() as IVerifyingKeyStruct),
        ),
      );

      const processZkeys = [qvProcessVk, nonQvProcessVk].filter(Boolean) as IVerifyingKeyStruct[];
      const tallyZkeys = [qvTallyVk, nonQvTallyVk].filter(Boolean) as IVerifyingKeyStruct[];

      // check if the keys are already set
      const isProcessVkSet = await publicClient.readContract({
        address: vkRegistryAddress as Hex,
        abi: VkRegistryFactory.abi,
        functionName: "hasProcessVk",
        args: [
          config.VkRegistry.args.stateTreeDepth,
          config.VkRegistry.args.voteOptionTreeDepth,
          Number(MESSAGE_TREE_ARITY ** config.VkRegistry.args.messageBatchDepth),
          EMode.QV,
        ],
      });

      const isProcessNonQvVkSet = await publicClient.readContract({
        address: vkRegistryAddress as Hex,
        abi: VkRegistryFactory.abi,
        functionName: "hasProcessVk",
        args: [
          config.VkRegistry.args.stateTreeDepth,
          config.VkRegistry.args.voteOptionTreeDepth,
          Number(MESSAGE_TREE_ARITY ** config.VkRegistry.args.messageBatchDepth),
          EMode.NON_QV,
        ],
      });

      const isTallyVkSet = await publicClient.readContract({
        address: vkRegistryAddress as Hex,
        abi: VkRegistryFactory.abi,
        functionName: "hasTallyVk",
        args: [
          config.VkRegistry.args.stateTreeDepth,
          config.VkRegistry.args.intStateTreeDepth,
          config.VkRegistry.args.voteOptionTreeDepth,
          EMode.QV,
        ],
      });

      const isTallyNonQvVkSet = await publicClient.readContract({
        address: vkRegistryAddress as Hex,
        abi: VkRegistryFactory.abi,
        functionName: "hasTallyVk",
        args: [
          config.VkRegistry.args.stateTreeDepth,
          config.VkRegistry.args.intStateTreeDepth,
          config.VkRegistry.args.voteOptionTreeDepth,
          EMode.QV,
        ],
      });

      if (isProcessVkSet && isProcessNonQvVkSet && isTallyVkSet && isTallyNonQvVkSet) {
        this.logger.debug("Verifying keys are already set on the vk registry");
      } else {
        const gasEstimates = await kernelClient.getUserOperationGasPrice();
        const opEstimate = await kernelClient.prepareUserOperationRequest({
          userOperation: {
            sender: kernelClient.account.address,
            maxFeePerGas: gasEstimates.maxFeePerGas,
            maxPriorityFeePerGas: gasEstimates.maxPriorityFeePerGas,
            callData: await kernelClient.account.encodeCallData({
              to: vkRegistryAddress as Hex,
              value: 0n,
              data: encodeFunctionData({
                abi: VkRegistryFactory.abi,
                functionName: "setVerifyingKeysBatch",
                args: [
                  config.VkRegistry.args.stateTreeDepth,
                  config.VkRegistry.args.intStateTreeDepth,
                  config.VkRegistry.args.voteOptionTreeDepth,
                  Number(MESSAGE_TREE_ARITY ** config.VkRegistry.args.messageBatchDepth),
                  [EMode.QV, EMode.NON_QV],
                  // @ts-expect-error - the abi has a more complex type for the processZkeys and tallyZkeys
                  pollJoiningVk as IVerifyingKeyStruct,
                  // @ts-expect-error - the abi has a more complex type for the processZkeys and tallyZkeys
                  pollJoinedVk as IVerifyingKeyStruct,
                  // @ts-expect-error - the abi has a more complex type for the processZkeys and tallyZkeys
                  processZkeys,
                  tallyZkeys,
                ],
              }),
            }),
          },
        });
        // set vKeys on the vk registry
        const callGasLimitMultiplier = estimateExtraGasLimit(opEstimate.callGasLimit);

        const userOpHashVkRegistry = await kernelClient.sendUserOperation({
          userOperation: {
            callGasLimit:
              opEstimate.callGasLimit + callGasLimitMultiplier < MAX_GAS_LIMIT
                ? opEstimate.callGasLimit + callGasLimitMultiplier
                : MAX_GAS_LIMIT,
            sender: kernelClient.account.address,
            maxFeePerGas: gasEstimates.maxFeePerGas,
            maxPriorityFeePerGas: gasEstimates.maxPriorityFeePerGas,
            callData: await kernelClient.account.encodeCallData({
              to: vkRegistryAddress as Hex,
              value: 0n,
              data: encodeFunctionData({
                abi: VkRegistryFactory.abi,
                functionName: "setVerifyingKeysBatch",
                args: [
                  config.VkRegistry.args.stateTreeDepth,
                  config.VkRegistry.args.intStateTreeDepth,
                  config.VkRegistry.args.voteOptionTreeDepth,
                  Number(MESSAGE_TREE_ARITY ** config.VkRegistry.args.messageBatchDepth),
                  [EMode.QV, EMode.NON_QV],
                  // @ts-expect-error - the abi has a more complex type for the processZkeys and tallyZkeys
                  pollJoiningVk as IVerifyingKeyStruct,
                  // @ts-expect-error - the abi has a more complex type for the processZkeys and tallyZkeys
                  pollJoinedVk as IVerifyingKeyStruct,
                  // @ts-expect-error - the abi has a more complex type for the processZkeys and tallyZkeys
                  processZkeys,
                  tallyZkeys,
                ],
              }),
            }),
          },
        });

        const receiptVkRegistry = await bundlerClient.waitForUserOperationReceipt({
          hash: userOpHashVkRegistry,
        });

        if (!receiptVkRegistry.success) {
          throw new Error(ErrorCodes.FAILED_TO_SET_VERIFYING_KEYS_ON_VK_REGISTRY.toString());
        }
      }
    } catch (error) {
      this.logger.error("Failed to set verifying keys on vk registry: ", error);
    }

    // 5. maci (here we don't check whether one is already deployed, we just deploy it)
    const emptyBallotRoots = genEmptyBallotRoots(config.MACI.stateTreeDepth);

    const maciAddress = await this.deployAndGetAddress(
      kernelClient,
      MACIFactory.abi,
      MACIFactory.linkBytecode({
        "contracts/crypto/PoseidonT3.sol:PoseidonT3": poseidonT3Address,
        "contracts/crypto/PoseidonT4.sol:PoseidonT4": poseidonT4Address,
        "contracts/crypto/PoseidonT5.sol:PoseidonT5": poseidonT5Address,
        "contracts/crypto/PoseidonT6.sol:PoseidonT6": poseidonT6Address,
      }) as Hex,
      [
        pollFactoryAddress,
        messageProcessorFactoryAddress,
        tallyFactoryAddress,
        gatekeeperAddress,
        initialVoiceCreditProxyAddress,
        config.MACI.stateTreeDepth,
        emptyBallotRoots,
      ],
      bundlerClient,
      publicClient,
    );

    if (!maciAddress) {
      throw new Error(`${ErrorCodes.FAILED_TO_DEPLOY_CONTRACT} - ${EContracts.MACI}`);
    }

    await this.storage.register({
      id: EContracts.MACI,
      contract: new BaseContract(maciAddress, MACIFactory.abi as unknown as InterfaceAbi),
      args: [
        pollFactoryAddress,
        messageProcessorFactoryAddress,
        tallyFactoryAddress,
        gatekeeperAddress,
        initialVoiceCreditProxyAddress,
        config.MACI.stateTreeDepth,
        emptyBallotRoots.map((root) => root.toString()),
      ],
      network: chain,
    });

    // set the gate on the gatekeeper
    const userOpHash = await kernelClient.sendUserOperation({
      userOperation: {
        callData: await kernelClient.account.encodeCallData({
          to: gatekeeperAddress! as Hex,
          value: 0n,
          data: encodeFunctionData({
            abi: gatekeeperData.abi,
            functionName: "setMaciInstance",
            args: [maciAddress],
          }),
        }),
      },
      account: kernelClient.account,
    });

    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    if (!receipt.success) {
      throw new Error(ErrorCodes.FAILED_TO_SET_MACI_INSTANCE_ON_GATEKEEPER.toString());
    }

    return maciAddress;
  }

  /**
   * Deploy a poll
   *
   * @param args - deploy poll dto
   * @returns poll id
   */
  async deployPoll({ approval, sessionKeyAddress, chain, config }: IDeployPollArgs): Promise<string> {
    // check if there is a maci contract deployed on this chain
    const maciAddress = this.storage.getAddress(EContracts.MACI, chain);
    if (!maciAddress) {
      throw new Error(ErrorCodes.MACI_NOT_DEPLOYED.toString());
    }

    // check if there is a verifier deployed on this chain
    const verifierAddress = this.storage.getAddress(EContracts.Verifier, chain);
    if (!verifierAddress) {
      throw new Error(ErrorCodes.VERIFIER_NOT_DEPLOYED.toString());
    }

    // check if there is a vk registry deployed on this chain
    const vkRegistryAddress = this.storage.getAddress(EContracts.VkRegistry, chain);
    if (!vkRegistryAddress) {
      throw new Error(ErrorCodes.VK_REGISTRY_NOT_DEPLOYED.toString());
    }

    const mode = config.useQuadraticVoting ? EMode.QV : EMode.NON_QV;

    const kernelClient = await this.sessionKeysService.generateClientFromSessionKey(sessionKeyAddress, approval, chain);

    const publicClient = getPublicClient(chain);
    const bundlerClient = getBundlerClient(chain);

    const pollId = await publicClient.readContract({
      address: maciAddress as Hex,
      abi: MACIFactory.abi,
      functionName: "nextPollId",
    });

    try {
      const gasEstimates = await kernelClient.getUserOperationGasPrice();
      const opEstimate = await kernelClient.prepareUserOperationRequest({
        userOperation: {
          sender: kernelClient.account.address,
          maxFeePerGas: gasEstimates.maxFeePerGas,
          maxPriorityFeePerGas: gasEstimates.maxPriorityFeePerGas,
          callData: await kernelClient.account.encodeCallData({
            to: maciAddress as Hex,
            value: 0n,
            data: encodeFunctionData({
              abi: MACIFactory.abi,
              functionName: "deployPoll",
              args: [
                {
                  duration: BigInt(config.pollDuration),
                  treeDepths: {
                    intStateTreeDepth: config.intStateTreeDepth,
                    voteOptionTreeDepth: config.voteOptionTreeDepth,
                  },
                  messageBatchSize: Number(MESSAGE_TREE_ARITY ** BigInt(config.messageTreeDepth)),
                  coordinatorPubKey: PubKey.deserialize(config.coordinatorPubkey).asContractParam() as {
                    x: bigint;
                    y: bigint;
                  },
                  verifier: verifierAddress as Hex,
                  vkRegistry: vkRegistryAddress as Hex,
                  mode,
                  gatekeeper: this.storage.getAddress(config.gatekeeper as unknown as EContracts, chain) as Hex,
                  initialVoiceCreditProxy: this.storage.getAddress(
                    config.voiceCreditProxy as unknown as EContracts,
                    chain,
                  ) as Hex,
                  relayers: config.relayers ? config.relayers.map((address) => address as Hex) : [],
                },
              ],
            }),
          }),
        },
      });

      const callGasLimitMultiplier = estimateExtraGasLimit(opEstimate.callGasLimit);

      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          sender: kernelClient.account.address,
          maxFeePerGas: gasEstimates.maxFeePerGas,
          maxPriorityFeePerGas: gasEstimates.maxPriorityFeePerGas,
          callGasLimit:
            opEstimate.callGasLimit + callGasLimitMultiplier < MAX_GAS_LIMIT
              ? opEstimate.callGasLimit + callGasLimitMultiplier
              : MAX_GAS_LIMIT,
          callData: await kernelClient.account.encodeCallData({
            to: maciAddress as Hex,
            value: 0n,
            data: encodeFunctionData({
              abi: MACIFactory.abi,
              functionName: "deployPoll",
              args: [
                {
                  duration: BigInt(config.pollDuration),
                  treeDepths: {
                    intStateTreeDepth: config.intStateTreeDepth,
                    voteOptionTreeDepth: config.voteOptionTreeDepth,
                  },
                  messageBatchSize: Number(MESSAGE_TREE_ARITY ** BigInt(config.messageTreeDepth)),
                  coordinatorPubKey: PubKey.deserialize(config.coordinatorPubkey).asContractParam() as {
                    x: bigint;
                    y: bigint;
                  },
                  verifier: verifierAddress as Hex,
                  vkRegistry: vkRegistryAddress as Hex,
                  mode,
                  gatekeeper: this.storage.getAddress(config.gatekeeper as unknown as EContracts, chain) as Hex,
                  initialVoiceCreditProxy: this.storage.getAddress(
                    config.voiceCreditProxy as unknown as EContracts,
                    chain,
                  ) as Hex,
                  relayers: config.relayers ? config.relayers.map((address) => address as Hex) : [],
                },
              ],
            }),
          }),
        },
      });

      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      if (!receipt.success) {
        throw new Error(`${ErrorCodes.FAILED_TO_DEPLOY_CONTRACT} - ${EContracts.Poll}`);
      }
    } catch (error) {
      this.logger.error("error deploying poll", error);
      throw new Error(ErrorCodes.FAILED_TO_DEPLOY_POLL.toString());
    }

    // get the addresses so we can store this information
    const pollAddresses = await publicClient.readContract({
      address: maciAddress as Hex,
      abi: MACIFactory.abi,
      functionName: "getPoll",
      args: [pollId],
    });

    // read the emptyBallotRoot
    const emptyBallotRoot = await publicClient.readContract({
      address: pollAddresses.poll,
      abi: PollFactory.abi,
      functionName: "emptyBallotRoot",
    });

    const extContracts = await publicClient.readContract({
      address: pollAddresses.poll,
      abi: PollFactory.abi,
      functionName: "extContracts",
    });

    // store to storage
    await Promise.all([
      this.storage.register({
        id: EContracts.Poll,
        key: `poll-${pollId}`,
        contract: new BaseContract(pollAddresses.poll, PollFactory.abi as unknown as InterfaceAbi),
        args: [
          config.pollDuration,
          {
            intStateTreeDepth: config.intStateTreeDepth,
            messageTreeSubDepth: config.messageTreeSubDepth,
            messageTreeDepth: config.messageTreeDepth,
            voteOptionTreeDepth: config.voteOptionTreeDepth,
          },
          PubKey.deserialize(config.coordinatorPubkey).asContractParam() as { x: bigint; y: bigint },
          extContracts,
          emptyBallotRoot.toString(),
        ],
        network: chain,
      }),
      this.storage.register({
        id: EContracts.MessageProcessor,
        key: `poll-${pollId}`,
        contract: new BaseContract(pollAddresses.messageProcessor, MessageProcessorFactory.abi),
        args: [verifierAddress, vkRegistryAddress, pollAddresses.poll, mode],
        network: chain,
      }),
      this.storage.register({
        id: EContracts.Tally,
        key: `poll-${pollId}`,
        contract: new BaseContract(pollAddresses.tally, TallyFactory.abi),
        args: [verifierAddress, vkRegistryAddress, pollAddresses.poll, pollAddresses.messageProcessor, mode],
        network: chain,
      }),
    ]);

    return pollId.toString();
  }
}
