import { useRouter } from "next/router";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

export const SubmitBallotButton = (): JSX.Element => {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const { onVote, isLoading, initialVoiceCredits } = useMaci();
  const { ballot, publishBallot, sumBallot } = useBallot();

  const ableToSubmit = useMemo(
    () => sumBallot(ballot.votes) <= initialVoiceCredits,
    [sumBallot, ballot, initialVoiceCredits],
  );

  const onVotingError = useCallback(() => {
    toast.error("Voting error");
  }, []);

  const handleSubmitBallot = useCallback(async () => {
    const votes = ballot.votes.map(({ amount, projectId, projectIndex }) => ({
      projectId,
      voteOptionIndex: BigInt(projectIndex),
      newVoteWeight: BigInt(amount),
    }));

    await onVote(votes, onVotingError, () => {
      publishBallot();
      router.push("/ballot/confirmation");
    });
  }, [ballot, router, onVote, publishBallot, onVotingError]);

  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <div>
      <Button variant={ableToSubmit ? "primary" : "disabled"} onClick={handleOpenDialog}>
        {ableToSubmit ? "submit your ballot" : "Exceed initial voice credits"}
      </Button>

      <Dialog
        button="primary"
        buttonAction={handleSubmitBallot}
        buttonName="submit"
        description="This is not the final submission. Once you submit your ballot, you can change it during the voting period."
        isLoading={isLoading}
        isOpen={ableToSubmit && isOpen}
        size="sm"
        title="submit your ballot"
        onOpenChange={setOpen}
      />

      <Dialog
        description="You cannot submit this ballot, since the sum of votes exceeds the initial voice credits. Please edit your ballot."
        isLoading={isLoading}
        isOpen={!ableToSubmit && isOpen}
        size="sm"
        title="exceed initial voice credits"
        onOpenChange={setOpen}
      />
    </div>
  );
};
