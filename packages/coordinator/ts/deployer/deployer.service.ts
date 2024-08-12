import { Injectable, Logger } from "@nestjs/common";
import { CryptoService } from "../crypto/crypto.service";
import { FileService } from "../file/file.service";
import { Deployment } from "maci-contracts";
import hre from "hardhat";
import { http } from "viem"
import { createPimlicoPaymasterClient } from "permissionless/clients/pimlico"
import type { PimlicoPaymasterClient } from "permissionless/clients/pimlico";
import type { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types/entrypoint";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless/utils";

/**
 * IDeployMACIArgs represents the arguments for deploying MACI
 */
export interface IDeployMaciArgs {
    signature: string 
    config: IDeployMaciConfig
}

/**
 * IDeployPollArgs represents the arguments for deploying a poll
 */
export interface IDeployPollArgs {
    signature: string 
    config: IDeployPollConfig
}

/**
 * DeployMaciConfig is the configuration for deploying MACI
 */
export interface IDeployMaciConfig {
	ConstantInitialVoiceCreditProxy?: {
		deploy: boolean
		amount: number
	}
	FreeForAllGatekeeper?: {
		deploy: boolean
	}
	EASGatekeeper?: {
		deploy: boolean
		easAddress: string
		schema: string
		attester: string
	}
	ZupassGatekeeper?: {
		deploy: boolean
		signer1: string
		signer2: string
		eventId: string
		zupassVerifier: string
	},
    HatsGatekeeper?: {
        deploy: boolean
        hatsProtocolAddress: string
        criteionHats: string[]
    },
    SemaphoreGatekeeper?: {
        deploy: boolean
        semaphoreContract: string 
        groupId: number 
    },
    GitcoinPassportGatekeeper?: {
        deploy: boolean
        decoderAddress: string 
        passingScore: number 
    },
	MACI: {
		stateTreeDepth: number
		gatekeeper: string
	}
	VkRegistry: {
		stateTreeDepth: number
		intStateTreeDepth: number
		messageTreeDepth: number
		voteOptionTreeDepth: number
		messageBatchDepth: number
	}
}

/**
 * DeployPollConfig is the configuration for deploying a poll
 */
export interface IDeployPollConfig {
    pollDuration: number
    coordinatorPubkey: string
    useQuadraticVoting: boolean
}

/**
 * SubgraphService is responsible for deploying subgraph.
 */
@Injectable()
export class DeployerService {
  /**
   * Deployment helper
   */
  private readonly deployment: Deployment;

  /**
   * Logger
   */
  private readonly logger = new Logger(DeployerService.name);

  private paymasterClient: PimlicoPaymasterClient<ENTRYPOINT_ADDRESS_V07_TYPE>;

  /**
   * Create a new instance of DeployerService
   * @param cryptoService 
   * @param fileService 
   */
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly fileService: FileService,
  ) {
    this.deployment = Deployment.getInstance(hre);
    this.deployment.setHre(hre);
    this.fileService = fileService;
    this.logger = new Logger(DeployerService.name);

    this.paymasterClient = createPimlicoPaymasterClient({
        transport: http(process.env.PIMLICO_RPC!),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
    })
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
    signature,
    config,
  }: IDeployMaciArgs) {

    const sponsorResult = await this.paymasterClient.sponsorUserOperation({
        userOperation: {
            sender: process.env.COORDINATOR_ADDRESSES! as `0x${string}`,
            nonce: 1n,
            calldata: "0x"
        },
    })

  }

  async deployPoll({
  }) {}
}
