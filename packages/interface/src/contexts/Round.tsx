import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from "react";

import { config } from "~/config";
import { api } from "~/utils/api";

import type { RoundContextType, RoundProviderProps } from "./types";
import type { IRoundData } from "~/utils/types";

export const RoundContext = createContext<RoundContextType | undefined>(undefined);

export const RoundProvider: React.FC<RoundProviderProps> = ({ children }: RoundProviderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const polls = api.maci.poll.useQuery(undefined, { enabled: Boolean(config.maciSubgraphUrl) });
  const rounds = api.maci.round.useQuery({ polls: polls.data ?? [] }, { enabled: Boolean(polls.data) });

  // on load we fetch the data from the poll
  useEffect(() => {
    if (polls.data) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // eslint-disable-next-line no-console
    polls.refetch().catch(console.error);
    // eslint-disable-next-line no-console
    rounds.refetch().catch(console.error);
  }, [polls, rounds]);

  const getRoundByRoundId = useCallback(
    (roundId: string): IRoundData | undefined => rounds.data?.find((round) => round.roundId === roundId),
    [rounds],
  );

  const getRoundByPollId = useCallback(
    (pollId: string): IRoundData | undefined => rounds.data?.find((round) => round.pollId === pollId),
    [rounds],
  );

  const value = useMemo(
    () => ({
      rounds: rounds.data,
      getRoundByRoundId,
      getRoundByPollId,
      isLoading,
    }),
    [rounds, getRoundByRoundId, getRoundByPollId, isLoading],
  );

  return <RoundContext.Provider value={value as RoundContextType}>{children}</RoundContext.Provider>;
};

export const useRound = (): RoundContextType => {
  const roundContext = useContext(RoundContext);

  if (!roundContext) {
    throw new Error("Should use context inside provider.");
  }

  return roundContext;
};
