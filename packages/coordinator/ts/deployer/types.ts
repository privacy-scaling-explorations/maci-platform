import { SendUserOperationParameters } from "permissionless/actions/bundler/sendUserOperation"
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/_types/types"

/**
 * IDeployMACIArgs represents the arguments for deploying MACI
 */
export interface IDeployMaciArgs {
    operation: SendUserOperationParameters<ENTRYPOINT_ADDRESS_V07_TYPE>
    chainId: string 
    config: IDeployMaciConfig
}

/**
 * IDeployPollArgs represents the arguments for deploying a poll
 */
export interface IDeployPollArgs {
  operation: SendUserOperationParameters<ENTRYPOINT_ADDRESS_V07_TYPE>
  chainId: string 
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
