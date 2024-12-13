import { useRound } from "~/contexts/Round";

import { RoundItem } from "./RoundItem";

/// TODO: change to InfiniteLoading after loading rounds from registry contract and make search from trpc service
export const RoundsList = (): JSX.Element => {
  const { rounds } = useRound();

  return (
    <div className="grid grid-cols-1 gap-4 px-16 py-4 md:grid-cols-2 lg:grid-cols-3">
      {rounds?.map((round) => <RoundItem key={round.pollId} round={round} />)}
    </div>
  );
};
