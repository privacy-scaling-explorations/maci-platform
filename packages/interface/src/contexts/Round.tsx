import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from "react";

import { config } from "~/config";
import { api } from "~/utils/api";

import type { RoundContextType, RoundProviderProps } from "./types";
import type { IRoundData, Tally } from "~/utils/types";

export const RoundContext = createContext<RoundContextType | undefined>(undefined);

export const RoundProvider: React.FC<RoundProviderProps> = ({ children }: RoundProviderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const polls = api.maci.polls.useQuery(undefined, { enabled: Boolean(config.maciSubgraphUrl) });
  const rounds = api.maci.rounds.useQuery({ polls: polls.data ?? [] }, { enabled: Boolean(polls.data) });
  const tallies = api.maci.tallies.useQuery(undefined, { enabled: Boolean(config.maciSubgraphUrl) });

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

  useEffect(() => {
    if (tallies.data) {
      return;
    }

    // eslint-disable-next-line no-console
    tallies.refetch().catch(console.error);
  }, [tallies]);

  const getRoundByRoundId = useCallback(
    (roundId: string): IRoundData | undefined => rounds.data?.find((round) => round.roundId === roundId),
    [rounds],
  );

  const getRoundByPollId = useCallback(
    (pollId: string): IRoundData | undefined => rounds.data?.find((round) => round.pollId === pollId),
    [rounds],
  );

  const isRoundTallied = useCallback(
    (tallyAddress: string): boolean => {
      const t = tallies.data?.find((tally: Tally) => tally.id === tallyAddress);
      return !!t && t.results.length > 0;
    },
    [tallies],
  );

  const value = useMemo(
    () => ({
      rounds: rounds.data,
      getRoundByRoundId,
      getRoundByPollId,
      isLoading,
      isRoundTallied,
    }),
    [rounds, getRoundByRoundId, getRoundByPollId, isLoading, isRoundTallied],
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
