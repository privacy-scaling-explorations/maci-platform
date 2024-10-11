import { isAfter } from "date-fns";
import { ZeroAddress } from "ethers";

import { useRound } from "~/contexts/Round";

import { ERoundState } from "./types";

interface IUseRoundState {
  pollId: string;
}

export const useRoundState = ({ pollId }: IUseRoundState): ERoundState => {
  const now = new Date();
  const { getRoundByPollId, isRoundTallied } = useRound();
  const round = getRoundByPollId(pollId);
  const isTallied = isRoundTallied(round?.tallyAddress ?? ZeroAddress);

  if (!round) {
    return ERoundState.DEFAULT;
  }

  if (isAfter(round.registrationEndsAt, now)) {
    return ERoundState.APPLICATION;
  }

  if (isAfter(round.votingEndsAt, now)) {
    return ERoundState.VOTING;
  }

  if (isAfter(now, round.votingEndsAt) && isTallied) {
    return ERoundState.RESULTS;
  }

  if (isAfter(now, round.votingEndsAt) && !isTallied) {
    return ERoundState.TALLYING;
  }

  return ERoundState.DEFAULT;
};
