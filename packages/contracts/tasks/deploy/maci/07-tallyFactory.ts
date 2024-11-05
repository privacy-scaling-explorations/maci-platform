import { ContractStorage, Deployment, type IDeployParams } from "maci-contracts";

import { EDeploySteps, EContracts } from "../../helpers/constants";

const deployment = Deployment.getInstance({ contractNames: EContracts });
const storage = ContractStorage.getInstance();

/**
 * Deploy step registration and task itself
 */
deployment.deployTask(EDeploySteps.TallyFactory, "Deploy tally factory").then((task) =>
  task.setAction(async ({ incremental }: IDeployParams, hre) => {
    deployment.setHre(hre);
    deployment.setContractNames(EContracts);
    const deployer = await deployment.getDeployer();

    const tallyFactoryContractAddress = storage.getAddress(EContracts.TallyFactory, hre.network.name);

    if (incremental && tallyFactoryContractAddress) {
      // eslint-disable-next-line no-console
      console.log(`Skipping deployment of the ${EContracts.TallyFactory} contract`);
      return;
    }

    const poseidonT3ContractAddress = storage.mustGetAddress(EContracts.PoseidonT3, hre.network.name);
    const poseidonT4ContractAddress = storage.mustGetAddress(EContracts.PoseidonT4, hre.network.name);
    const poseidonT5ContractAddress = storage.mustGetAddress(EContracts.PoseidonT5, hre.network.name);
    const poseidonT6ContractAddress = storage.mustGetAddress(EContracts.PoseidonT6, hre.network.name);

    const linkedTallyFactoryContract = await hre.ethers.getContractFactory(
      "contracts/maci/TallyFactory.sol:TallyFactory",
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

    const tallyFactoryContract = await deployment.deployContractWithLinkedLibraries({
      contractFactory: linkedTallyFactoryContract,
    });

    await storage.register({
      id: EContracts.TallyFactory,
      contract: tallyFactoryContract,
      args: [],
      network: hre.network.name,
    });
  }),
);
