import {
  PollFactory__factory as PollFactoryFactory,
  MessageProcessorFactory__factory as MessageProcessorFactoryFactory,
  TallyFactory__factory as TallyFactoryFactory,
  MACI__factory as MACIFactory,
  ConstantInitialVoiceCreditProxy__factory as ConstantInitialVoiceCreditProxyFactory,
  EASGatekeeper__factory as EASGatekeeperFactory,
  Verifier__factory as VerifierFactory,
  VkRegistry__factory as VkRegistryFactory,
} from "maci-cli/sdk";
import type { IAbi } from "./types";
import { config } from "~/config";

/**
 * Constant variables
 */
export const STATE_TREE_SUB_DEPTH = 2;
export const STATE_TREE_DEPTH = 10;
export const INT_STATE_TREE_DEPTH = 1;
export const MESSAGE_TREE_DEPTH = 2;
export const MESSAGE_BATCH_DEPTH = 1;
export const VOTE_OPTION_TREE_DEPTH = 2;

export const POSEIDON_T3_ADDRESS = "0x8d88DD98AD662Ff57d3971a686f5971fd3b01a59";
export const POSEIDON_T4_ADDRESS = "0x6f768e8353668be5facee726a6818742f13f3612";
export const POSEIDON_T5_ADDRESS = "0x04b40517b6e00152ccad3d3a5cb08f3846ffa4bd";
export const POSEIDON_T6_ADDRESS = "0x1df2d55e8daff9b253c338cd57c0c54261f4c2a2";

/**
 * Constant mapping of ABIs
 */
export const ABI: IAbi = {
  ConstantInitialVoiceCreditProxy: ConstantInitialVoiceCreditProxyFactory.abi,
  EASGatekeeper: EASGatekeeperFactory.abi,
  Verifier: VerifierFactory.abi,
  PollFactory: PollFactoryFactory.abi,
  MessageProcessorFactory: MessageProcessorFactoryFactory.abi,
  TallyFactory: TallyFactoryFactory.abi,
  MACI: MACIFactory.abi,
  VkRegistry: VkRegistryFactory.abi,
};

/**
 *
 */
export const PUBKEY_URL = `${config.coordinatorService}/v1/proof/publicKey`;
export const GENPROOF_URL = `${config.coordinatorService}/v1/proof/generate`;
