import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";

import type { BallotContextType, BallotProviderProps } from "./types";
import type { Ballot, Vote } from "~/features/ballot/types";

import { useRound } from "./Round";

export const BallotContext = createContext<BallotContextType | undefined>(undefined);

// the default ballot is an empty ballot
export const defaultBallot = { votes: [], published: false, edited: false, pollId: "" };

export const BallotProvider: React.FC<BallotProviderProps> = ({ children }: BallotProviderProps) => {
  const [ballots, setBallots] = useState<Ballot[]>([defaultBallot]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const { rounds } = useRound();

  const { isDisconnected } = useAccount();

  // when summing the ballot we take the individual vote and square it
  // if the mode is quadratic voting, otherwise we just add the amount
  const sumBallot = useCallback(
    (votes?: Vote[]) =>
      (votes ?? []).reduce((sum, x) => {
        const amount = !Number.isNaN(Number(x.amount)) ? Number(x.amount) : 0;
        return sum + (rounds && rounds.length > 0 && rounds[0]?.mode.toString() === "0" ? amount ** 2 : amount);
      }, 0),
    [rounds],
  );

  // check if the ballot contains a specific project based on its index
  const ballotContains = useCallback(
    (index: number, pollId: string) =>
      ballots.find((b) => b.pollId === pollId)?.votes.find((v) => v.projectIndex === index),
    [ballots],
  );

  // convert the input to an obkect
  const toObject = useCallback(
    (key: string, arr: object[] = []) => arr.reduce((acc, x) => ({ ...acc, [x[key as keyof typeof acc]]: x }), {}),
    [],
  );

  const mergeBallot = useCallback(
    (addedVotes: Vote[], pollId: string) => {
      const existingBallot = ballots.find((b) => b.pollId === pollId) || { ...defaultBallot, pollId };
      return {
        ...existingBallot,
        edited: true,
        votes: Object.values<Vote>({
          ...toObject("projectId", existingBallot.votes),
          ...toObject("projectId", addedVotes),
        }),
      };
    },
    [ballots, toObject],
  );

  // save the ballot to localstorage
  const saveBallots = useCallback(() => {
    localStorage.setItem("ballots", JSON.stringify(ballots));
  }, [ballots]);

  // remove certain project from the ballot
  const removeFromBallot = useCallback(
    (projectIndex: number, pollId: string) => {
      setBallots((prevBallots) =>
        prevBallots.map((ballot) =>
          ballot.pollId === pollId
            ? { ...ballot, votes: ballot.votes.filter((v) => v.projectIndex !== projectIndex) }
            : ballot,
        ),
      );
    },
    [setBallots],
  );

  // add to the ballot
  const addToBallot = useCallback(
    (votes: Vote[], pollId: string) => {
      setBallots((prevBallots) => {
        const updatedBallot = mergeBallot(votes, pollId);
        const index = prevBallots.findIndex((b) => b.pollId === pollId);
        if (index !== -1) {
          return prevBallots.map((b, i) => (i === index ? updatedBallot : b));
        }
        return [...prevBallots, updatedBallot];
      });
    },
    [setBallots, mergeBallot],
  );

  // remove the ballots from localstorage
  const deleteBallots = useCallback(() => {
    setBallots([defaultBallot]);
    localStorage.removeItem("ballots");
  }, [setBallots]);

  // remove a single ballot
  const deleteBallot = useCallback(
    (pollId: string) => {
      setBallots((prevBallots) => prevBallots.filter((b) => b.pollId !== pollId));
      saveBallots();
    },
    [setBallots],
  );

  // set published to true for a specific ballot
  const publishBallot = useCallback(
    (pollId: string) => {
      setBallots((prevBallots) =>
        prevBallots.map((ballot) =>
          ballot.pollId === pollId ? { ...ballot, published: true, edited: false } : ballot,
        ),
      );
    },
    [setBallots],
  );

  // Read existing ballot in localStorage
  useEffect(() => {
    const savedBallot = JSON.parse(localStorage.getItem("ballots") ?? JSON.stringify([defaultBallot])) as Ballot[];

    setBallots(savedBallot);
    setLoading(false);
  }, [setBallots]);

  /**
   * Get a ballot by its pollId
   */
  const getBallot = useCallback(
    (pollId: string) => ballots.find((ballot) => ballot.pollId === pollId) || { ...defaultBallot, pollId },
    [ballots],
  );

  // store ballots to localStorage once they change
  useEffect(() => {
    if (ballots.some((ballot) => ballot !== defaultBallot)) {
      saveBallots();
    }
  }, [ballots, saveBallots]);

  useEffect(() => {
    if (isDisconnected) {
      deleteBallots();
    }
  }, [isDisconnected, deleteBallot]);

  const value = useMemo(
    () => ({
      ballots,
      isLoading,
      addToBallot,
      removeFromBallot,
      deleteBallot,
      ballotContains,
      sumBallot,
      publishBallot,
      getBallot,
    }),
    [ballots, isLoading, addToBallot, removeFromBallot, deleteBallot, ballotContains, sumBallot, publishBallot],
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
