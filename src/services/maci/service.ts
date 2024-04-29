import {
  linkPoseidonLibraries,
  Deployment,
  ContractStorage,
  EContracts,
  EMode,
  VerifyingKey,
  PollFactory__factory as PollFactoryFactory,
  MessageProcessorFactory__factory as MessageProcessorFactoryFactory,
  TallyFactory__factory as TallyFactoryFactory,
  MACI__factory as MACIFactory,
  ConstantInitialVoiceCreditProxy__factory as ConstantInitialVoiceCreditProxyFactory,
  EASGatekeeper__factory as EASGatekeeperFactory,
  Verifier__factory as VerifierFactory,
  VkRegistry__factory as VkRegistryFactory,
  type MACI,
  type EASGatekeeper,
  type IVerifyingKeyStruct,
  type VkRegistry,
  type IVkObjectParams,
} from "maci-cli/sdk";

import { type Signer, Contract } from "ethers";

import type {
  IDeployGatekeeperArgs,
  IDeployInitialVoiceCreditProxyArgs,
  IDeployVkRegistryArgs,
  IRegisterArgs,
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
  }: IDeployInitialVoiceCreditProxyArgs): Promise<string> {
    const address = this.storage.getAddress(
      EContracts.ConstantInitialVoiceCreditProxy,
      await this.getNetwork(),
    );
    if (address) return address;

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
  }: IDeployGatekeeperArgs): Promise<string> {
    const address = this.storage.getAddress(
      EContracts.EASGatekeeper,
      await this.getNetwork(),
    );
    if (address) return address;

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
  async deployVerifier(): Promise<string> {
    const address = this.storage.getAddress(
      EContracts.Verifier,
      await this.getNetwork(),
    );
    if (address) return address;

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
  async deployPollFactory(): Promise<string> {
    const network = await this.getNetwork();

    const address = this.storage.getAddress(EContracts.PollFactory, network);
    if (address) return address;

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
  async deployMessageProcessorFactory(): Promise<string> {
    const network = await this.getNetwork();

    const address = this.storage.getAddress(
      EContracts.MessageProcessorFactory,
      network,
    );
    if (address) return address;

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
  async deployTallyFactory(): Promise<string> {
    const network = await this.getNetwork();

    const address = this.storage.getAddress(EContracts.TallyFactory, network);
    if (address) return address;

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
  async deployMaci(): Promise<string> {
    const network = await this.getNetwork();

    const address = this.storage.getAddress(EContracts.MACI, network);
    if (address) return address;

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

    const gatekeeperContract = new Contract(
      gatekeeperContractAddress,
      EASGatekeeperFactory.abi,
      this.deployer,
    ) as unknown as EASGatekeeper;
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
  }: IDeployVkRegistryArgs): Promise<string> {
    const address = this.storage.getAddress(
      EContracts.VkRegistry,
      await this.getNetwork(),
    );
    if (address) return address;

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

  /**
   * Register contracts to the ContractStorage
   *
   * @param args - arguments for contract registration
   */
  async register({ id, contract, address, args }: IRegisterArgs) {
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
      args: args ?? [],
      network: await this.getNetwork(),
    });
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
