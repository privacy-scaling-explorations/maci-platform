import { type TallyData, type GatekeeperTrait } from "maci-cli/sdk";
import { type ReactNode } from "react";

import { IPollData } from "~/utils/fetchPoll";

import type { Ballot, Vote } from "~/features/ballot/types";

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
  removeFromBallot: (projectId: string) => void;
  deleteBallot: () => void;
  ballotContains: (id: string) => Vote | undefined;
  sumBallot: (votes?: Vote[]) => number;
  publishBallot: () => void;
}

export interface BallotProviderProps {
  children: ReactNode;
}
