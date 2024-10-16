import { type StandardMerkleTreeData } from "@openzeppelin/merkle-tree/dist/standard";
import { type TallyData, type GatekeeperTrait } from "maci-cli/sdk";
import { type ReactNode } from "react";

import type { PCD } from "@pcd/pcd-types";
import type { Ballot, Vote } from "~/features/ballot/types";
import type { IPollData } from "~/utils/types";

export interface IVoteArgs {
  voteOptionIndex: bigint;
  newVoteWeight: bigint;
}

export interface MaciContextType {
  isLoading: boolean;
  isEligibleToVote: boolean;
  initialVoiceCredits: number;
  votingEndsAt: Date;
  stateIndex?: string;
  isRegistered?: boolean;
  pollId?: string;
  error?: string;
  pollData?: IPollData;
  tallyData?: TallyData;
  maciPubKey?: string;
  gatekeeperTrait?: GatekeeperTrait;
  storeZupassProof: (args: PCD) => Promise<void>;
  treeData?: StandardMerkleTreeData<string[]>;
  onSignup: (onError: () => void) => Promise<void>;
  onVote: (
    args: IVoteArgs[],
    onError: () => void | Promise<void>,
    onSuccess: () => void | Promise<void>,
  ) => Promise<void>;
}

export interface MaciProviderProps {
  children: ReactNode;
}

export interface BallotContextType {
  ballot: Ballot;
  isLoading: boolean;
  addToBallot: (votes: Vote[], pollId?: string) => void;
  removeFromBallot: (projectIndex: number) => void;
  deleteBallot: () => void;
  ballotContains: (projectIndex: number) => Vote | undefined;
  sumBallot: (votes?: Vote[]) => number;
  publishBallot: () => void;
}

export interface BallotProviderProps {
  children: ReactNode;
}
