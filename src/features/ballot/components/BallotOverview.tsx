import clsx from "clsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { type PropsWithChildren, type ReactNode, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { Alert } from "~/components/ui/Alert";
import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Progress } from "~/components/ui/Progress";
import { Spinner } from "~/components/ui/Spinner";
import { config } from "~/config";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useProjectCount, useProjectIdMapping } from "~/features/projects/hooks/useProjects";
import { formatNumber } from "~/utils/formatNumber";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { VotingEndsIn } from "./VotingEndsIn";

const BallotHeader = ({ children, ...props }: PropsWithChildren): JSX.Element => (
  <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-700 dark:text-gray-300" {...props}>
    {children}
  </h3>
);

const BallotSection = ({ title, children }: { title: string | ReactNode } & PropsWithChildren) => (
  <div className="space-y-1 text-gray-500">
    <h4 className="text-sm font-semibold ">{title}</h4>

    <div className="space-y-1 text-lg font-semibold">{children}</div>
  </div>
);

interface ISubmitBallotButtonProps {
  disabled?: boolean;
}

const SubmitBallotButton = ({ disabled = false }: ISubmitBallotButtonProps): JSX.Element => {
  const [isOpen, setOpen] = useState(false);
  const { isLoading, error, onVote } = useMaci();
  const { ballot, publishBallot } = useBallot();

  const projectIndices = useProjectIdMapping(ballot);

  const router = useRouter();

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const submit = {
    isLoading,
    error,
    mutate: async () => {
      const votes =
        ballot?.votes.map(({ amount, projectId }) => ({
          voteOptionIndex: BigInt(projectIndices[projectId]!),
          newVoteWeight: BigInt(amount),
        })) ?? [];

      await onVote(
        votes,
        () => {
          toast.error("Voting failed");
        },
        async () => {
          await router.push("/ballot/confirmation");
          publishBallot();
        },
      );
    },
  };

  const messages = {
    signing: {
      title: "Sign vote",
      instructions: "Confirm the transactions in your wallet to submit your vote.",
    },
    submitting: {
      title: "Submit vote",
      instructions: "Once you submit your vote, you won’t be able to change it. If you are ready, go ahead and submit!",
    },
    error: {
      title: "Error submitting vote",
      instructions: (
        <Alert title={submit.error ? (submit.error as { message?: string }).message : ""} variant="warning">
          There was an error submitting the vote.
        </Alert>
      ),
    },
  };

  const messageKey = submit.error ? "error" : "submitting";
  const { title, instructions } = messages[submit.isLoading ? "signing" : messageKey];

  return (
    <>
      <Button className="w-full" disabled={disabled} variant="primary" onClick={handleOpen}>
        Submit vote
      </Button>

      <Dialog isOpen={isOpen} size="sm" title={title} onOpenChange={setOpen}>
        <p className="pb-8">{instructions}</p>

        <div
          className={clsx("flex gap-2", {
            hidden: submit.isLoading,
          })}
        >
          <Button className="flex-1" variant="ghost" onClick={handleClose}>
            Back
          </Button>

          <Button className="flex-1" variant="primary" onClick={() => submit.mutate()}>
            Submit vote
          </Button>
        </div>
      </Dialog>
    </>
  );
};

const BallotOverview = () => {
  const router = useRouter();

  const { isRegistered, isEligibleToVote, initialVoiceCredits } = useMaci();
  const { sumBallot, ballot } = useBallot();

  const sum = sumBallot(ballot?.votes);

  const allocations = ballot?.votes ?? [];
  const canSubmit = router.route === "/ballot" && allocations.length;
  const viewBallot = router.route !== "/ballot" && allocations.length;

  const { data: projectCount } = useProjectCount();

  const appState = useAppState();

  const { address } = useAccount();

  if (appState === EAppState.LOADING) {
    return <Spinner className="h-6 w-6" />;
  }

  if (appState === EAppState.RESULTS) {
    return (
      <div className="flex flex-col items-center gap-2 pt-8 ">
        <BallotHeader>Results are live!</BallotHeader>

        <Button as={Link} href="/projects/results">
          Go to results
        </Button>
      </div>
    );
  }

  if (appState === EAppState.TALLYING) {
    return (
      <div className="flex flex-col items-center gap-2 pt-8 ">
        <BallotHeader>Voting has ended</BallotHeader>

        <BallotSection title="Results are being tallied" />
      </div>
    );
  }

  if (appState !== EAppState.VOTING) {
    return (
      <div className="flex flex-col items-center gap-2 pt-8 ">
        <BallotHeader>Voting has not started yet</BallotHeader>

        {appState === EAppState.REVIEWING ? (
          <BallotSection title="Applications are being reviewed" />
        ) : (
          <Button as={Link} className="border-1" href="/applications/new">
            Create application
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BallotHeader>Voting Round: {config.roundId}</BallotHeader>

      <BallotSection title="Voting ends in:">
        <VotingEndsIn />
      </BallotSection>

      {address && isRegistered && (
        <>
          <BallotHeader>Your vote</BallotHeader>

          <BallotSection title="Projects added:">
            <div>
              <span className="text-gray-900 dark:text-gray-300">{`${allocations.length}/${projectCount?.count}`}</span>
            </div>
          </BallotSection>

          <BallotSection
            title={
              <div className="flex justify-between">
                <span className="mr-1">{config.tokenName} allocated:</span>

                <div
                  className={clsx("text-gray-900 dark:text-gray-300", {
                    "text-primary-500": sum > initialVoiceCredits,
                  })}
                >
                  {`${formatNumber(sum)} ${config.tokenName}`}
                </div>
              </div>
            }
          >
            <Progress max={initialVoiceCredits} value={sum} />

            <div className="flex justify-between text-xs">
              <div>Total</div>

              <div>{`${formatNumber(initialVoiceCredits)} ${config.tokenName}`}</div>
            </div>
          </BallotSection>
        </>
      )}

      {isRegistered && isEligibleToVote ? (
        <>
          {ballot?.published && (
            <Button as={Link} className="w-full" href="/ballot/confirmation" variant="primary">
              View submitted vote
            </Button>
          )}

          {!ballot?.published && canSubmit && <SubmitBallotButton disabled={sum > initialVoiceCredits} />}

          {!ballot?.published && !canSubmit && viewBallot ? (
            <Button as={Link} className="w-full" href="/ballot" variant="primary">
              View my vote
            </Button>
          ) : (
            <Button disabled className="w-full" variant="primary">
              No projects added yet
            </Button>
          )}
        </>
      ) : null}
    </div>
  );
};

export default dynamic(() => Promise.resolve(BallotOverview), { ssr: false });
