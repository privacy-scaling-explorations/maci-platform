/* eslint-disable @typescript-eslint/unbound-method */
import { ZeroAddress, type Signer } from "ethers";
import {
  linkPoseidonLibraries,
  ContractStorage,
  Deployment,
  EContracts,
  EMode,
  VerifyingKey,
  PubKey,
  MessageProcessorFactory__factory as MessageProcessorFactoryFactory,
  PollFactory__factory as PollFactoryFactory,
  TallyFactory__factory as TallyFactoryFactory,
  MACI__factory as MACIFactory,
  ConstantInitialVoiceCreditProxy__factory as ConstantInitialVoiceCreditProxyFactory,
  EASGatekeeper__factory as EASGatekeeperFactory,
  Verifier__factory as VerifierFactory,
  VkRegistry__factory as VkRegistryFactory,
} from "maci-cli/sdk";
import { describe, expect, test, vi, beforeEach, type Mock } from "vitest";

import {
  STATE_TREE_DEPTH,
  INT_STATE_TREE_DEPTH,
  MESSAGE_TREE_DEPTH,
  VOTE_OPTION_TREE_DEPTH,
  MESSAGE_BATCH_DEPTH,
  POSEIDON_T3_ADDRESS,
  POSEIDON_T4_ADDRESS,
  POSEIDON_T5_ADDRESS,
  POSEIDON_T6_ADDRESS,
} from "../constants";
import { MaciService } from "..";

vi.mock("maci-cli/sdk", async () => {
  const mod = await vi.importActual("maci-cli/sdk");

  return {
    ...mod,
    Deployment: {
      getInstance: vi.fn(),
    },
    ContractStorage: {
      getInstance: vi.fn(),
    },
  };
});

describe("MaciService", () => {
  const mockDeployer = {
    provider: {
      getNetwork: vi.fn(() => Promise.resolve({ name: "localhost" })),
    },
  } as unknown as Signer;

  const mockContract = {
    getAddress: vi.fn(() => Promise.resolve(ZeroAddress)),
    stateAq: vi.fn(() => Promise.resolve(ZeroAddress)),
    setMaciInstance: vi.fn(() => Promise.resolve({ wait: vi.fn() })),
    setVerifyingKeysBatch: vi.fn(() => Promise.resolve({ wait: vi.fn() })),
    nextPollId: vi.fn(() => Promise.resolve(0)),
    deployPoll: vi.fn(() =>
      Promise.resolve({
        wait: vi.fn(() => Promise.resolve({ status: 1 })),
      }),
    ),
    maxValues: vi.fn(() => Promise.resolve([10, 20])),
    extContracts: vi.fn(() => Promise.resolve([ZeroAddress, ZeroAddress])),
  };

  const mockDeployment = {
    createContractFactory: vi.fn(() => Promise.resolve(mockContract)),
    deployContractWithLinkedLibraries: vi.fn(() =>
      Promise.resolve(mockContract),
    ),
    getDeployer: vi.fn(() => Promise.resolve(mockDeployer)),
    getContract: vi.fn(() => Promise.resolve(mockContract)),
    setHre: vi.fn(),
    deployContract: vi.fn(() => Promise.resolve(mockContract)),
  } as unknown as Deployment;

  const mockStorage = {
    register: vi.fn(),
    mustGetAddress: vi.fn(() => ZeroAddress),
    getAddress: vi.fn(() => undefined),
  } as unknown as ContractStorage;

  beforeEach(() => {
    (Deployment.getInstance as Mock).mockReturnValue(mockDeployment);

    (ContractStorage.getInstance as Mock).mockReturnValue(mockStorage);

    mockStorage.getAddress = vi.fn(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should deploy initial voice credit proxy", async () => {
    const service = new MaciService(mockDeployer);

    const address = await service.deployInitialVoiceCreditProxy({ amount: 10 });

    expect(address).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(1);
    expect(mockDeployment.deployContract).toHaveBeenCalledWith(
      {
        name: EContracts.ConstantInitialVoiceCreditProxy,
        signer: mockDeployer,
        abi: ConstantInitialVoiceCreditProxyFactory.abi,
        bytecode: ConstantInitialVoiceCreditProxyFactory.bytecode,
      },
      "10",
    );
    expect(mockStorage.register).toHaveBeenCalledTimes(1);
    expect(mockStorage.register).toHaveBeenCalledWith({
      id: EContracts.ConstantInitialVoiceCreditProxy,
      contract: mockContract,
      args: ["10"],
      network: "localhost",
    });

    mockStorage.getAddress = vi.fn(() => ZeroAddress);

    const secondAddress = await service.deployInitialVoiceCreditProxy({
      amount: 10,
    });
    expect(secondAddress).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(1);

    const thirdAddress = await service.deployInitialVoiceCreditProxy({
      amount: 10,
      forceDeploy: true,
    });
    expect(thirdAddress).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(2);
  });

  test("should deploy gatekeeper contract properly", async () => {
    const service = new MaciService(mockDeployer);

    const address = await service.deployGatekeeper({
      easAddress: ZeroAddress,
      encodedSchema: "1",
      attester: ZeroAddress,
    });

    expect(address).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(1);
    expect(mockDeployment.deployContract).toHaveBeenCalledWith(
      {
        name: EContracts.EASGatekeeper,
        signer: mockDeployer,
        abi: EASGatekeeperFactory.abi,
        bytecode: EASGatekeeperFactory.bytecode,
      },
      ZeroAddress,
      ZeroAddress,
      "1",
    );
    expect(mockStorage.register).toHaveBeenCalledTimes(1);
    expect(mockStorage.register).toHaveBeenCalledWith({
      id: EContracts.EASGatekeeper,
      contract: mockContract,
      args: [ZeroAddress, ZeroAddress, "1"],
      network: "localhost",
    });

    mockStorage.getAddress = vi.fn(() => ZeroAddress);

    const secondAddress = await service.deployGatekeeper({
      easAddress: ZeroAddress,
      encodedSchema: "1",
      attester: ZeroAddress,
    });
    expect(secondAddress).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(1);

    const thirdAddress = await service.deployGatekeeper({
      easAddress: ZeroAddress,
      encodedSchema: "1",
      attester: ZeroAddress,
      forceDeploy: true,
    });
    expect(thirdAddress).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(2);
  });

  test("should deploy verifier properly", async () => {
    const service = new MaciService(mockDeployer);

    const address = await service.deployVerifier({});

    expect(address).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(1);
    expect(mockDeployment.deployContract).toHaveBeenCalledWith({
      name: EContracts.Verifier,
      signer: mockDeployer,
      abi: VerifierFactory.abi,
      bytecode: VerifierFactory.bytecode,
    });
    expect(mockStorage.register).toHaveBeenCalledTimes(1);
    expect(mockStorage.register).toHaveBeenCalledWith({
      id: EContracts.Verifier,
      contract: mockContract,
      args: [],
      network: "localhost",
    });

    mockStorage.getAddress = vi.fn(() => ZeroAddress);

    const secondAddress = await service.deployVerifier({});
    expect(secondAddress).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(1);

    const thirdAddress = await service.deployVerifier({ forceDeploy: true });
    expect(thirdAddress).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(2);
  });

  test("should deploy poll factory properly", async () => {
    const service = new MaciService(mockDeployer);

    const address = await service.deployPollFactory({});

    expect(address).toBe(ZeroAddress);
    expect(mockDeployment.createContractFactory).toHaveBeenCalledTimes(1);
    expect(mockDeployment.createContractFactory).toHaveBeenCalledWith(
      PollFactoryFactory.abi,
      PollFactoryFactory.linkBytecode(
        linkPoseidonLibraries(
          POSEIDON_T3_ADDRESS,
          POSEIDON_T4_ADDRESS,
          POSEIDON_T5_ADDRESS,
          POSEIDON_T6_ADDRESS,
        ),
      ),
      mockDeployer,
    );
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledWith({
      contractFactory: mockContract,
      signer: mockDeployer,
    });

    expect(mockStorage.register).toHaveBeenCalledTimes(1);
    expect(mockStorage.register).toHaveBeenCalledWith({
      id: EContracts.PollFactory,
      contract: mockContract,
      args: [],
      network: "localhost",
    });

    mockStorage.getAddress = vi.fn(() => ZeroAddress);

    const secondAddress = await service.deployPollFactory({});
    expect(secondAddress).toBe(ZeroAddress);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(1);

    const thirdAddress = await service.deployPollFactory({ forceDeploy: true });
    expect(thirdAddress).toBe(ZeroAddress);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(2);
  });

  test("should deploy message processor factory properly", async () => {
    const service = new MaciService(mockDeployer);

    const address = await service.deployMessageProcessorFactory({});

    expect(address).toBe(ZeroAddress);
    expect(mockDeployment.createContractFactory).toHaveBeenCalledTimes(1);
    expect(mockDeployment.createContractFactory).toHaveBeenCalledWith(
      MessageProcessorFactoryFactory.abi,
      MessageProcessorFactoryFactory.linkBytecode(
        linkPoseidonLibraries(
          POSEIDON_T3_ADDRESS,
          POSEIDON_T4_ADDRESS,
          POSEIDON_T5_ADDRESS,
          POSEIDON_T6_ADDRESS,
        ),
      ),
      mockDeployer,
    );
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledWith({
      contractFactory: mockContract,
      signer: mockDeployer,
    });

    expect(mockStorage.register).toHaveBeenCalledTimes(1);
    expect(mockStorage.register).toHaveBeenCalledWith({
      id: EContracts.MessageProcessorFactory,
      contract: mockContract,
      args: [],
      network: "localhost",
    });

    mockStorage.getAddress = vi.fn(() => ZeroAddress);

    const secondAddress = await service.deployMessageProcessorFactory({});
    expect(secondAddress).toBe(ZeroAddress);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(1);

    const thirdAddress = await service.deployMessageProcessorFactory({
      forceDeploy: true,
    });
    expect(thirdAddress).toBe(ZeroAddress);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(2);
  });

  test("should deploy tally factory properly", async () => {
    const service = new MaciService(mockDeployer);

    const address = await service.deployTallyFactory({});

    expect(address).toBe(ZeroAddress);
    expect(mockDeployment.createContractFactory).toHaveBeenCalledTimes(1);
    expect(mockDeployment.createContractFactory).toHaveBeenCalledWith(
      TallyFactoryFactory.abi,
      TallyFactoryFactory.linkBytecode(
        linkPoseidonLibraries(
          POSEIDON_T3_ADDRESS,
          POSEIDON_T4_ADDRESS,
          POSEIDON_T5_ADDRESS,
          POSEIDON_T6_ADDRESS,
        ),
      ),
      mockDeployer,
    );
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledWith({
      contractFactory: mockContract,
      signer: mockDeployer,
    });

    expect(mockStorage.register).toHaveBeenCalledTimes(1);
    expect(mockStorage.register).toHaveBeenCalledWith({
      id: EContracts.TallyFactory,
      contract: mockContract,
      args: [],
      network: "localhost",
    });

    mockStorage.getAddress = vi.fn(() => ZeroAddress);

    const secondAddress = await service.deployTallyFactory({});
    expect(secondAddress).toBe(ZeroAddress);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(1);

    const thirdAddress = await service.deployTallyFactory({
      forceDeploy: true,
    });
    expect(thirdAddress).toBe(ZeroAddress);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(2);
  });

  test("should deploy maci properly", async () => {
    const service = new MaciService(mockDeployer);

    const address = await service.deployMaci({});

    expect(address).toBe(ZeroAddress);
    expect(mockDeployment.createContractFactory).toHaveBeenCalledTimes(1);
    expect(mockDeployment.createContractFactory).toHaveBeenCalledWith(
      MACIFactory.abi,
      MACIFactory.linkBytecode(
        linkPoseidonLibraries(
          POSEIDON_T3_ADDRESS,
          POSEIDON_T4_ADDRESS,
          POSEIDON_T5_ADDRESS,
          POSEIDON_T6_ADDRESS,
        ),
      ),
      mockDeployer,
    );
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledWith(
      {
        contractFactory: mockContract,
        signer: mockDeployer,
      },
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
      ZeroAddress,
      10,
    );
    expect(mockContract.setMaciInstance).toHaveBeenCalledTimes(1);
    expect(mockContract.setMaciInstance).toHaveBeenCalledWith(ZeroAddress);
    expect(mockStorage.register).toHaveBeenCalledTimes(1);
    expect(mockStorage.register).toHaveBeenCalledWith({
      id: EContracts.MACI,
      contract: mockContract,
      args: [
        ZeroAddress,
        ZeroAddress,
        ZeroAddress,
        ZeroAddress,
        ZeroAddress,
        10,
      ],
      network: "localhost",
    });

    mockStorage.getAddress = vi.fn(() => ZeroAddress);

    const secondAddress = await service.deployMaci({});
    expect(secondAddress).toBe(ZeroAddress);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(1);

    const thirdAddress = await service.deployMaci({ forceDeploy: true });
    expect(thirdAddress).toBe(ZeroAddress);
    expect(
      mockDeployment.deployContractWithLinkedLibraries,
    ).toHaveBeenCalledTimes(2);
  });

  test("should deploy VK registry properly", async () => {
    const defaultZkey = {
      protocol: 0n,
      curve: 0n,
      nPublic: 0n,
      vk_alpha_1: [0n, 0n],
      vk_beta_2: [
        [0n, 0n],
        [0n, 0n],
      ],
      vk_gamma_2: [
        [0n, 0n],
        [0n, 0n],
      ],
      vk_delta_2: [
        [0n, 0n],
        [0n, 0n],
      ],
      vk_alphabeta_12: [],
      IC: [
        [0n, 0n],
        [0n, 0n],
      ],
    };
    const defaultArgs = {
      processMessagesZkeyQv: defaultZkey,
      processMessagesZkeyNonQv: defaultZkey,
      tallyVotesZkeyQv: defaultZkey,
      tallyVotesZkeyNonQv: defaultZkey,
    };
    const service = new MaciService(mockDeployer);

    const address = await service.deployVkRegistry(defaultArgs);

    expect(address).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(1);
    expect(mockDeployment.deployContract).toHaveBeenCalledWith({
      name: EContracts.VkRegistry,
      signer: mockDeployer,
      abi: VkRegistryFactory.abi,
      bytecode: VkRegistryFactory.bytecode,
    });
    expect(mockStorage.register).toHaveBeenCalledTimes(1);
    expect(mockStorage.register).toHaveBeenCalledWith({
      id: EContracts.VkRegistry,
      contract: mockContract,
      args: [],
      network: "localhost",
    });
    expect(mockContract.setVerifyingKeysBatch).toHaveBeenCalledTimes(1);
    expect(mockContract.setVerifyingKeysBatch).toHaveBeenCalledWith(
      STATE_TREE_DEPTH,
      INT_STATE_TREE_DEPTH,
      MESSAGE_TREE_DEPTH,
      VOTE_OPTION_TREE_DEPTH,
      5 ** MESSAGE_BATCH_DEPTH,
      [EMode.QV, EMode.NON_QV],
      [
        defaultArgs.processMessagesZkeyQv,
        defaultArgs.processMessagesZkeyNonQv,
      ].map((vk) => VerifyingKey.fromObj(vk).asContractParam()),
      [defaultArgs.tallyVotesZkeyQv, defaultArgs.tallyVotesZkeyNonQv].map(
        (vk) => VerifyingKey.fromObj(vk).asContractParam(),
      ),
    );

    mockStorage.getAddress = vi.fn(() => ZeroAddress);

    const secondAddress = await service.deployVkRegistry(defaultArgs);
    expect(secondAddress).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(1);

    const thirdAddress = await service.deployVkRegistry({
      ...defaultArgs,
      forceDeploy: true,
    });
    expect(thirdAddress).toBe(ZeroAddress);
    expect(mockDeployment.deployContract).toHaveBeenCalledTimes(2);
  });

  test("should deploy poll properly", async () => {
    mockContract.deployPoll.staticCall = vi.fn(() =>
      Promise.resolve([ZeroAddress, ZeroAddress, ZeroAddress]),
    );

    const defaultArgs = {
      duration: 300,
      pubKey:
        "macipk.8a1cc54f26d811a6573edd2dea82eee3031bd6ebca2dde123e53520c2e91c501",
    };
    const service = new MaciService(mockDeployer);

    const addresses = await service.deployPoll(defaultArgs);

    expect(addresses).toStrictEqual({
      pollContractAddress: ZeroAddress,
      messageProcessorContractAddress: ZeroAddress,
      tallyContractAddress: ZeroAddress,
    });

    expect(mockContract.nextPollId).toHaveBeenCalledTimes(1);

    const pollId = await mockContract.nextPollId();
    expect(pollId).toEqual(0);

    const unserializedKey = PubKey.deserialize(defaultArgs.pubKey);

    expect(mockContract.deployPoll.staticCall).toHaveBeenCalledTimes(1);
    expect(mockContract.deployPoll.staticCall).toHaveBeenCalledWith(
      defaultArgs.duration,
      {
        intStateTreeDepth: INT_STATE_TREE_DEPTH,
        messageTreeSubDepth: MESSAGE_BATCH_DEPTH,
        messageTreeDepth: MESSAGE_TREE_DEPTH,
        voteOptionTreeDepth: VOTE_OPTION_TREE_DEPTH,
      },
      unserializedKey.asContractParam(),
      ZeroAddress,
      ZeroAddress,
      EMode.NON_QV,
    );

    expect(mockContract.deployPoll).toHaveBeenCalledTimes(1);
    expect(mockContract.deployPoll).toHaveBeenCalledWith(
      defaultArgs.duration,
      {
        intStateTreeDepth: INT_STATE_TREE_DEPTH,
        messageTreeSubDepth: MESSAGE_BATCH_DEPTH,
        messageTreeDepth: MESSAGE_TREE_DEPTH,
        voteOptionTreeDepth: VOTE_OPTION_TREE_DEPTH,
      },
      unserializedKey.asContractParam(),
      ZeroAddress,
      ZeroAddress,
      EMode.NON_QV,
    );

    expect(mockContract.maxValues).toHaveBeenCalledTimes(1);
    expect(mockContract.extContracts).toHaveBeenCalledTimes(1);

    const maxValues = await mockContract.maxValues();
    const extContracts = await mockContract.extContracts();

    expect(mockStorage.register).toHaveBeenCalledTimes(4);
    expect(mockStorage.register).toHaveBeenNthCalledWith(1, {
      id: EContracts.Poll,
      key: `poll-${pollId}`,
      contract: mockContract,
      args: [
        defaultArgs.duration,
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
      network: "localhost",
    });
    expect(mockStorage.register).toHaveBeenNthCalledWith(2, {
      id: EContracts.MessageProcessor,
      key: `poll-${pollId}`,
      contract: mockContract,
      args: [ZeroAddress, ZeroAddress, ZeroAddress, EMode.NON_QV],
      network: "localhost",
    });
    expect(mockStorage.register).toHaveBeenNthCalledWith(3, {
      id: EContracts.Tally,
      key: `poll-${pollId}`,
      contract: mockContract,
      args: [ZeroAddress, ZeroAddress, ZeroAddress, ZeroAddress, EMode.NON_QV],
      network: "localhost",
    });
    expect(mockStorage.register).toHaveBeenNthCalledWith(4, {
      id: EContracts.AccQueueQuinaryMaci,
      key: `poll-${pollId}`,
      contract: mockContract,
      args: [MESSAGE_BATCH_DEPTH],
      network: "localhost",
    });
  });

  test("Should get MACI address", async () => {
    const service = new MaciService(mockDeployer);

    const maciAddress = await service.getMaciAddress();
    expect(maciAddress).toBe(ZeroAddress);
  });
});
