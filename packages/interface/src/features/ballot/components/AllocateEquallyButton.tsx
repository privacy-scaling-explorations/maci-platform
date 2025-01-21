import { useCallback, useMemo } from "react";

import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

interface IAllocateEquallyButtonProps {
  pollId: string;
}

export const AllocateEquallyButton = ({ pollId }: IAllocateEquallyButtonProps): JSX.Element => {
  const { isLoading, initialVoiceCredits } = useMaci();
  const { addToBallot, getBallot } = useBallot();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const handleAllocateBallot = useCallback(() => {
    if (isLoading) {
      return;
    }
    const votesCount = ballot.votes.length;
    const equalShare = Math.floor(initialVoiceCredits / votesCount);

    ballot.votes = ballot.votes.map((vote) => ({
      ...vote,
      amount: equalShare,
    }));

    addToBallot(ballot.votes, pollId);
  }, [ballot, pollId, isLoading]);

  return (
    <Button className="mt-6" variant="inverted" onClick={handleAllocateBallot}>
      {!isLoading && "Allocate Votes Equally"}

      {isLoading && <Spinner className="h-4 w-4" />}
    </Button>
  );
};
