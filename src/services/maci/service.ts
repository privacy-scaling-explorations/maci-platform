import {
  linkPoseidonLibraries,
  Deployment,
  ContractStorage,
  EContracts,
  EMode,
  VerifyingKey,
  PubKey,
  PollFactory__factory as PollFactoryFactory,
  MessageProcessorFactory__factory as MessageProcessorFactoryFactory,
  TallyFactory__factory as TallyFactoryFactory,
  MACI__factory as MACIFactory,
  ConstantInitialVoiceCreditProxy__factory as ConstantInitialVoiceCreditProxyFactory,
  EASGatekeeper__factory as EASGatekeeperFactory,
  Verifier__factory as VerifierFactory,
  VkRegistry__factory as VkRegistryFactory,
  Poll__factory as PollFactory,
  MessageProcessor__factory as MessageProcessorFactory,
  Tally__factory as TallyFactory,
  AccQueueQuinaryMaci__factory as AccQueueQuinaryMaciFactory,
  type MACI,
  type IVerifyingKeyStruct,
  type VkRegistry,
  type IVkObjectParams,
  type EASGatekeeper,
  type Poll,
  type MessageProcessor,
  type Tally,
  type AccQueueQuinaryMaci,
} from "maci-cli/sdk";

import { type Signer, Contract } from "ethers";

import type {
  IDeployGatekeeperArgs,
  IDeployInitialVoiceCreditProxyArgs,
  IDeployVkRegistryArgs,
  IRegisterArgs,
  IDeployPollArgs,
  IDeployArgs,
  IMACIData,
} from "./types";
import {
  ABI,
  STATE_TREE_DEPTH,
  INT_STATE_TREE_DEPTH,
  MESSAGE_TREE_DEPTH,
  MESSAGE_BATCH_DEPTH,
  VOTE_OPTION_TREE_DEPTH,
  POSEIDON_T3_ADDRESS,
  POSEIDON_T4_ADDRESS,
  POSEIDON_T5_ADDRESS,
  POSEIDON_T6_ADDRESS,
} from "./constants";

/**
 * MACI service is responsible for deployment of MACI components like:
 * 1. VoiceCreditProxy
 * 2. Gatekeeper
 * 3. Verifier
 * 4. PollFactory
 * 5. MessageProcessorFactory
 * 6. TallyFactory
 * 7. MACI contract
 * 8. VkRegistry
 *
 * MACI service is also responsible for deployment for MACI poll rounds.
 */
export class MaciService {
  /**
   * Deployment helper
   */
  private readonly deployment = Deployment.getInstance();

  /**
   * Contract storage helper
   */
  private readonly storage = ContractStorage.getInstance();

  /**
   * Deployer
   */
  private readonly deployer: Signer;

  /**
   * Initialization for MACI service
   *
   * @param deployer - eth signer
   */
  constructor(deployer: Signer) {
    this.deployer = deployer;
  }

  /**
   * Deploy InitialVoiceCreditProxy contract and save it to the storage
   *
   * @param args - deploy arguments for InitialVoiceCreditProxy
   * @returns deployed contract address
   */
  async deployInitialVoiceCreditProxy({
    amount,
    forceDeploy = false,
  }: IDeployInitialVoiceCreditProxyArgs): Promise<string> {
    const address = this.storage.getAddress(
      EContracts.ConstantInitialVoiceCreditProxy,
      await this.getNetwork(),
    );

    if (!forceDeploy && address) return address;

    const contract = await this.deployment.deployContract(
      {
        name: EContracts.ConstantInitialVoiceCreditProxy,
        signer: this.deployer,
        abi: ConstantInitialVoiceCreditProxyFactory.abi,
        bytecode: ConstantInitialVoiceCreditProxyFactory.bytecode,
      },
      amount.toString(),
    );

    await this.register({
      id: EContracts.ConstantInitialVoiceCreditProxy,
      contract,
      args: [amount.toString()],
    });

    return contract.getAddress();
  }

  /**
   * Deploy EASGatekeeper contract and save it to the storage
   *
   * @param args - deploy arguments for EASGatekeeper
   * @returns deployed contract address
   */
  async deployGatekeeper({
    easAddress,
    encodedSchema,
    attester,
    forceDeploy = false,
  }: IDeployGatekeeperArgs): Promise<string> {
    const address = this.storage.getAddress(
      EContracts.EASGatekeeper,
      await this.getNetwork(),
    );

    if (!forceDeploy && address) return address;

    const contract = await this.deployment.deployContract(
      {
        name: EContracts.EASGatekeeper,
        signer: this.deployer,
        abi: EASGatekeeperFactory.abi,
        bytecode: EASGatekeeperFactory.bytecode,
      },
      easAddress,
      attester,
      encodedSchema,
    );

    await this.register({
      id: EContracts.EASGatekeeper,
      contract,
      args: [easAddress, attester, encodedSchema],
    });

    return contract.getAddress();
  }

  /**
   * Deploy Verifier contract and save it to the storage
   *
   * @returns deployed contract address
   */
  async deployVerifier({ forceDeploy = false }: IDeployArgs): Promise<string> {
    const address = this.storage.getAddress(
      EContracts.Verifier,
      await this.getNetwork(),
    );

    if (!forceDeploy && address) return address;

    const contract = await this.deployment.deployContract({
      name: EContracts.Verifier,
      signer: this.deployer,
      abi: VerifierFactory.abi,
      bytecode: VerifierFactory.bytecode,
    });

    await this.register({
      id: EContracts.Verifier,
      contract,
    });

    return contract.getAddress();
  }

  /**
   * Deploy PollFactory contract and save it to the storage
   *
   * @returns deployed contract address
   */
  async deployPollFactory({
    forceDeploy = false,
  }: IDeployArgs): Promise<string> {
    const network = await this.getNetwork();
    const address = this.storage.getAddress(EContracts.PollFactory, network);

    if (!forceDeploy && address) return address;

    const linkedPollFactoryContract =
      await this.deployment.createContractFactory(
        PollFactoryFactory.abi,
        PollFactoryFactory.linkBytecode(
          linkPoseidonLibraries(
            POSEIDON_T3_ADDRESS,
            POSEIDON_T4_ADDRESS,
            POSEIDON_T5_ADDRESS,
            POSEIDON_T6_ADDRESS,
          ),
        ),
        this.deployer,
      );
    const pollFactoryContract =
      await this.deployment.deployContractWithLinkedLibraries({
        contractFactory: linkedPollFactoryContract,
        signer: this.deployer,
      });

    await this.register({
      id: EContracts.PollFactory,
      contract: pollFactoryContract,
    });

    return pollFactoryContract.getAddress();
  }

  /**
   * Deploy MessageProcessorFactory contract and save it to the storage
   *
   * @returns deployed contract address
   */
  async deployMessageProcessorFactory({
    forceDeploy = false,
  }: IDeployArgs): Promise<string> {
    const network = await this.getNetwork();
    const address = this.storage.getAddress(
      EContracts.MessageProcessorFactory,
      network,
    );

    if (!forceDeploy && address) return address;

    const linkedMessageProcessorFactoryContract =
      await this.deployment.createContractFactory(
        MessageProcessorFactoryFactory.abi,
        MessageProcessorFactoryFactory.linkBytecode(
          linkPoseidonLibraries(
            POSEIDON_T3_ADDRESS,
            POSEIDON_T4_ADDRESS,
            POSEIDON_T5_ADDRESS,
            POSEIDON_T6_ADDRESS,
          ),
        ),
        this.deployer,
      );

    const messageProcessorFactoryContract =
      await this.deployment.deployContractWithLinkedLibraries({
        contractFactory: linkedMessageProcessorFactoryContract,
        signer: this.deployer,
      });

    await this.register({
      id: EContracts.MessageProcessorFactory,
      contract: messageProcessorFactoryContract,
    });

    return messageProcessorFactoryContract.getAddress();
  }

  /**
   * Deploy TallyFactory contract and save it to the storage
   *
   * @returns deployed contract address
   */
  async deployTallyFactory({
    forceDeploy = false,
  }: IDeployArgs): Promise<string> {
    const network = await this.getNetwork();
    const address = this.storage.getAddress(EContracts.TallyFactory, network);

    if (!forceDeploy && address) return address;

    const linkedTallyFactoryContract =
      await this.deployment.createContractFactory(
        TallyFactoryFactory.abi,
        TallyFactoryFactory.linkBytecode(
          linkPoseidonLibraries(
            POSEIDON_T3_ADDRESS,
            POSEIDON_T4_ADDRESS,
            POSEIDON_T5_ADDRESS,
            POSEIDON_T6_ADDRESS,
          ),
        ),
        this.deployer,
      );

    const tallyFactoryContract =
      await this.deployment.deployContractWithLinkedLibraries({
        contractFactory: linkedTallyFactoryContract,
        signer: this.deployer,
      });

    await this.register({
      id: EContracts.TallyFactory,
      contract: tallyFactoryContract,
    });

    return tallyFactoryContract.getAddress();
  }

  /**
   * Deploy MACI contract and save it to the storage
   *
   * @returns deployed contract address
   */
  async deployMaci({ forceDeploy = false }: IDeployArgs): Promise<string> {
    const network = await this.getNetwork();
    const address = this.storage.getAddress(EContracts.MACI, network);

    if (!forceDeploy && address) return address;

    const constantInitialVoiceCreditProxyContractAddress =
      this.storage.mustGetAddress(
        EContracts.ConstantInitialVoiceCreditProxy,
        network,
      );

    const gatekeeperContractAddress = this.storage.mustGetAddress(
      EContracts.EASGatekeeper,
      network,
    );
    const pollFactoryContractAddress = this.storage.mustGetAddress(
      EContracts.PollFactory,
      network,
    );
    const messageProcessorFactoryContractAddress = this.storage.mustGetAddress(
      EContracts.MessageProcessorFactory,
      network,
    );
    const tallyFactoryContractAddress = this.storage.mustGetAddress(
      EContracts.TallyFactory,
      network,
    );

    const maciContractFactory = await this.deployment.createContractFactory(
      MACIFactory.abi,
      MACIFactory.linkBytecode(
        linkPoseidonLibraries(
          POSEIDON_T3_ADDRESS,
          POSEIDON_T4_ADDRESS,
          POSEIDON_T5_ADDRESS,
          POSEIDON_T6_ADDRESS,
        ),
      ),
      this.deployer,
    );

    const maciContract =
      await this.deployment.deployContractWithLinkedLibraries<MACI>(
        {
          contractFactory: maciContractFactory,
          signer: this.deployer,
        },
        pollFactoryContractAddress,
        messageProcessorFactoryContractAddress,
        tallyFactoryContractAddress,
        gatekeeperContractAddress,
        constantInitialVoiceCreditProxyContractAddress,
        STATE_TREE_DEPTH,
      );

    const gatekeeperContract = await this.deployment.getContract<EASGatekeeper>(
      {
        name: EContracts.EASGatekeeper,
        address: gatekeeperContractAddress,
        abi: EASGatekeeperFactory.abi,
        signer: this.deployer,
      },
    );
    const maciInstanceAddress = await maciContract.getAddress();

    if (!gatekeeperContract)
      throw new Error("Error occurred during fetching EASGatekeeper contract");

    await gatekeeperContract
      .setMaciInstance(maciInstanceAddress)
      .then((tx) => tx.wait());

    await this.register({
      id: EContracts.MACI,
      contract: maciContract,
      args: [
        pollFactoryContractAddress,
        messageProcessorFactoryContractAddress,
        tallyFactoryContractAddress,
        gatekeeperContractAddress,
        constantInitialVoiceCreditProxyContractAddress,
        STATE_TREE_DEPTH,
      ],
    });

    return maciInstanceAddress;
  }

  /**
   * Deploy VkRegistry contract and save it to the storage
   *
   * @param args - deploy arguments for VkRegistry
   * @returns deployed contract address
   */
  async deployVkRegistry({
    processMessagesZkeyQv,
    processMessagesZkeyNonQv,
    tallyVotesZkeyQv,
    tallyVotesZkeyNonQv,
    forceDeploy = false,
  }: IDeployVkRegistryArgs): Promise<string> {
    const address = this.storage.getAddress(
      EContracts.VkRegistry,
      await this.getNetwork(),
    );

    if (!forceDeploy && address) return address;

    const [qvProcessVk, qvTallyVk, nonQvProcessVk, nonQvTallyQv] = [
      processMessagesZkeyQv,
      tallyVotesZkeyQv,
      processMessagesZkeyNonQv,
      tallyVotesZkeyNonQv,
    ].map(
      (vk) =>
        VerifyingKey.fromObj(
          vk as IVkObjectParams,
        ).asContractParam() as IVerifyingKeyStruct,
    );

    const vkRegistryContract = await this.deployment.deployContract<VkRegistry>(
      {
        name: EContracts.VkRegistry,
        signer: this.deployer,
        abi: VkRegistryFactory.abi,
        bytecode: VkRegistryFactory.bytecode,
      },
    );

    const processZkeys = [qvProcessVk!, nonQvProcessVk!];
    const tallyZkeys = [qvTallyVk!, nonQvTallyQv!];
    const modes = [EMode.QV, EMode.NON_QV];

    await vkRegistryContract
      .setVerifyingKeysBatch(
        STATE_TREE_DEPTH,
        INT_STATE_TREE_DEPTH,
        MESSAGE_TREE_DEPTH,
        VOTE_OPTION_TREE_DEPTH,
        5 ** MESSAGE_BATCH_DEPTH,
        modes,
        processZkeys,
        tallyZkeys,
      )
      .then((tx) => tx.wait());

    await this.register({
      id: EContracts.VkRegistry,
      contract: vkRegistryContract,
    });

    return vkRegistryContract.getAddress();
  }

  async deployPoll({ duration, pubKey }: IDeployPollArgs) {
    const network = await this.getNetwork();
    const maciContractAddress = this.storage.mustGetAddress(
      EContracts.MACI,
      network,
    );
    const verifierContractAddress = this.storage.mustGetAddress(
      EContracts.Verifier,
      network,
    );
    const vkRegistryContractAddress = this.storage.mustGetAddress(
      EContracts.VkRegistry,
      network,
    );

    const maciContract = await this.deployment.getContract<MACI>({
      name: EContracts.MACI,
      address: maciContractAddress,
      abi: MACIFactory.abi,
      signer: this.deployer,
    });

    const pollId = await maciContract.nextPollId();
    const unserializedKey = PubKey.deserialize(pubKey);
    const mode = EMode.NON_QV;

    if (!unserializedKey) throw new Error("Provided pubKey is not valid.");

    const [
      pollContractAddress,
      messageProcessorContractAddress,
      tallyContractAddress,
    ] = await maciContract.deployPoll.staticCall(
      duration,
      {
        intStateTreeDepth: INT_STATE_TREE_DEPTH,
        messageTreeSubDepth: MESSAGE_BATCH_DEPTH,
        messageTreeDepth: MESSAGE_TREE_DEPTH,
        voteOptionTreeDepth: VOTE_OPTION_TREE_DEPTH,
      },
      unserializedKey.asContractParam(),
      verifierContractAddress,
      vkRegistryContractAddress,
      mode,
    );

    const receipt = await maciContract
      .deployPoll(
        duration,
        {
          intStateTreeDepth: INT_STATE_TREE_DEPTH,
          messageTreeSubDepth: MESSAGE_BATCH_DEPTH,
          messageTreeDepth: MESSAGE_TREE_DEPTH,
          voteOptionTreeDepth: VOTE_OPTION_TREE_DEPTH,
        },
        unserializedKey.asContractParam(),
        verifierContractAddress,
        vkRegistryContractAddress,
        EMode.NON_QV,
      )
      .then((tx) => tx.wait());

    if (receipt?.status !== 1) {
      throw new Error("Deploy poll transaction is failed");
    }

    const pollContract = await this.deployment.getContract<Poll>({
      name: EContracts.Poll,
      address: pollContractAddress,
      abi: PollFactory.abi,
      signer: this.deployer,
    });

    const [maxValues, extContracts] = await Promise.all([
      pollContract.maxValues(),
      pollContract.extContracts(),
    ]);

    const messageProcessorContract =
      await this.deployment.getContract<MessageProcessor>({
        name: EContracts.MessageProcessor,
        address: messageProcessorContractAddress,
        abi: MessageProcessorFactory.abi,
        signer: this.deployer,
      });

    const tallyContract = await this.deployment.getContract<Tally>({
      name: EContracts.Tally,
      address: tallyContractAddress,
      abi: TallyFactory.abi,
      signer: this.deployer,
    });

    const messageAccQueueContract =
      await this.deployment.getContract<AccQueueQuinaryMaci>({
        name: EContracts.AccQueueQuinaryMaci,
        address: extContracts[1],
        abi: AccQueueQuinaryMaciFactory.abi,
        signer: this.deployer,
      });

    await Promise.all([
      this.register({
        id: EContracts.Poll,
        key: `poll-${pollId}`,
        contract: pollContract,
        args: [
          duration,
          maxValues.map((value) => value.toString()),
          {
            intStateTreeDepth: INT_STATE_TREE_DEPTH,
            messageTreeSubDepth: MESSAGE_BATCH_DEPTH,
            messageTreeDepth: MESSAGE_TREE_DEPTH,
            voteOptionTreeDepth: VOTE_OPTION_TREE_DEPTH,
          },
          unserializedKey.asContractParam(),
          extContracts,
        ],
      }),

      this.register({
        id: EContracts.MessageProcessor,
        key: `poll-${pollId}`,
        contract: messageProcessorContract,
        args: [
          verifierContractAddress,
          vkRegistryContractAddress,
          pollContractAddress,
          mode,
        ],
      }),

      this.register({
        id: EContracts.Tally,
        key: `poll-${pollId}`,
        contract: tallyContract,
        args: [
          verifierContractAddress,
          vkRegistryContractAddress,
          pollContractAddress,
          messageProcessorContractAddress,
          mode,
        ],
      }),

      this.register({
        id: EContracts.AccQueueQuinaryMaci,
        key: `poll-${pollId}`,
        contract: messageAccQueueContract,
        args: [MESSAGE_BATCH_DEPTH],
      }),
    ]);

    return {
      pollContractAddress,
      messageProcessorContractAddress,
      tallyContractAddress,
    };
  }

  /**
   * Register contracts to the ContractStorage
   *
   * @param args - arguments for contract registration
   */
  async register({ id, contract, address, key, args }: IRegisterArgs) {
    const abi = ABI[id];

    if (!address && !contract) {
      throw new Error(
        "Address and contract are not provided. Provide at least one.",
      );
    }

    if (!abi && !contract) {
      throw new Error("No such contract.");
    }

    await this.storage.register({
      id,
      contract: contract || new Contract(address, abi, this.deployer),
      key,
      args: args ?? [],
      network: await this.getNetwork(),
    });
  }

  async getMaciData(): Promise<IMACIData> {
    const network = await this.getNetwork();
    const address = this.storage.mustGetAddress(EContracts.MACI, network);
    const deploymentTxHash = this.storage.getDeploymentTxHash(
      EContracts.MACI,
      network,
      address,
    );
    const txReceipt =
      await this.deployer.provider?.getTransaction(deploymentTxHash);

    return {
      address,
      startBlock: txReceipt?.blockNumber ?? 0,
    };
  }

  /**
   * Get current signer's network name
   *
   * @returns network name
   */
  private async getNetwork(): Promise<string> {
    return this.deployer.provider!.getNetwork().then((network) => network.name);
  }
}
