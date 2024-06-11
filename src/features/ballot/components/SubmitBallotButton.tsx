import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { useProjectIdMapping } from "~/features/projects/hooks/useProjects";
import { useMaci } from "~/contexts/Maci";
import { useBallot } from "~/contexts/Ballot";
import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";

export const SubmitBallotButton = () => {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const { onVote, isLoading } = useMaci();
  const { ballot, publishBallot } = useBallot();
  const projectIndices = useProjectIdMapping(ballot);

  const handleSubmitBallot = useCallback(async () => {
    const votes =
      ballot?.votes.map(({ amount, projectId }) => ({
        voteOptionIndex: BigInt(projectIndices[projectId]),
        newVoteWeight: BigInt(amount),
      })) ?? [];

    await onVote(
      votes,
      () => toast.error("Voting error"),
      async () => {
        publishBallot();
        await router.push("/ballot/confirmation");
      },
    );
  }, [ballot, router, onVote, publishBallot]);

  const handleOpenDialog = useCallback(() => setOpen(true), [setOpen]);

  return (
    <>
      <Button variant="primary" onClick={handleOpenDialog}>
        submit your ballot
      </Button>

      <Dialog
        title="submit your ballot"
        size="sm"
        isOpen={isOpen}
        isLoading={isLoading}
        onOpenChange={setOpen}
        description="This is not a final submission. Once you submit your ballot, you can change it during the voting period."
        button="primary"
        buttonName="submit"
        buttonAction={handleSubmitBallot}
      />
    </>
  );
};
