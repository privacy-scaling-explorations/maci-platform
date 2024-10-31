import { ContractStorage, Deployment, type IDeployParams } from "maci-contracts";

import { EDeploySteps, EContracts } from "../../helpers/constants";

const deployment = Deployment.getInstance({ contractNames: EContracts });
const storage = ContractStorage.getInstance();

/**
 * Deploy step registration and task itself
 */
deployment.deployTask(EDeploySteps.PollFactory, "Deploy poll factory").then((task) =>
  task.setAction(async ({ incremental }: IDeployParams, hre) => {
    deployment.setHre(hre);
    deployment.setContractNames(EContracts);
    const deployer = await deployment.getDeployer();

    const pollFactoryContractAddress = storage.getAddress(EContracts.PollFactory, hre.network.name);

    if (incremental && pollFactoryContractAddress) {
      return;
    }

    const poseidonT3ContractAddress = storage.mustGetAddress(EContracts.PoseidonT3, hre.network.name);
    const poseidonT4ContractAddress = storage.mustGetAddress(EContracts.PoseidonT4, hre.network.name);
    const poseidonT5ContractAddress = storage.mustGetAddress(EContracts.PoseidonT5, hre.network.name);
    const poseidonT6ContractAddress = storage.mustGetAddress(EContracts.PoseidonT6, hre.network.name);

    const linkedPollFactoryContract = await hre.ethers.getContractFactory(
      "contracts/maci/PollFactory.sol:PollFactory",
      {
        signer: deployer,
        libraries: {
          PoseidonT3: poseidonT3ContractAddress,
          PoseidonT4: poseidonT4ContractAddress,
          PoseidonT5: poseidonT5ContractAddress,
          PoseidonT6: poseidonT6ContractAddress,
        },
      },
    );

    const pollFactoryContract = await deployment.deployContractWithLinkedLibraries({
      contractFactory: linkedPollFactoryContract,
    });

    await storage.register({
      id: EContracts.PollFactory,
      contract: pollFactoryContract,
      args: [],
      network: hre.network.name,
    });
  }),
);
