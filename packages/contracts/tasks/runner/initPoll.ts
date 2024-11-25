/* eslint-disable no-console */
import { ZeroAddress } from "ethers";
import { task, types } from "hardhat/config";
import { Deployment } from "maci-contracts";

import { type MACI } from "../../typechain-types";
import { EContracts } from "../helpers/constants";

/**
 * Interface that represents init poll params
 */
interface IInitPollParams {
  /**
   * Poll id
   */
  poll: string;
}

/**
 * Command to initialize poll
 */
task("initPoll", "Initialize poll")
  .addParam("poll", "The poll id", undefined, types.string)
  .setAction(async ({ poll }: IInitPollParams, hre) => {
    const deployment = Deployment.getInstance({ contractNames: EContracts, hre });
    const { MACI__factory: MACIFactory } = await import("../../typechain-types");

    deployment.setHre(hre);
    deployment.setContractNames(EContracts);

    const deployer = await deployment.getDeployer();

    const maciContract = await deployment.getContract<MACI>({ name: EContracts.MACI, abi: MACIFactory.abi });
    const pollContracts = await maciContract.polls(poll);

    if (pollContracts.poll === ZeroAddress) {
      throw new Error(`No poll ${poll} found`);
    }

    const startBalance = await deployer.provider.getBalance(deployer);

    console.log("Start balance: ", Number(startBalance / 10n ** 12n) / 1e6);

    const tx = await maciContract.initPoll(poll);
    const receipt = await tx.wait();

    if (receipt?.status !== 1) {
      throw new Error("Poll init transaction is failed");
    }

    const endBalance = await deployer.provider.getBalance(deployer);

    console.log("End balance: ", Number(endBalance / 10n ** 12n) / 1e6);
    console.log("Operation expenses: ", Number((startBalance - endBalance) / 10n ** 12n) / 1e6);
  });
