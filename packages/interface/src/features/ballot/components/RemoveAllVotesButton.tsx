import { useCallback, useMemo } from "react";

import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

interface IRemoveAllVotesButtonProps {
  pollId: string;
}

export const RemoveAllVotesButton = ({ pollId }: IRemoveAllVotesButtonProps): JSX.Element => {
  const { isLoading } = useMaci();
  const { addToBallot, getBallot } = useBallot();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const handleAllocateBallot = useCallback(() => {
    if (isLoading) {
      return;
    }

    ballot.votes = ballot.votes.map((vote) => ({
      ...vote,
      amount: 0,
    }));

    addToBallot(ballot.votes, pollId);
  }, [ballot, pollId, isLoading]);

  return (
    <Button className="mt-2 text-sm underline underline-offset-2" variant="" onClick={handleAllocateBallot}>
      {!isLoading && "Remove All Votes"}

      {isLoading && <Spinner className="h-4 w-4" />}
    </Button>
  );
};
