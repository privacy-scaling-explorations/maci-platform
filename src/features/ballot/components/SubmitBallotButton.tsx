import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useProjectIdMapping } from "~/features/projects/hooks/useProjects";

export const SubmitBallotButton = (): JSX.Element => {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const { onVote, isLoading } = useMaci();
  const { ballot, publishBallot } = useBallot();
  const projectIndices = useProjectIdMapping(ballot);

  const onVotingError = useCallback(() => {
    toast.error("Voting error");
  }, []);

  const handleSubmitBallot = useCallback(async () => {
    const votes = ballot.votes.map(({ amount, projectId }) => {
      const index = projectIndices[projectId];
      if (!index) {
        throw new Error("There are some problems due to project index mapping.");
      }

      return {
        voteOptionIndex: BigInt(index),
        newVoteWeight: BigInt(amount),
      };
    });

    await onVote(votes, onVotingError, () => {
      publishBallot();
      router.push("/ballot/confirmation");
    });
  }, [ballot, router, onVote, publishBallot, onVotingError, projectIndices]);

  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <>
      <Button variant="primary" onClick={handleOpenDialog}>
        submit your ballot
      </Button>

      <Dialog
        button="primary"
        buttonAction={handleSubmitBallot}
        buttonName="submit"
        description="This is not a final submission. Once you submit your ballot, you can change it during the voting period."
        isLoading={isLoading}
        isOpen={isOpen}
        size="sm"
        title="submit your ballot"
        onOpenChange={setOpen}
      />
    </>
  );
};
