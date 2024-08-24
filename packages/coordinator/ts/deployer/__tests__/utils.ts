import { EGatekeepers, EInitialVoiceCreditProxies } from "maci-contracts";
import { Keypair } from "maci-domainobjs";

import { IDeployMaciConfig, IDeployPollConfig } from "../types";

/**
 * MACI deployment configuration for testing
 */
export const testMaciDeploymentConfig: IDeployMaciConfig = {
  gatekeeper: {
    type: EGatekeepers.FreeForAll,
  },
  initialVoiceCreditsProxy: {
    type: EInitialVoiceCreditProxies.Constant,
    args: {
      amount: "100",
    },
  },
  MACI: {
    gatekeeper: EGatekeepers.FreeForAll,
    stateTreeDepth: 10,
  },
  VkRegistry: {
    args: {
      stateTreeDepth: 10n,
      messageTreeDepth: 2n,
      voteOptionTreeDepth: 2n,
      messageBatchDepth: 1n,
      intStateTreeDepth: 1n,
    },
  },
};

/**
 * Poll deployment configuration for testing
 */
export const testPollDeploymentConfig: IDeployPollConfig = {
  pollDuration: 100,
  useQuadraticVoting: false,
  coordinatorPubkey: new Keypair().pubKey.serialize(),
  intStateTreeDepth: 1,
  messageTreeDepth: 2,
  voteOptionTreeDepth: 2,
  messageTreeSubDepth: 1,
};
