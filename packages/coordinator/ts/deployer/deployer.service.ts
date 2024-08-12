import { Injectable, Logger } from "@nestjs/common";
import { http } from "viem"
import { createBundlerClient, ENTRYPOINT_ADDRESS_V07 } from "permissionless";

import { FileService } from "../file/file.service";
import { genPimlicoRPCUrl } from "../common/pimlico";
import { IDeployMaciArgs, IDeployPollArgs } from "./types";

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
   * Create a new instance of DeployerService
   * @param fileService 
   */
  constructor(
    private readonly fileService: FileService,
  ) {
    this.fileService = fileService;
    this.logger = new Logger(DeployerService.name);
  }

  /**
   * Deploy MACI contracts
   *
   * @param args - deploy maci arguments
   * @param options - ws hooks
   * @returns - deployed maci contract
   * @throws error if deploy is not successful
   */
  async deployMaci({
    operation,
    chainId,
    config,
  }: IDeployMaciArgs) {
    const pimlicoRPCUrl = genPimlicoRPCUrl(chainId)

    const bundlerClient = createBundlerClient({
      transport: http(pimlicoRPCUrl),
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    })

    const gas = await bundlerClient.estimateUserOperationGas({
      userOperation: operation.userOperation,
    })

    console.log("gas", gas)
    const opHash = await bundlerClient.sendUserOperation({
      userOperation: operation.userOperation,
    })

    const userOperationReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: opHash,
      timeout: 100000
    })

    const receipt = await bundlerClient.getUserOperationReceipt({
      hash: opHash
    })

    console.log(receipt)

    // need to figure out how to get the address of the deployed MACI contract
  }

  async deployPoll({
   operation,
   chainId,
    config
  }: IDeployPollArgs) {

    const pimlicoRPCUrl = genPimlicoRPCUrl(chainId)

    const bundlerClient = createBundlerClient({
      transport: http(pimlicoRPCUrl),
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    })

    const opHash = await bundlerClient.sendUserOperation({
      userOperation: operation.userOperation,
    })

    const userOperationReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: opHash,
      timeout: 100000
    })

    const receipt = await bundlerClient.getUserOperationReceipt({
      hash: opHash
    })

    console.log(receipt)

    // get the address of the deployed poll contract from the maci contract
  }
}
