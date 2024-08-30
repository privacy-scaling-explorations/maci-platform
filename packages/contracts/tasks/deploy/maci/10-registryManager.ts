import { ContractStorage, Deployment, type IDeployParams } from "maci-contracts";

import type { MACI } from "../../../typechain-types";

import { EDeploySteps, EContracts } from "../../helpers/constants";

const deployment = Deployment.getInstance();
const storage = ContractStorage.getInstance();

/**
 * Deploy step registration and task itself
 */
deployment.deployTask(EDeploySteps.RegistryManager, "Deploy registry manager").then((task) =>
  task.setAction(async ({ incremental }: IDeployParams, hre) => {
    deployment.setHre(hre);
    const deployer = await deployment.getDeployer();

    const registryManagerType =
      deployment.getDeployConfigField<keyof typeof EContracts | null>(EContracts.MACI, "registryManager") ||
      EContracts.EASRegistryManager;

    const registryManagerContractAddress = storage.getAddress(registryManagerType, hre.network.name);

    if (incremental && registryManagerContractAddress) {
      return;
    }

    const easAddress = deployment.getDeployConfigField<keyof typeof EContracts | null, keyof typeof EContracts>(
      registryManagerType,
      "easAddress",
    );

    const args = easAddress ? [easAddress] : [];

    const registryManagerContract = await deployment.deployContract(
      {
        name: registryManagerType,
        signer: deployer,
      },
      ...args,
    );

    const maciContractAddress = storage.mustGetAddress(EContracts.MACI, hre.network.name);

    const maciContract = await deployment.getContract<MACI>({
      name: "contracts/maci/MACI.sol:MACI" as Parameters<typeof deployment.getContract>[0]["name"],
      address: maciContractAddress,
    });

    const contractAddress = await registryManagerContract.getAddress();
    await maciContract.setRegistryManager(contractAddress).then((tx) => tx.wait());

    await storage.register({
      id: registryManagerType,
      contract: registryManagerContract,
      args,
      network: hre.network.name,
    });
  }),
);
