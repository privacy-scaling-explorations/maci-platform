import React, { createContext, useContext, useMemo, useCallback } from "react";

import type { RoundContextType, RoundProviderProps } from "./types";
import type { Round } from "~/features/rounds/types";

export const RoundContext = createContext<RoundContextType | undefined>(undefined);

export const RoundProvider: React.FC<RoundProviderProps> = ({ children }: RoundProviderProps) => {
  const rounds = [
    {
      roundId: "open-rpgf-1",
      description: "This is the description of this round, please add your own description.",
      startsAt: 1723477832000,
      registrationEndsAt: 1723487832000,
      votingEndsAt: 1724009826000,
      tallyURL: "https://upblxu2duoxmkobt.public.blob.vercel-storage.com/tally.json",
    },
  ];

  const getRound = useCallback(
    (roundId: string): Round | undefined => rounds.find((round) => round.roundId === roundId),
    [rounds],
  );

  const value = useMemo(
    () => ({
      rounds,
      getRound,
    }),
    [rounds, getRound],
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
