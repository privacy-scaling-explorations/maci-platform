import { isAfter } from "date-fns";

import { useRound } from "~/contexts/Round";

import { ERoundState } from "./types";

export const useRoundState = (pollId: string): ERoundState => {
  const now = new Date();
  const { getRoundByPollId } = useRound();
  const round = getRoundByPollId(pollId);

  if (!round) {
    return ERoundState.DEFAULT;
  }

  if (isAfter(round.registrationEndsAt, now)) {
    return ERoundState.APPLICATION;
  }

  if (isAfter(round.votingEndsAt, now)) {
    return ERoundState.VOTING;
  }

  // TODO commented out for testing results
  // if (isAfter(now, round.votingEndsAt)) {
  //   return ERoundState.TALLYING;
  // }

  // TODO: how to collect tally.json url
  if (isAfter(now, round.votingEndsAt)) {
    return ERoundState.RESULTS;
  }

  return ERoundState.DEFAULT;
};
