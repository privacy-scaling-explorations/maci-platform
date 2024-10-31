import { ethers } from "hardhat";
import {
  deployConstantInitialVoiceCreditProxy,
  deployFreeForAllSignUpGatekeeper,
  deployMaci,
  Deployment,
  deployMockVerifier,
  deployPoseidonContracts,
  deployVkRegistry,
  type ConstantInitialVoiceCreditProxy,
  type FreeForAllGatekeeper,
  type MockVerifier,
  type VkRegistry,
} from "maci-contracts";

import type { ContractFactory, Signer, JsonRpcProvider } from "ethers";
import type { TreeDepths } from "maci-core";
import type { PubKey } from "maci-domainobjs";

import { EContracts } from "../tasks/helpers/constants";
import { Poll, PollFactory as PollFactoryContract, Poll__factory as PollFactory, type MACI } from "../typechain-types";

/**
 * An interface that represents argument for deployment test contracts
 */
export interface IDeployedTestContractsArgs {
  initialVoiceCreditBalance: number;
  stateTreeDepth: number;
  signer?: Signer;
  quiet?: boolean;
  gatekeeper?: FreeForAllGatekeeper;
}

/**
 * An interface holding all of the smart contracts part of MACI.
 */
export interface IDeployedTestContracts {
  mockVerifierContract: MockVerifier;
  gatekeeperContract: FreeForAllGatekeeper;
  constantInitialVoiceCreditProxyContract: ConstantInitialVoiceCreditProxy;
  maciContract: MACI;
  vkRegistryContract: VkRegistry;
}

/**
 * Deploy a set of smart contracts that can be used for testing.
 * @param initialVoiceCreditBalance - the initial voice credit balance for each user
 * @param stateTreeDepth - the depth of the state tree
 * @param signer - the signer to use
 * @param quiet - whether to suppress console output
 * @param gatekeeper - the gatekeeper contract to use
 * @returns the deployed contracts
 */
export const deployTestContracts = async ({
  initialVoiceCreditBalance,
  stateTreeDepth,
  signer,
  quiet = true,
  gatekeeper,
}: IDeployedTestContractsArgs): Promise<IDeployedTestContracts> => {
  const mockVerifierContract = await deployMockVerifier(signer, true);

  let gatekeeperContract = gatekeeper;
  if (!gatekeeperContract) {
    gatekeeperContract = await deployFreeForAllSignUpGatekeeper(signer, true);
  }

  const constantInitialVoiceCreditProxyContract = await deployConstantInitialVoiceCreditProxy(
    initialVoiceCreditBalance,
    signer,
    true,
  );

  // VkRegistry
  const vkRegistryContract = await deployVkRegistry(signer, true);
  const [gatekeeperContractAddress, constantInitialVoiceCreditProxyContractAddress] = await Promise.all([
    gatekeeperContract.getAddress(),
    constantInitialVoiceCreditProxyContract.getAddress(),
  ]);

  const { PoseidonT3Contract, PoseidonT4Contract, PoseidonT5Contract, PoseidonT6Contract } =
    await deployPoseidonContracts(signer, {}, quiet);

  const poseidonAddresses = await Promise.all([
    PoseidonT3Contract.getAddress(),
    PoseidonT4Contract.getAddress(),
    PoseidonT5Contract.getAddress(),
    PoseidonT6Contract.getAddress(),
  ]).then(([poseidonT3, poseidonT4, poseidonT5, poseidonT6]) => ({
    poseidonT3,
    poseidonT4,
    poseidonT5,
    poseidonT6,
  }));

  const factories = await Promise.all(
    [
      "contracts/maci/MACI.sol:MACI",
      "contracts/maci/PollFactory.sol:PollFactory",
      "MessageProcessorFactory",
      "contracts/maci/TallyFactory.sol:TallyFactory",
    ].map((factory) =>
      ethers.getContractFactory(factory, {
        libraries: {
          "maci-contracts/contracts/crypto/PoseidonT3.sol:PoseidonT3": PoseidonT3Contract,
          "maci-contracts/contracts/crypto/PoseidonT4.sol:PoseidonT4": PoseidonT4Contract,
          "maci-contracts/contracts/crypto/PoseidonT5.sol:PoseidonT5": PoseidonT5Contract,
          "maci-contracts/contracts/crypto/PoseidonT6.sol:PoseidonT6": PoseidonT6Contract,
        },
      }),
    ),
  );

  const { maciContract } = await deployMaci({
    signUpTokenGatekeeperContractAddress: gatekeeperContractAddress,
    initialVoiceCreditBalanceAddress: constantInitialVoiceCreditProxyContractAddress,
    signer,
    stateTreeDepth,
    poseidonAddresses,
    factories: factories as [ContractFactory, ContractFactory, ContractFactory, ContractFactory],
    quiet,
  });

  return {
    mockVerifierContract,
    gatekeeperContract,
    constantInitialVoiceCreditProxyContract,
    maciContract: maciContract as MACI,
    vkRegistryContract,
  };
};

/**
 * An interface that represents arguments for test poll deployment
 */
export interface IDeployTestPollArgs {
  signer: Signer;
  emptyBallotRoot: bigint | number;
  treeDepths: TreeDepths;
  duration: bigint | number;
  coordinatorPubKey: PubKey;
}

/**
 * Deploy a test poll using poll factory.
 *
 * @param signer - the signer to use
 * @param emptyBallotRoot - the empty ballot root
 * @param treeDepths - the tree depths
 * @param duration - the poll duration
 * @param coordinatorPubKey - the coordinator public key
 * @returns the deployed poll contract
 */
export const deployTestPoll = async ({
  signer,
  emptyBallotRoot,
  treeDepths,
  duration,
  coordinatorPubKey,
}: IDeployTestPollArgs): Promise<Poll> => {
  const { PoseidonT3Contract, PoseidonT4Contract, PoseidonT5Contract, PoseidonT6Contract } =
    await deployPoseidonContracts(signer);

  const contractFactory = await ethers.getContractFactory("contracts/maci/PollFactory.sol:PollFactory", {
    signer,
    libraries: {
      PoseidonT3: PoseidonT3Contract,
      PoseidonT4: PoseidonT4Contract,
      PoseidonT5: PoseidonT5Contract,
      PoseidonT6: PoseidonT6Contract,
    },
  });

  const deployment = Deployment.getInstance({ contractNames: EContracts });
  deployment.setContractNames(EContracts);

  const pollFactory = await deployment.deployContractWithLinkedLibraries<PollFactoryContract>({
    contractFactory,
    signer,
  });

  const pollAddress = await pollFactory.deploy.staticCall(
    duration,
    treeDepths,
    coordinatorPubKey.asContractParam(),
    await signer.getAddress(),
    emptyBallotRoot,
  );

  await pollFactory
    .deploy("100", treeDepths, coordinatorPubKey.asContractParam(), await signer.getAddress(), emptyBallotRoot)
    .then((tx) => tx.wait());

  return PollFactory.connect(pollAddress, signer);
};

/**
 * Utility to travel in time when using a local blockchain
 * @param seconds - the number of seconds to travel in time
 * @param quiet - whether to log the output
 */
export const timeTravel = async (seconds: number, signer: Signer): Promise<void> => {
  // send the instructions to the provider
  await (signer.provider as JsonRpcProvider).send("evm_increaseTime", [Number(seconds)]);
  await (signer.provider as JsonRpcProvider).send("evm_mine", []);

  // eslint-disable-next-line no-console
  console.log(`Fast-forwarded ${seconds} seconds`);
};
