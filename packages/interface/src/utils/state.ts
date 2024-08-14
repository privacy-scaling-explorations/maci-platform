import { isAfter } from "date-fns";

import { useRound } from "~/contexts/Round";

import { ERoundState } from "./types";

export const useRoundState = (roundId: string): ERoundState => {
  const now = new Date();
  const { getRound } = useRound();
  const round = getRound(roundId);

  if (!round) {
    return ERoundState.DEFAULT;
  }

  if (round.registrationEndsAt && isAfter(round.registrationEndsAt, now)) {
    return ERoundState.APPLICATION;
  }

  if (round.votingEndsAt && isAfter(round.votingEndsAt, now)) {
    return ERoundState.VOTING;
  }

  if (round.votingEndsAt && isAfter(now, round.votingEndsAt) && !round.tallyURL) {
    return ERoundState.TALLYING;
  }

  if (round.tallyURL) {
    return ERoundState.RESULTS;
  }

  return ERoundState.DEFAULT;
};
