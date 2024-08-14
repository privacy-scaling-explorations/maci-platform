import { useRound } from "~/contexts/Round";

import { RoundItem } from "./RoundItem";

/// TODO: change to InfiniteLoading after loading rounds from registry contract and make search from trpc service
export const RoundsList = (): JSX.Element => {
  const { rounds } = useRound();

  return (
    <div className="grid grid-cols-3 px-16 py-4">
      {rounds.map((round) => (
        <RoundItem key={round.roundId} round={round} />
      ))}
    </div>
  );
};
