import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";

import type { RoundContextType, RoundProviderProps } from "./types";
import type { Round } from "~/features/rounds/types";

export const RoundContext = createContext<RoundContextType | undefined>(undefined);

export const RoundProvider: React.FC<RoundProviderProps> = ({ children }: RoundProviderProps) => {
  const [rounds, setRounds] = useState<Round[] | undefined>(undefined);

  const [isContractsDeployed, setContractsDeployed] = useState<boolean>(false);

  const getRound = useCallback(
    (roundId: string): Round | undefined => (rounds ? rounds.find((round) => round.roundId === roundId) : undefined),
    [rounds],
  );

  const addRound = useCallback(
    (round: Round): void => {
      if (!rounds) {
        setRounds([round]);
      } else {
        setRounds([...rounds, round]);
      }
    },
    [rounds, setRounds],
  );

  const deployContracts = useCallback(() => {
    setContractsDeployed(true);
  }, [setContractsDeployed]);

  useEffect(() => {
    const storageData = localStorage.getItem("rounds");

    if (storageData) {
      const storedRounds = JSON.parse(storageData) as Round;
      setRounds([storedRounds]);
    }
  }, [setRounds]);

  useEffect(() => {
    if (rounds) {
      localStorage.setItem("rounds", JSON.stringify(rounds));
    }
  }, [rounds]);

  const value = useMemo(
    () => ({
      isContractsDeployed,
      rounds,
      getRound,
      addRound,
      deployContracts,
    }),
    [rounds, getRound, addRound],
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
