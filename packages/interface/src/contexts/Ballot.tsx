import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";

import { config } from "~/config";

import type { BallotContextType, BallotProviderProps } from "./types";
import type { Ballot, Vote } from "~/features/ballot/types";

export const BallotContext = createContext<BallotContextType | undefined>(undefined);

const defaultBallot = { votes: [], published: false, edited: false };

export const BallotProvider: React.FC<BallotProviderProps> = ({ children }: BallotProviderProps) => {
  const [ballot, setBallot] = useState<Ballot>(defaultBallot);
  const [isLoading, setLoading] = useState<boolean>(true);

  const { isDisconnected } = useAccount();

  // when summing the ballot we take the individual vote and square it
  // if the mode is quadratic voting, otherwise we just add the amount
  const sumBallot = useCallback(
    (votes?: Vote[]) =>
      (votes ?? []).reduce((sum, x) => {
        const amount = !Number.isNaN(Number(x.amount)) ? Number(x.amount) : 0;
        return sum + (config.pollMode === "qv" ? amount ** 2 : amount);
      }, 0),
    [],
  );

  const ballotContains = useCallback((id: string) => ballot.votes.find((v) => v.projectId === id), [ballot]);

  const toObject = useCallback(
    (key: string, arr: object[] = []) => arr.reduce((acc, x) => ({ ...acc, [x[key as keyof typeof acc]]: x }), {}),
    [],
  );

  const mergeBallot = useCallback(
    (addedVotes: Vote[], pollId: string) => ({
      ...ballot,
      pollId,
      edited: true,
      votes: Object.values<Vote>({
        ...toObject("projectId", ballot.votes),
        ...toObject("projectId", addedVotes),
      }),
    }),
    [ballot, toObject],
  );

  // save the ballot to localstorage
  const saveBallot = useCallback(() => {
    localStorage.setItem("ballot", JSON.stringify(ballot));
  }, [ballot]);

  // remove certain project from the ballot
  const removeFromBallot = useCallback(
    (projectId: string) => {
      const votes = ballot.votes.filter((v) => v.projectId !== projectId);

      setBallot({ ...ballot, votes });
    },
    [ballot, setBallot],
  );

  // add to the ballot
  const addToBallot = useCallback(
    (votes: Vote[], pollId?: string) => {
      if (!pollId) {
        throw new Error("PollId is not provided.");
      }

      setBallot(mergeBallot(votes, pollId));
    },
    [setBallot, mergeBallot],
  );

  // remove the ballot from localstorage
  const deleteBallot = useCallback(() => {
    setBallot(defaultBallot);
    localStorage.removeItem("ballot");
  }, [setBallot]);

  // set published to true
  const publishBallot = useCallback(() => {
    setBallot({ ...ballot, published: true, edited: false });
  }, [ballot, setBallot]);

  /// Read existing ballot in localStorage
  useEffect(() => {
    const savedBallot = JSON.parse(
      localStorage.getItem("ballot") ?? JSON.stringify(defaultBallot),
    ) as typeof defaultBallot;

    setBallot(savedBallot);
    setLoading(false);
  }, [setBallot]);

  /// store ballot to localStorage once it changes
  useEffect(() => {
    if (ballot !== defaultBallot) {
      saveBallot();
    }
  }, [ballot, ballot.votes, ballot.published, saveBallot]);

  useEffect(() => {
    if (isDisconnected) {
      deleteBallot();
    }
  }, [isDisconnected, deleteBallot]);

  const value = useMemo(
    () => ({
      ballot,
      isLoading,
      addToBallot,
      removeFromBallot,
      deleteBallot,
      ballotContains,
      sumBallot,
      publishBallot,
    }),
    [ballot, isLoading, addToBallot, removeFromBallot, deleteBallot, ballotContains, sumBallot, publishBallot],
  );

  return <BallotContext.Provider value={value as BallotContextType}>{children}</BallotContext.Provider>;
};

export const useBallot = (): BallotContextType => {
  const ballotContext = useContext(BallotContext);

  if (!ballotContext) {
    throw new Error("Should use context inside provider.");
  }

  return ballotContext;
};
