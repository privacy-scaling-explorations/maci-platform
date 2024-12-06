import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

interface ISubmitBallotButtonProps {
  pollId: string;
}

export const SubmitBallotButton = ({ pollId }: ISubmitBallotButtonProps): JSX.Element => {
  const router = useRouter();
  const { onVote, isLoading, initialVoiceCredits } = useMaci();
  const { getBallot, publishBallot, sumBallot } = useBallot();

  const onVotingError = useCallback((err: string) => {
    toast.error(`Voting error: ${err}`);
  }, []);

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);
  const ableToSubmit = useMemo(
    () => sumBallot(ballot.votes) <= initialVoiceCredits,
    [sumBallot, ballot, initialVoiceCredits],
  );

  const handleSubmitBallot = useCallback(async () => {
    if (isLoading) {
      return;
    }

    const votes = ballot.votes.map(({ amount, projectId, projectIndex }) => ({
      projectId,
      voteOptionIndex: BigInt(projectIndex),
      newVoteWeight: BigInt(amount),
    }));

    if (!pollId) {
      throw new Error("The pollId is undefined.");
    }

    await onVote(votes, pollId, onVotingError, () => {
      publishBallot(pollId);
      router.push(`/rounds/${pollId}/ballot/confirmation`);
    });
  }, [ballot, router, onVote, publishBallot, onVotingError, pollId, pollId]);

  return (
    <Button variant={ableToSubmit ? "primary" : "disabled"} onClick={handleSubmitBallot}>
      {ableToSubmit && !isLoading ? "submit your ballot" : "Exceed initial voice credits"}

      {isLoading && <Spinner />}
    </Button>
  );
};
