import { type StandardMerkleTreeData } from "@openzeppelin/merkle-tree/dist/standard";
import { type GatekeeperTrait } from "maci-cli/sdk";
import { type ReactNode } from "react";

import type { PCD } from "@pcd/pcd-types";
import type { Ballot, Vote } from "~/features/ballot/types";
import type { IRoundData } from "~/utils/types";

export interface IVoteArgs {
  voteOptionIndex: bigint;
  newVoteWeight: bigint;
}

export interface MaciContextType {
  isLoading: boolean;
  isEligibleToVote: boolean;
  initialVoiceCredits: number;
  stateIndex?: string;
  isRegistered?: boolean;
  error?: string;
  maciPubKey?: string;
  gatekeeperTrait?: GatekeeperTrait;
  storeZupassProof: (args: PCD) => Promise<void>;
  treeData?: StandardMerkleTreeData<string[]>;
  onSignup: (onError: () => void) => Promise<void>;
  onVote: (
    args: IVoteArgs[],
    pollId: string,
    onError: (err: string) => void | Promise<void>,
    onSuccess: () => void | Promise<void>,
  ) => Promise<void>;
}

export interface MaciProviderProps {
  children: ReactNode;
}

export interface BallotContextType {
  ballots: Ballot[];
  isLoading: boolean;
  addToBallot: (votes: Vote[], pollId: string) => void;
  removeFromBallot: (index: number, pollId: string) => void;
  deleteBallot: (pollId: string) => void;
  ballotContains: (index: number, pollId: string) => Vote | undefined;
  sumBallot: (votes?: Vote[]) => number;
  publishBallot: (pollId: string) => void;
  getBallot: (pollId: string) => Ballot;
}

export interface BallotProviderProps {
  children: ReactNode;
}

export interface RoundContextType {
  rounds: IRoundData[] | undefined;
  getRoundByRoundId: (roundId: string) => IRoundData | undefined;
  getRoundByPollId: (pollId: string) => IRoundData | undefined;
  isLoading: boolean;
  isRoundTallied: (tallyAddress: string) => boolean;
}

export interface RoundProviderProps {
  children: ReactNode;
}
