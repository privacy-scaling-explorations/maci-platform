import React, { createContext, useContext, useMemo, useCallback, useEffect, useState } from "react";

import { config } from "~/config";
import { api } from "~/utils/api";

import type { RoundContextType, RoundProviderProps, IRoundData } from "./types";
import type { IRoundMetadata } from "~/utils/types";

export const RoundContext = createContext<RoundContextType | undefined>(undefined);

export const RoundProvider: React.FC<RoundProviderProps> = ({ children }: RoundProviderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rounds, setRounds] = useState<IRoundData[]>([]);

  const polls = api.maci.poll.useQuery(undefined, { enabled: Boolean(config.maciSubgraphUrl) });

  // on load we fetch the data from the poll
  useEffect(() => {
    if (polls.data) {
      return;
    }

    // eslint-disable-next-line no-console
    polls.refetch().catch(console.error);
  }, [polls]);

  useEffect(() => {
    setIsLoading(true);

    if (config.maciSubgraphUrl) {
      const pollsList = polls.data ? polls.data : undefined;

      if (!pollsList || pollsList.length === 0) {
        setIsLoading(false);
        return;
      }

      const roundsTemp: IRoundData[] = [];

      pollsList.forEach((poll) => {
        fetch(poll.metadataUrl)
          .then((res) => res.json())
          .then((res) => {
            const r = res as IRoundMetadata;
            const round = {
              isMerged: poll.isMerged,
              pollId: poll.id,
              duration: poll.duration,
              deployTime: poll.deployTime,
              numSignups: poll.numSignups,
              pollAddress: poll.address,
              mode: poll.mode,
              registryAddress: poll.registryAddress,
              roundId: r.roundId,
              description: r.description,
              startsAt: r.startsAt,
              registrationEndsAt: r.registrationEndsAt,
              votingStartsAt: r.votingStartsAt,
              votingEndsAt: r.votingEndsAt,
              tallyFile: r.tallyFile,
            } as IRoundData;

            roundsTemp.push(round);
          })
          // eslint-disable-next-line no-console
          .catch(() => console.error);
      });

      setRounds(roundsTemp);
      setIsLoading(false);
    } else {
      throw new Error("The subgraph url should be provided.");
    }
  }, [polls.data]);

  const getRoundByRoundId = useCallback(
    (roundId: string): IRoundData | undefined => rounds.find((round) => round.roundId === roundId),
    [rounds],
  );

  const getRoundByPollId = useCallback(
    (pollId: string): IRoundData | undefined => rounds.find((round) => round.pollId === pollId),
    [rounds],
  );

  const value = useMemo(
    () => ({
      rounds,
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
