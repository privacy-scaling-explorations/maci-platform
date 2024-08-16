import { TreeDepths, STATE_TREE_ARITY, MESSAGE_TREE_ARITY } from "maci-core";

export const duration = 2_000;

export const STATE_TREE_DEPTH = 10;
export const MESSAGE_TREE_DEPTH = 2;
export const MESSAGE_TREE_SUBDEPTH = 1;
export const messageBatchSize = MESSAGE_TREE_ARITY ** MESSAGE_TREE_SUBDEPTH;
export const NOTHING_UP_MY_SLEEVE = 8370432830353022751713833565135785980866757267633941821328460903436894336785n;

export const initialVoiceCreditBalance = 100;

export const treeDepths: TreeDepths = {
  intStateTreeDepth: 1,
  messageTreeDepth: MESSAGE_TREE_DEPTH,
  messageTreeSubDepth: MESSAGE_TREE_SUBDEPTH,
  voteOptionTreeDepth: 2,
};

export const tallyBatchSize = STATE_TREE_ARITY ** treeDepths.intStateTreeDepth;
